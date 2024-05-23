import { IncomingMessage } from 'http' // eslint-disable-line

/**
 *  Follow [Writing structured logs](https://cloud.google.com/run/docs/logging#writing_structured_logs)
 *  doc to do logging.
 *
 *  @param {IncomingMessage} [req]
 *  @param {string} [projectId]
 *  @return {Object} globalLogFields
 */
function getGlobalLogFields(req, projectId) {
  const globalLogFields = {}

  // Add log correlation to nest all log messages beneath request log in Log Viewer.
  const traceHeader = req?.headers?.['x-cloud-trace-context']
  if (typeof traceHeader === 'string' && traceHeader !== '' && projectId) {
    const [trace] = traceHeader.split('/')
    globalLogFields[
      'logging.googleapis.com/trace'
    ] = `projects/${projectId}/traces/${trace}`
  }
  return globalLogFields
}

export default {
  getGlobalLogFields,
}
