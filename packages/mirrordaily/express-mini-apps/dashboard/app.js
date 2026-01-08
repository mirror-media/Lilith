import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'

/**
 *  @typedef {import('@keystone-6/core/types').KeystoneContext} KeystoneContext
 *
 *  @typedef {Object} DashboardServerConfig
 *  @property {string} origin
 *  @property {string} path
 *
 *  @param {Object} opts
 *  @param {DashboardServerConfig} opts.dashboardServer
 *  @param {KeystoneContext} opts.keystoneContext
 *  @returns {express.Router}
 */
export function createDashboardMiniApp({ dashboardServer, keystoneContext }) {
  const router = express.Router()

  /**
   *  Check if the request is sent by an authenticated admin user
   *  @param {express.Request} req
   *  @param {express.Response} res
   *  @param {express.NextFunction} next
   */
  const authenticationMw = async (req, res, next) => {
    const context = await keystoneContext.withRequest(req, res)
    // Check if user is logged in and has admin role
    if (context?.session?.data?.role === 'admin') {
      return next()
    }

    // If not logged in, redirect to signin page
    if (!context?.session?.data?.role) {
      return res.redirect('/signin')
    }

    // If logged in but not admin, show forbidden error
    res.status(403).send('Forbidden: Admin access required')
  }

  const dashboardProxyMiddleware = createProxyMiddleware({
    target: dashboardServer.origin,
    changeOrigin: true,
  })

  // Use router.use to handle all methods and paths under /dashboard
  router.use(dashboardServer.path, authenticationMw, dashboardProxyMiddleware)

  return router
}
