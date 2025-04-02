import type { ListConfig } from '@keystone-6/core'
import type {
  BaseFields,
  BaseItem,
  BaseListTypeInfo,
  ListHooks,
} from '@keystone-6/core/types'
import {
  createLogger,
  LogSeverity,
} from '@mirrormedia/subscription-webhooks-share'

type AfterOperationHook = ListHooks<BaseListTypeInfo>['afterOperation']

const log = createLogger()

function checkURLIsDesignated(
  invalidateCDNCacheURL: string | undefined
): invalidateCDNCacheURL is string {
  if (!invalidateCDNCacheURL) {
    log(LogSeverity.DEBUG, 'invalidateCDNCacheServerURL is not designated', {
      invalidateCDNCacheURL,
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

async function invalidateCache(
  invalidateCDNCacheURL: string,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  request: any
) {
  try {
    await requestAPI(invalidateCDNCacheURL, request)
  } catch (err) {
    const payload = { request, error: {} }

    if (err instanceof Error) {
      payload.error = {
        message: err.message ?? err.toString(),
        stack: err.stack,
      }
    }

    log(
      LogSeverity.ERROR,
      `Encountered error while invalidating CDN cache`,
      payload
    )
  }
}

/**
 * combine afterOperation functions
 */
function combineAfterOperationHooks<T extends AfterOperationHook>(
  ...hooks: T[]
) {
  // params is came from hooks : afterOperation, item...etc
  return async (params: Parameters<NonNullable<T>>[0]) => {
    await Promise.allSettled(
      hooks
        .filter((hook): hook is NonNullable<T> => typeof hook === 'function')
        .map((hook) => hook(params))
    )
  }
}

/**
  hooks: call invalidate CDN  cache API after operation
*/
export function invalidateCacheAfterOperation(
  list: ListConfig<BaseListTypeInfo, BaseFields<BaseListTypeInfo>>,
  invalidateCDNCacheURL: string | undefined,
  requestGenerator: (
    item: BaseItem | undefined,
    originalItem: BaseItem | undefined
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  ) => any
) {
  if (checkURLIsDesignated(invalidateCDNCacheURL) === false) return list

  // list's original hooks.afterOperation came from list
  const originalAfterOperation = list.hooks?.afterOperation

  // custom hooks.resolveInput
  const newAfterOperation: AfterOperationHook = async ({
    item,
    originalItem,
  }) => {
    const requestObj = requestGenerator(item, originalItem)
    // @ts-ignore: invalidateCDNCacheURL is string
    await invalidateCache(invalidateCDNCacheURL, requestObj)
  }

  // add custom hooks
  // combine the original hook and the custom one
  list.hooks = {
    ...list.hooks,
    afterOperation: combineAfterOperationHooks(
      originalAfterOperation,
      newAfterOperation
    ),
  }

  return list
}
