import envVar from '../environment-variables'
import {
  createLogger,
  LogSeverity,
} from '@mirrormedia/subscription-webhooks-share'

const { invalidateCDNCacheServerURL } = envVar
const log = createLogger()

function checkURLIsDesignated() {
  if (!invalidateCDNCacheServerURL) {
    log(LogSeverity.DEBUG, 'invalidateCDNCacheServerURL is not designated', {
      invalidateCDNCacheServerURL,
    })
    return false
  }
  return true
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function requestAPI(url: string, data: any) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export async function invalidateStoryCache(slug: any) {
  if (checkURLIsDesignated() === false) return

  const url = `${invalidateCDNCacheServerURL}/story`

  try {
    await requestAPI(url, { slug })
  } catch (err) {
    const payload = { slug, error: {} }

    if (err instanceof Error) {
      payload.error = {
        message: err.message ?? err.toString(),
        stack: err.stack,
      }
    }

    log(
      LogSeverity.ERROR,
      `Encountered error while invalidating story cache`,
      payload
    )
  }
}
