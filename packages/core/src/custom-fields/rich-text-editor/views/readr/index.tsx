import React from 'react'
import { Stack } from '@keystone-ui/core'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
  JSONValue,
} from '@keystone-6/core/types'
import { CellContainer, CellLink } from '@keystone-6/core/admin-ui/components'
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js'
// @ts-ignore: no type definitions
import Readr from '@mirrormedia/lilith-draft-editor/lib/website/readr'

const { RichTextEditor, decorators } = Readr.DraftEditor
export const Field = ({
  field,
  value,
  onChange,
  autoFocus, // eslint-disable-line
}: FieldProps<typeof controller>) => {
  return (
    <FieldContainer>
      <FieldLabel>
        {field.label}
        <Stack>
          <RichTextEditor
            disabledButtons={field.disabledButtons}
            editorState={value}
            onChange={
              // @ts-ignore: any
              (editorState) => onChange?.(editorState)
            }
          />
        </Stack>
      </FieldLabel>
    </FieldContainer>
  )
}

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  const value = item[field.path] + ''
  return linkTo ? (
    <CellLink {...linkTo}>{value}</CellLink>
  ) : (
    <CellContainer>{value}</CellContainer>
  )
}
Cell.supportsLinkTo = true

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path]}
    </FieldContainer>
  )
}

export const controller = (
  config: FieldControllerConfig<{ disabledButtons: string[] }>
): FieldController<EditorState, JSONValue> & { disabledButtons: string[] } => {
  return {
    disabledButtons: config.fieldMeta?.disabledButtons ?? [],
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: EditorState.createEmpty(decorators),
    deserialize: (data) => {
      const rawContentState = data[config.path]
      if (rawContentState === null) {
        return EditorState.createEmpty(decorators)
      }
      try {
        const contentState = convertFromRaw(rawContentState)
        const editorState = EditorState.createWithContent(
          contentState,
          decorators
        )
        return editorState
      } catch (err) {
        console.error(err)
        return EditorState.createEmpty(decorators)
      }
    },
    serialize: (editorState: EditorState) => {
      if (!editorState) {
        return { [config.path]: null }
      }

      try {
        const rawContentState = convertToRaw(editorState.getCurrentContent())
        return {
          [config.path]: rawContentState,
        }
      } catch (err) {
        console.error(err)
        return { [config.path]: null }
      }
    },
  }
}
