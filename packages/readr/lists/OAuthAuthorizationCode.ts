// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, text, timestamp } from '@keystone-6/core/fields'

const { allowRoles, admin } = utils.accessControl

/** Internal, short-lived and single-use records for OAuth authorization codes. */
export default list({
  fields: {
    codeHash: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    client: relationship({
      ref: 'OAuthClient',
      validation: { isRequired: true },
    }),
    user: relationship({ ref: 'User', validation: { isRequired: true } }),
    redirectUri: text({ validation: { isRequired: true } }),
    codeChallenge: text({ validation: { isRequired: true } }),
    scope: text({ validation: { isRequired: true } }),
    expiresAt: timestamp({ validation: { isRequired: true }, isIndexed: true }),
    usedAt: timestamp(),
  },
  access: {
    operation: {
      query: allowRoles(admin),
      create: allowRoles(admin),
      update: allowRoles(admin),
      delete: allowRoles(admin),
    },
  },
  ui: { isHidden: true },
})
