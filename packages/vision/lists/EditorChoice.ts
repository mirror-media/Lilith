import { list } from '@keystone-6/core'
import { integer, relationship, checkbox } from '@keystone-6/core/fields'
import { utils } from '@mirrormedia/lilith-core'

const listConfigurations = list({
  // ui: {
  //     isHidden: true,
  // },
  fields: {
    post: relationship({
      ref: 'Post',
      ui: {
        hideCreate: true,
        displayMode: 'select',
        labelField: 'name',
        cardFields: ['name', 'slug'],
        linkToItem: true,
        inlineConnect: true,
      },
      many: false,
    }),
    weight: integer({ label: '權重', defaultValue: 2 }),
    active: checkbox({ label: '啟用', defaultValue: true }),
  },
})

export default utils.addTrackingFields(listConfigurations)
