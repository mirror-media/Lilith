import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship,} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const validateRequiredFields = (
    fields: string[],
    resolvedData: Record<string, any>,
    addValidationError: (msg: string) => void
  ): void => {
    fields.forEach((field) => {
      if (!resolvedData[field]) {
        addValidationError(`The "${field}" field is required.`);
      }
    });
  };

const listConfigurations = list({
    fields: {
      informant: relationship({ 
            ref: 'Member', 
            many: false, 
            label: "發起人",
        }),
      reason: relationship({ 
            ref: 'ReportReason', 
            many: false, 
            label:'檢舉原因' 
        }),
      respondent: relationship({ 
            ref: 'Member',
            many: false,
            label:'被檢舉人', 
        }),
      comment: relationship({ 
            ref: 'Comment', 
            many: false,
            label:'被檢舉留言',
        }),
      collection: relationship({ 
            ref: 'Collection', 
            many: false,
            label:'被檢舉集錦',
        }),
    },
    hooks: {
        validateInput: ({ resolvedData, addValidationError }) => {
          validateRequiredFields(['informant', 'reason', 'respondent'], resolvedData, addValidationError);
        },
    },
    ui: {
      listView: {
        initialColumns: ['informant', 'respondent', 'reason', 'comment', 'collection'],
      },
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
  