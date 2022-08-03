import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, select } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  // ui: {
  //     isHidden: true,
  // },
  fields: {
    year: select({
      options: [
        { label: '2000', value: 2000 },
        { label: '2001', value: 2001 },
        { label: '2002', value: 2002 },
        { label: '2003', value: 2003 },
        { label: '2004', value: 2004 },
        { label: '2005', value: 2005 },
        { label: '2006', value: 2006 },
        { label: '2007', value: 2007 },
        { label: '2008', value: 2008 },
        { label: '2009', value: 2009 },
        { label: '2010', value: 2010 },
        { label: '2011', value: 2011 },
        { label: '2012', value: 2012 },
        { label: '2013', value: 2013 },
        { label: '2014', value: 2014 },
        { label: '2015', value: 2015 },
        { label: '2016', value: 2016 },
        { label: '2017', value: 2017 },
        { label: '2018', value: 2018 },
        { label: '2019', value: 2019 },
        { label: '2020', value: 2020 },
        { label: '2021', value: 2021 },
        { label: '2022', value: 2022 },
        { label: '2023', value: 2023 },
        { label: '2024', value: 2024 },
        { label: '2025', value: 2025 },
        { label: '2026', value: 2026 },
        { label: '2027', value: 2027 },
        { label: '2028', value: 2028 },
        { label: '2029', value: 2029 },
        { label: '2030', value: 2030 },
      ],
      // We want to make sure new posts start off as a draft when they are created
      defaultValue: '2022',
      // fields also have the ability to configure their appearance in the Admin UI
    }),
    name: text({
      label: '獎項名稱*',
      validation: { isRequired: true },
    }),
    report: text({
      label: '報導名稱*',
      validation: { isRequired: true },
    }),
    url: text({
      label: '報導連結(optional)',
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
