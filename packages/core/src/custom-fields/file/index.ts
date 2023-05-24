import { FileUpload } from 'graphql-upload'
// import { userInputError } from '../../../lib/core/graphql-errors'
import { userInputError } from '../utils/graphql-errors'
import { resolveView } from '../resolve-view'

import {
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  BaseListTypeInfo,
  KeystoneContext,
  FileData,
} from '@keystone-6/core/types'
import { graphql } from '@keystone-6/core'

import { getFileRef } from './utils'

export type CustomFileFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    customConfig?: {
      fileType?: 'file' | 'image' | 'audio' | 'video'
    }
  }

const CustomFileFieldInput = graphql.inputObject({
  name: 'CustomFileFieldInput',
  fields: {
    upload: graphql.arg({ type: graphql.Upload }),
    ref: graphql.arg({ type: graphql.String }),
  },
})

type CustomFileFieldInputType =
  | undefined
  | null
  | { upload?: Promise<FileUpload> | null; ref?: string | null }

const fileFields = graphql.fields<FileData>()({
  filename: graphql.field({ type: graphql.nonNull(graphql.String) }),
  filesize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
  ref: graphql.field({
    type: graphql.nonNull(graphql.String),
    resolve(data) {
      return getFileRef(data.mode, data.filename)
    },
  }),
  url: graphql.field({
    type: graphql.nonNull(graphql.String),
    resolve(data, args, context) {
      if (!context.files) {
        throw new Error(
          'File context is undefined, this most likely means that you havent configurd keystone with a file config, see https://keystonejs.com/docs/apis/config#files for details'
        )
      }
      return context.files.getUrl(data.mode, data.filename)
    },
  }),
})

const CustomFileFieldOutput = graphql.interface<FileData>()({
  name: 'CustomFileFieldOutput',
  fields: fileFields,
  resolveType: (val) =>
    val.mode === 'local'
      ? 'LocalCustomFileFieldOutput'
      : 'CloudCustomFileFieldOutput',
})

const LocalCustomFileFieldOutput = graphql.object<FileData>()({
  name: 'LocalCustomFileFieldOutput',
  interfaces: [CustomFileFieldOutput],
  fields: fileFields,
})

const CloudCustomFileFieldOutput = graphql.object<FileData>()({
  name: 'CloudCustomFileFieldOutput',
  interfaces: [CustomFileFieldOutput],
  fields: fileFields,
})

async function inputResolver(
  data: CustomFileFieldInputType,
  context: KeystoneContext
) {
  if (data === null || data === undefined) {
    return { mode: data, filename: data, filesize: data }
  }

  if (data.ref) {
    if (data.upload) {
      throw userInputError(
        'Only one of ref and upload can be passed to CustomFileFieldInput'
      )
    }
    return context.files!.getDataFromRef(data.ref)
  }
  if (!data.upload) {
    throw userInputError(
      'Either ref or upload must be passed to CustomFileFieldInput'
    )
  }
  const upload = await data.upload
  return context.files!.getDataFromStream(
    upload.createReadStream(),
    upload.filename
  )
}

export const CustomFile =
  <ListTypeInfo extends BaseListTypeInfo>(
    config: CustomFileFieldConfig<ListTypeInfo> = {}
  ): FieldTypeFunc<ListTypeInfo> =>
  () => {
    if ((config as any).isIndexed === 'unique') {
      throw Error(
        "isIndexed: 'unique' is not a supported option for field type file"
      )
    }

    return fieldType({
      customConfig: {
        isImage: config.customConfig?.fileType || 'file',
      },
      kind: 'multi',
      fields: {
        filesize: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        mode: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        filename: { kind: 'scalar', scalar: 'String', mode: 'optional' },
      },
    })({
      ...config,
      input: {
        create: {
          arg: graphql.arg({ type: CustomFileFieldInput }),
          resolve: inputResolver,
        },
        update: {
          arg: graphql.arg({ type: CustomFileFieldInput }),
          resolve: inputResolver,
        },
      },
      output: graphql.field({
        type: CustomFileFieldOutput,
        resolve({ value: { filesize, filename, mode } }) {
          if (
            filesize === null ||
            filename === null ||
            mode === null ||
            (mode !== 'local' && mode !== 'cloud')
          ) {
            return null
          }
          return { mode, filename, filesize }
        },
      }),
      unreferencedConcreteInterfaceImplementations: [
        LocalCustomFileFieldOutput,
        CloudCustomFileFieldOutput,
      ],
      views: require.resolve('./views'),
      getAdminMeta() {
        return {
          customConfig: {
            fileType: config.customConfig.fileType,
          },
        }
      },
    })
  }
