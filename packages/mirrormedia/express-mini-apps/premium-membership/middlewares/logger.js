import express from 'express' // eslint-disable-line
import utils from '../utils'

/**
 *  Create an express middleware to log request.
 *  @param {string} projectId
 *  @return {express.RequestHandler} express middleware
 */
export function createLoggerMw(projectId) {
  return (req, res, next) => {
    const globalLogFields = utils.getGlobalLogFields(req, projectId)

    console.log(
      JSON.stringify({
        severity: 'INFO',
        message: `Request: ${req.method} ${req.originalUrl}`,
        debugPayload: {
          'req.headers': {
            'Content-Length': req.get('Content-Length'),
            'Content-Type': req.get('Content-Type'),
            Authorization: req.get('Authorization'),
          },
          'req.body': req.body,
        },
        ...globalLogFields,
      })
    )

    res.locals.globalLogFields = globalLogFields

    next()
  }
}
