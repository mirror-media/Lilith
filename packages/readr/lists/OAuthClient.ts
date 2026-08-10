// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { checkbox, json, text } from '@keystone-6/core/fields'

const { allowRoles, admin } = utils.accessControl

/** Public OAuth clients. Redirect URIs are exact-match allowlisted. */
export default list({
  fields: {
    name: text({ validation: { isRequired: true }, label: 'Client name' }),
    clientId: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
      label: 'OAuth client ID',
    }),
    redirectUris: json({
      validation: { isRequired: true },
      label: 'Allowed redirect URIs',
      ui: { description: 'JSON array; each URI must match exactly.' },
    }),
    allowedScopes: json({
      validation: { isRequired: true },
      defaultValue: ['readr.posts.read'],
      label: 'Allowed scopes',
    }),
    isActive: checkbox({ defaultValue: true, label: 'Active' }),
  },
  access: {
    operation: {
      query: allowRoles(admin),
      create: allowRoles(admin),
      update: allowRoles(admin),
      delete: allowRoles(admin),
    },
  },
})
