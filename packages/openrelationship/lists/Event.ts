import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { checkbox, relationship, json, timestamp, text } from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '名稱',
      validation: { isRequired: true }
    }),
    description: text({ label: '敘述' }),
    start_date: text({ label: 'start_date' }),
    end_date: text({ label: '結束日期' }),
    location: text({ label: '位置' }),
    status: text({ label: '狀態' }),
    identifier: text({ label: 'identifier' }),
    motion: text({ label: 'motion' }),
    classification: text({ label: 'classification' }),
    organization: text({ label: '組織' }),
    attendees: text({ label: '參與者' }),
    parent: text({ label: '主要活動' }),
    sub: text({ label: '附屬活動' }),
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
