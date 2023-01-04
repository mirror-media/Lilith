/**
 *  Follow [Writing structured logs](https://cloud.google.com/run/docs/logging#writing_structured_logs)
 *  doc to do logging.
 *
 *  @param {Object} req
 *  @param {Function} req.header
 *  @param {string} projectId
 *  @return {Object} globalLogFields
 */
function getGlobalLogFields(req, projectId) {
  const globalLogFields = {}

  // Add log correlation to nest all log messages beneath request log in Log Viewer.
  const traceHeader = req.header('X-Cloud-Trace-Context')
  if (traceHeader && projectId) {
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
