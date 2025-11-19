import express from 'express'

import { createProxyMiddleware } from 'http-proxy-middleware'

/**
 *  @typedef {import('@keystone-6/core/types').KeystoneContext} KeystoneContext
 *
 *  @typedef {Object} PreviewServerConfig
 *  @property {string} origin
 *  @property {string} path
 *
 *  @param {Object} opts
 *  @param {PreviewServerConfig} opts.previewServer
 *  @param {KeystoneContext} opts.keystoneContext
 *  @returns {express.Router}
 */
export function createPreviewMiniApp({ previewServer, keystoneContext }) {
  const router = express.Router()

  /**
   *  Check if the request is sent by an authenticated user
   *  @param {express.Request} req
   *  @param {express.Response} res
   *  @param {express.NextFunction} next
   */
  const authenticationMw = async (req, res, next) => {
    const context = await keystoneContext.withRequest(req, res)
    // User has been logged in
    if (context?.session?.data?.role) {
      return next()
    }

    // Otherwise, redirect them to login page
    res.redirect('/signin')
  }

  const previewProxyMiddleware = createProxyMiddleware({
    target: previewServer.origin,
    changeOrigin: true,
    onProxyRes: (proxyRes) => {
      // The response from preview nuxt server might be with Cache-Control header.
      // However, we don't want to get cached responses for `draft` posts.
      // Therefore, we do not cache html response intentionlly by overwritting the Cache-Control header.
      proxyRes.headers['cache-control'] = 'no-store'
    },
  })

  // proxy preview server traffic to subdirectory to prevent path collision between CMS and preview server
  router.get(
    '/images-next/*',
    createProxyMiddleware({
      target: previewServer.origin,
      changeOrigin: true,
    })
  )

  router.get(
    `${previewServer.path}/*`,
    authenticationMw,
    previewProxyMiddleware
  )

  router.use(
    `${previewServer.path}/_next/*`,
    createProxyMiddleware({
      target: previewServer.origin,
      changeOrigin: true,
    })
  )

  return router
}
