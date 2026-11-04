import { GoogleAuth, IdTokenClient } from 'google-auth-library'
import envVar from '../environment-variables'

const auth = new GoogleAuth()
let idTokenClient: Promise<IdTokenClient> | undefined
// Last Authorization header that was successfully minted. Reused when a
// refresh fails (e.g. metadata server hiccup).
let lastAuthorization: string | undefined

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

async function getAuthorization(): Promise<string> {
  try {
    const client = await getIdTokenClient()
    // google-auth-library v9 returns a plain object, v10 a Headers instance.
    const Authorization = new Headers(
      (await client.getRequestHeaders()) as HeadersInit
    ).get('Authorization')
    if (!Authorization) {
      throw new Error('no Authorization header returned')
    }
    lastAuthorization = Authorization
    return Authorization
  } catch (err) {
    if (lastAuthorization) {
      console.warn(
        '[DATA-SERVICE] Failed to refresh ID token, reusing the previous one:',
        (err as Error).message
      )
      return lastAuthorization
    }
    throw new Error(
      `[DATA-SERVICE] Failed to get ID token: ${(err as Error).message}`
    )
  }
}

/**
 * fetch() against data-services with a Google-signed ID token so the call
 * passes Cloud Run's invoker IAM check. Never sends an anonymous request:
 * throws when no ID token can be obtained.
 */
export async function fetchDataService(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = baseUrl() + path
  const headers = new Headers(init.headers)
  headers.set('Authorization', await getAuthorization())
  return fetch(url, { ...init, headers })
}
