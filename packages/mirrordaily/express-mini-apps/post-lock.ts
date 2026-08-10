import express from 'express'
import type { KeystoneContext } from '@keystone-6/core/types'
import envVar from '../environment-variables'
import { UserRole } from '../type'
import { computeLockExpireAt } from '../utils/post-lock'

type PostLockMiniAppOptions = {
  keystoneContext: KeystoneContext
}

// Coerce an untrusted request body value into a positive integer post id.
// Returns null for missing / non-numeric / array / object inputs so callers
// never pass NaN or a coerced value into Prisma.
function parsePostId(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) return null
  return id
}

export function createPostLockMiniApp({
  keystoneContext,
}: PostLockMiniAppOptions) {
  const router = express.Router()

  // POST /api/post-lock/heartbeat
  // Extend lockExpireAt = now + LOCK_DURATION
  router.post('/api/post-lock/heartbeat', async (req, res) => {
    try {
      const context = await keystoneContext.withRequest(req, res)
      const userId = context.session?.data?.id

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
      }

      const postId = parsePostId(req.body?.postId)
      if (postId === null) {
        return res
          .status(400)
          .json({ success: false, message: 'postId is required' })
      }

      const newLockExpireAt = computeLockExpireAt(envVar.lockDuration)

      // Only the current lock holder can refresh the lock
      const result = await context.prisma.Post.updateMany({
        where: {
          id: postId,
          lockById: Number(userId),
        },
        data: {
          lockExpireAt: newLockExpireAt,
        },
      })

      if (result.count === 1) {
        return res.json({ success: true, lockExpireAt: newLockExpireAt })
      }

      return res
        .status(409)
        .json({ success: false, message: 'Lock not held by current user' })
    } catch (error) {
      console.error('[PostLock] Heartbeat error:', error)
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' })
    }
  })

  // POST /api/post-lock/release
  // Release the lock: lockBy = null, lockExpireAt = null
  router.post('/api/post-lock/release', async (req, res) => {
    try {
      const context = await keystoneContext.withRequest(req, res)
      const userId = context.session?.data?.id
      const userRole = context.session?.data?.role

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
      }

      const postId = parsePostId(req.body?.postId)
      if (postId === null) {
        return res
          .status(400)
          .json({ success: false, message: 'postId is required' })
      }

      // Admin can release any lock; others can only release their own
      const whereCondition =
        userRole === UserRole.Admin
          ? { id: postId }
          : { id: postId, lockById: Number(userId) }

      const result = await context.prisma.Post.updateMany({
        where: whereCondition,
        data: {
          lockById: null,
          lockExpireAt: null,
        },
      })

      if (result.count === 1) {
        return res.json({ success: true })
      }

      return res
        .status(409)
        .json({ success: false, message: 'Lock not held by current user' })
    } catch (error) {
      console.error('[PostLock] Release error:', error)
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' })
    }
  })

  return router
}
