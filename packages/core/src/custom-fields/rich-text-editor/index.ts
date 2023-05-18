import {
  BaseListTypeInfo,
  JSONValue,
  FieldTypeFunc,
  CommonFieldConfig,
  jsonFieldTypePolyfilledForSQLite,
} from '@keystone-6/core/types'
import { graphql } from '@keystone-6/core'

export type JsonFieldConfig<
  ListTypeInfo extends BaseListTypeInfo
> = CommonFieldConfig<ListTypeInfo> & {
  defaultValue?: JSONValue
  db?: { map?: string }
  disabledButtons: string[]
  website: 'mirrormedia' | 'readr' | 'editools' | 'mesh'
}

export const richTextEditor = <ListTypeInfo extends BaseListTypeInfo>({
  defaultValue = null,
  disabledButtons = [],
  website,
  ...config
}: JsonFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> => (
  meta
) => {
  if (!website) {
    throw Error(
      'required property `website` was not provided in calling richTextEditor'
    )
  }
  if ((config as any).isIndexed === 'unique') {
    throw Error(
      "isIndexed: 'unique' is not a supported option for field type textEditor"
    )
  }

  const resolve = (val: JSONValue | undefined) =>
    val === null && meta.provider === 'postgresql' ? 'DbNull' : val

  return jsonFieldTypePolyfilledForSQLite(
    meta.provider,
    {
      ...config,
      input: {
        create: {
          arg: graphql.arg({ type: graphql.JSON }),
          resolve(val) {
            return resolve(val === undefined ? defaultValue : val)
          },
        },
        update: { arg: graphql.arg({ type: graphql.JSON }), resolve },
      },
      output: graphql.field({ type: graphql.JSON }),
      views: `@mirrormedia/lilith-core/lib/custom-fields/rich-text-editor/views/${website}`,
      getAdminMeta: () => ({ defaultValue, disabledButtons }),
    },
    {
      default:
        defaultValue === null
          ? undefined
          : {
              kind: 'literal',
              value: JSON.stringify(defaultValue),
            },
      map: config.db?.map,
    }
  )
}
