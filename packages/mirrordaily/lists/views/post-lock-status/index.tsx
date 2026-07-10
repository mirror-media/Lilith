/** @jsxRuntime classic */
/** @jsx jsx */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx } from '@keystone-ui/core'
import { FieldContainer } from '@keystone-ui/fields'
import {
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from '@keystone-6/core/types'
import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from '@keystone-6/core/admin-ui/router'

const HEARTBEAT_INTERVAL = 3 * 60 * 1000 // 3 minutes
// With a 3-minute interval, 3 consecutive failures ≈ 9 minutes without a
// successful refresh — right before the (default 10-minute) lock expires.
const MAX_CONSECUTIVE_FAILURES = 3

type LockWarning = 'lock-taken' | 'session-expired' | 'heartbeat-failing'

const WARNING_MESSAGES: Record<LockWarning, string> = {
  'lock-taken': '鎖定已失效，其他人可能已接管編輯。請重新整理頁面。',
  'session-expired': '登入已過期，無法繼續為文章保持鎖定。請重新登入。',
  'heartbeat-failing':
    '持續無法連線伺服器更新鎖定，鎖定可能已過期，其他人可能接管編輯。',
}

function PostLockHeartbeatUI({ postId }: { postId: string }) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)
  const lockLostRef = useRef(false)
  const failureCountRef = useRef(0)
  const [warning, setWarning] = useState<LockWarning | null>(null)
  const [releasing, setReleasing] = useState(false)
  const [releaseError, setReleaseError] = useState(false)
  const router = useRouter()

  const stopHeartbeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Stop polling for good and surface a warning. Tracked via a ref so the
  // effect below doesn't have to re-run (which would restart polling).
  const giveUpHeartbeat = useCallback(
    (reason: LockWarning) => {
      lockLostRef.current = true
      stopHeartbeat()
      if (mountedRef.current) setWarning(reason)
    },
    [stopHeartbeat]
  )

  const sendHeartbeat = useCallback(async () => {
    try {
      const res = await fetch('/api/post-lock/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: Number(postId) }),
      })
      if (res.ok) {
        failureCountRef.current = 0
        return
      }
      // Only these statuses are definitive: 409 means the lock is no longer
      // held by this user; 401 means the session is gone and no future
      // heartbeat can succeed. Anything else (5xx during a deploy, gateway
      // errors) is transient — the lock is still ours server-side.
      if (res.status === 409) return giveUpHeartbeat('lock-taken')
      if (res.status === 401) return giveUpHeartbeat('session-expired')
    } catch {
      // Network error — transient, same as 5xx
    }
    failureCountRef.current += 1
    if (failureCountRef.current >= MAX_CONSECUTIVE_FAILURES) {
      // The lock may have expired server-side by now; stop pretending we
      // still hold it.
      giveUpHeartbeat('heartbeat-failing')
    }
  }, [postId, giveUpHeartbeat])

  const sendRelease = useCallback(() => {
    const data = JSON.stringify({ postId: Number(postId) })
    navigator.sendBeacon(
      '/api/post-lock/release',
      new Blob([data], { type: 'application/json' })
    )
  }, [postId])

  const startHeartbeat = useCallback(() => {
    if (intervalRef.current || lockLostRef.current) return
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)
  }, [sendHeartbeat])

  useEffect(() => {
    mountedRef.current = true
    startHeartbeat()

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopHeartbeat()
      } else {
        sendHeartbeat().then(() => {
          if (mountedRef.current && !document.hidden && !lockLostRef.current) {
            startHeartbeat()
          }
        })
      }
    }

    const handleBeforeUnload = () => {
      sendRelease()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      mountedRef.current = false
      stopHeartbeat()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // The Keystone admin is an SPA: leaving the editor through the sidebar
      // is client-side navigation, which unmounts this component without ever
      // firing beforeunload. Release here too, or the lock would stay held
      // until lockExpireAt. Skip when the lock is already gone — releasing
      // would just 409.
      if (!lockLostRef.current) sendRelease()
    }
  }, [startHeartbeat, stopHeartbeat, sendHeartbeat, sendRelease])

  const handleRelease = useCallback(async () => {
    setReleasing(true)
    setReleaseError(false)
    try {
      const res = await fetch('/api/post-lock/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: Number(postId) }),
      })
      // 409 means the lock is no longer held by this user (e.g. an Admin
      // already cleared it). The user's intent — leaving the editor without
      // holding the lock — is satisfied either way, so navigate away cleanly
      // and only treat genuine failures (5xx / network) as errors.
      if (res.ok || res.status === 409) {
        // Mark the lock as gone so the unmount cleanup triggered by
        // router.push doesn't beacon a second (guaranteed-409) release.
        lockLostRef.current = true
        stopHeartbeat()
        router.push('/posts')
        return
      }
      setReleaseError(true)
    } catch {
      setReleaseError(true)
    } finally {
      if (mountedRef.current) setReleasing(false)
    }
  }, [postId, stopHeartbeat, router])

  if (warning) {
    return (
      <FieldContainer>
        <div
          css={{
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            color: '#991b1b',
            fontSize: 14,
          }}
        >
          {WARNING_MESSAGES[warning]}
        </div>
      </FieldContainer>
    )
  }

  return (
    <FieldContainer>
      <button
        onClick={handleRelease}
        type="button"
        disabled={releasing}
        css={{
          padding: '8px 16px',
          backgroundColor: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: 6,
          cursor: releasing ? 'not-allowed' : 'pointer',
          fontSize: 14,
          opacity: releasing ? 0.6 : 1,
          ':hover': {
            backgroundColor: releasing ? '#f3f4f6' : '#e5e7eb',
          },
        }}
      >
        {releasing ? '釋放中…' : '完成編輯（釋放鎖定）'}
      </button>
      {releaseError && (
        <div
          css={{
            marginTop: 8,
            fontSize: 13,
            color: '#991b1b',
          }}
        >
          釋放鎖定失敗，請稍後再試。
        </div>
      )}
    </FieldContainer>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Field = (props: FieldProps<typeof controller>) => {
  const router = useRouter()
  const { id } = router.query

  if (typeof id !== 'string' || isNaN(Number(id))) return null

  return <PostLockHeartbeatUI postId={id} />
}

type LockStatusController = FieldController<null>

export const controller = (
  config: FieldControllerConfig
): LockStatusController => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path}`,
    defaultValue: null,
    deserialize() {
      return null
    },
    serialize() {
      return {}
    },
  }
}
