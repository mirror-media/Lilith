import express from 'express'

/**
 *  @typedef {import('@keystone-6/core/types').KeystoneContext} KeystoneContext
 *
 *  @param {Object} opts
 *  @param {KeystoneContext} opts.keystoneContext
 *  @returns {express.Router}
 */
export function createImageAuthMiniApp({ keystoneContext }) {
  const router = express.Router()

  /**
   *  Check if the request is sent by an authenticated user
   *  @param {express.Request} req
   *  @param {express.Response} res
   *  @param {express.NextFunction} next
   */
  const authenticationMw = async (req, res, next) => {
    const context = await keystoneContext.withRequest(req, res)
    if (context?.session?.data) {
      return next()
    }
    res.status(401).send('Unauthorized')
  }

  // Protect /images path. /files and /video-files reserved for future use.
  router.use('/images', authenticationMw)

  return router
}
