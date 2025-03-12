import React from 'react'
import { Stack } from '@keystone-ui/core'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import type {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
  JSONValue,
} from '@keystone-6/core/types'
import { CellContainer, CellLink } from '@keystone-6/core/admin-ui/components'
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js'

type Controller = ReturnType<typeof createController>

export function createController(decorators: any) {
  return (
    config: FieldControllerConfig<{
      disabledButtons?: string[]
      hideOnMobileButtons?: string[]
    }>
  ): FieldController<EditorState, JSONValue> & {
    disabledButtons: string[]
    hideOnMobileButtons: string[]
  } => {
    return {
      disabledButtons: config.fieldMeta?.disabledButtons ?? [],
      hideOnMobileButtons: config.fieldMeta?.hideOnMobileButtons ?? [],
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
}

export function createField(RichTextEditor: any) {
  return ({
    field,
    value,
    onChange,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    autoFocus,
  }: FieldProps<Controller>) => {
    return (
      <FieldContainer>
        <FieldLabel>
          {field.label}
          <Stack>
            <RichTextEditor
              disabledButtons={field.disabledButtons}
              hideOnMobileButtons={field.hideOnMobileButtons}
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
}

export function createCardValue(): CardValueComponent {
  return ({ item, field }) => {
    return (
      <FieldContainer>
        <FieldLabel>{field.label}</FieldLabel>
        {item[field.path]}
      </FieldContainer>
    )
  }
}

export function createCell(): CellComponent {
  const Cell: CellComponent = ({ item, field, linkTo }) => {
    const value = item[field.path] + ''
    return linkTo ? (
      <CellLink {...linkTo}>{value}</CellLink>
    ) : (
      <CellContainer>{value}</CellContainer>
    )
  }
  Cell.supportsLinkTo = true
  return Cell
}
