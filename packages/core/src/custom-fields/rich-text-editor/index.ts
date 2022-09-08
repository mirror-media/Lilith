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
}

export const richTextEditor = <ListTypeInfo extends BaseListTypeInfo>({
  defaultValue = null,
  disabledButtons = [],
  ...config
}: JsonFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> => (
  meta
) => {
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
      views: require.resolve('./views'),
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
