import axios from 'axios'
import errors from '@twreporter/errors'
import express from 'express' // eslint-disable-line

/**
 *  This function creates an Express middleware.
 *  The created middleware could be used to validate the request authentication
 *  by firebase admin SDK.
 *
 *  The middleware also set decoded token object into `res.locals.auth.decodedIdToken`.
 *
 *  @param {Object} opts
 *  @param {string} opts.apiUrl
 *  @return {express.RequestHandler} express middleware
 */
export function queryMemberInfoFromIsrafel(opts) {
  return async (req, res, next) => {
    const firebaseId = res.locals.auth?.decodedIdToken?.uid

    const query = `
  query {
    allMembers(where: { firebaseId: "${firebaseId}"}) {
      id
      firebaseId
      type
      email
    }
  }
`

    let apiRes
    try {
      apiRes = await axios.post(opts.apiUrl, {
        query,
      })
    } catch (axiosErr) {
      const annotatingError = errors.helpers.wrap(
        errors.helpers.annotateAxiosError(axiosErr),
        'MemberInfoError',
        'Error to request GQL server'
      )
      next(annotatingError)
      return
    }

    const { data, errors: gqlErrors } = apiRes.data

    if (gqlErrors) {
      const annotatingError = errors.helpers.wrap(
        new Error('Errors occured while fetching member info.'),
        'MemberInfoError',
        'GQLError: Errors returned in `member` query',
        { gqlErrors }
      )
      next(annotatingError)
      return
    }

    // set `res.locals.auth.memberInfo` for next middlewares
    res.locals.memberInfo = data?.allMembers?.[0]

    next()
  }
}
