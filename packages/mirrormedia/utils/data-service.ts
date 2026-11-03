import { GoogleAuth, IdTokenClient } from 'google-auth-library'
import envVar from '../environment-variables'

const auth = new GoogleAuth()
let idTokenClient: Promise<IdTokenClient> | undefined

function baseUrl(): string {
  if (typeof envVar.dataServiceApi !== 'string' || !envVar.dataServiceApi) {
    throw new Error('DATA_SERVICE_API is not set')
  }
  return envVar.dataServiceApi
}

// Cloud Run validates the ID token's audience against the service URL.
export function dataServiceAudience(): string {
  return new URL(baseUrl()).origin
}

function getIdTokenClient(): Promise<IdTokenClient> {
  if (!idTokenClient) {
    idTokenClient = auth.getIdTokenClient(dataServiceAudience())
    idTokenClient.catch(() => {
      idTokenClient = undefined
    })
  }
  return idTokenClient
}

/**
 * fetch() against data-services with a Google-signed ID token so the call
 * passes Cloud Run's invoker IAM check. Falls back to an anonymous request
 * when no credential is available (local development).
 */
export async function fetchDataService(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = baseUrl() + path
  const headers = new Headers(init.headers)
  try {
    const client = await getIdTokenClient()
    const { Authorization } = await client.getRequestHeaders()
    if (Authorization) {
      headers.set('Authorization', Authorization)
    }
  } catch (err) {
    console.warn(
      '[DATA-SERVICE] Failed to get ID token, sending anonymous request:',
      (err as Error).message
    )
  }
  return fetch(url, { ...init, headers })
}
