import express from 'express'
import { KeystoneContext } from '@keystone-6/core/types' // eslint-disable-line

import { createProxyMiddleware } from 'http-proxy-middleware'

/**
 *  @param {Object} opts
 *  @param {string} opts.previewServerOrigin
 *  @param {KeystoneContext} opts.keystoneContext
 *  @returns {express.Router}
 */
export function createPreviewMiniApp({ previewServerOrigin, keystoneContext }) {
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
    target: previewServerOrigin,
    changeOrigin: true,
    onProxyRes: (proxyRes) => {
      // The response from preview nuxt server might be with Cache-Control header.
      // However, we don't want to get cached responses for `draft` posts.
      // Therefore, we do not cache html response intentionlly by overwritting the Cache-Control header.
      proxyRes.headers['cache-control'] = 'no-store'
    },
  })

  // Proxy requests with `/story/id` url path to preview nuxt server
  router.get('/story/:slug', authenticationMw, previewProxyMiddleware)

  // Proxy requests with `/event/:slug` url path to preview nuxt server
  //router.get('/event/:slug', authenticationMw, previewProxyMiddleware)

  // Proxy requests with `/news/:id` url path to preview nuxt server
  router.get('/projects/:slug', authenticationMw, previewProxyMiddleware)

  // Proxy requests with `/_nuxt/*` url path to preview nuxt server
  router.use(
    '/_nuxt/*',
    createProxyMiddleware({
      target: previewServerOrigin,
      changeOrigin: true,
    })
  )
  return router
}
