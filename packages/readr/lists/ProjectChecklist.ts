// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { checkbox, relationship, text } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    project: relationship({
      label: '專題',
      ref: 'Post.project',
      many: false,
    }),
    asanaCheck: checkbox({
      label: 'Asana 功能驗收',
    }),
    uiCheck: checkbox({
      label: '各瀏覽器 UI 驗收',
    }),
    performanceCheck: checkbox({
      label: '各瀏覽器效能驗收',
    }),
    ga: checkbox({
      label: 'PV GA 驗收',
    }),
    gtm: checkbox({
      label: 'GTM 驗收',
    }),
    og: checkbox({
      label: 'OG 驗收',
    }),
    module: text({
      label: '這個專題用到什麼模板/embedded code',
      ui: { displayMode: 'textarea' },
    }),
    document: text({
      label: '相關文件（定稿、設計稿、工程需求文件',
      ui: { displayMode: 'textarea' },
    }),
    asana: text({
      label: 'asana 連結',
    }),
    tracking: text({
      label: '要持續追蹤的功能跟驗證方式',
      ui: { displayMode: 'textarea' },
    }),
    sourceCode: text({
      label: 'source code URL',
    }),
    gaLink: text({
      label: 'GA Report 連結',
    }),
    retro: text({
      label: 'retro 結果紀錄',
      ui: { displayMode: 'textarea' },
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
