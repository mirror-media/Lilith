import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, timestamp } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  // ui: {
  //     isHidden: true,
  // },
  fields: {
    name: text({
      label: '中文獎項名稱*',
      validation: { isRequired: true },
    }),
    name_en: text({
      label: '英文獎項名稱*',
      validation: { isRequired: true },
    }),
    report: text({
      label: '報導中文標題*',
      validation: { isRequired: true },
    }),
    report_en: text({
      label: '報導英文標題*',
      validation: { isRequired: true },
    }),
    url: text({
      label: '報導連結(optional)',
    }),
    desc: text({
      label: '中文描述(optional)',
    }),
    desc_en: text({
      label: '英文描述(optional)',
    }),
    awardTime: timestamp({
      isIndexed: true,
      label: '得獎日期',
    }),
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
