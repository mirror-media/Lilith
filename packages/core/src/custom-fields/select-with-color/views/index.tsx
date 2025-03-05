/** @jsxRuntime classic */
/** @jsx jsx */
import { Fragment, useState } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx, Stack } from '@keystone-ui/core'
import {
  FieldContainer,
  FieldDescription,
  FieldLabel,
  MultiSelect,
  Radio,
  Select,
} from '@keystone-ui/fields'
import { SegmentedControl } from '@keystone-ui/segmented-control'
import { Button } from '@keystone-ui/button'
import { Text } from '@keystone-ui/core'
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-6/core/types'
import { CellContainer, CellLink } from '@keystone-6/core/admin-ui/components'

export const Field = ({
  field,
  value,
  onChange,
  autoFocus,
  forceValidation,
}: FieldProps<typeof controller>) => {
  const [hasChanged, setHasChanged] = useState(false)
  const validationMessage =
    (hasChanged || forceValidation) && !validate(value, field.isRequired) ? (
      <Text color="red600" size="small">
        {field.label} is required
      </Text>
    ) : null

  const colorSpan = (color = 'transparent') => ({
    alignItems: 'center',
    display: 'flex',

    ':before': {
      backgroundColor: color,
      borderRadius: 8,
      content: '" "',
      display: 'block',
      marginRight: 8,
      height: 20,
      width: 20,
    },
  })

  return (
    <FieldContainer as={field.displayMode === 'select' ? 'div' : 'fieldset'}>
      {field.displayMode === 'select' ? (
        <Fragment>
          <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
          <FieldDescription id={`${field.path}-description`}>
            {field.description}
          </FieldDescription>
          <Select
            id={field.path}
            isClearable
            autoFocus={autoFocus}
            options={field.options}
            isDisabled={onChange === undefined}
            onChange={(newVal) => {
              onChange?.({ ...value, value: newVal })
              setHasChanged(true)
            }}
            value={value.value}
            aria-describedby={
              field.description === null
                ? undefined
                : `${field.path}-description`
            }
            portalMenu
            styles={{
              option: (styles, { data }) => {
                if (field.shouldShowColorSpan) {
                  const color = (data as Option).color
                  return {
                    ...styles,
                    ...colorSpan(color),
                  }
                } else {
                  return styles
                }
              },
              singleValue: (styles, { data }) => {
                if (field.shouldShowColorSpan) {
                  const color = (data as Option).color
                  return {
                    ...styles,
                    ...colorSpan(color),
                  }
                } else {
                  return styles
                }
              },
            }}
          />
          {validationMessage}
        </Fragment>
      ) : field.displayMode === 'radio' ? (
        <Fragment>
          <FieldLabel as="legend">{field.label}</FieldLabel>
          <FieldDescription id={`${field.path}-description`}>
            {field.description}
          </FieldDescription>
          <Stack gap="small" marginTop={'small'}>
            {field.options.map((option) => (
              <Radio
                style={
                  field.shouldShowColorSpan
                    ? { ...colorSpan(option.color), alignItems: 'center' }
                    : { alignItems: 'center' }
                }
                key={option.value}
                value={option.value}
                checked={value.value?.value === option.value}
                onChange={(event) => {
                  if (event.target.checked) {
                    onChange?.({ ...value, value: option })
                    setHasChanged(true)
                  }
                }}
              >
                {option.label}
              </Radio>
            ))}
            {value.value !== null &&
              onChange !== undefined &&
              !field.isRequired && (
                <Button
                  onClick={() => {
                    onChange({ ...value, value: null })
                    setHasChanged(true)
                  }}
                >
                  Clear
                </Button>
              )}
          </Stack>
          {validationMessage}
        </Fragment>
      ) : (
        <Fragment>
          <FieldLabel as="legend">{field.label}</FieldLabel>
          <FieldDescription id={`${field.path}-description`}>
            {field.description}
          </FieldDescription>
          <Stack across gap="small" align="center">
            <SegmentedControl
              segments={field.options.map((x) => x.label)}
              selectedIndex={
                value.value
                  ? field.options.findIndex(
                      (x) => x.value === value.value!.value
                    )
                  : undefined
              }
              isReadOnly={onChange === undefined}
              onChange={(index) => {
                onChange?.({ ...value, value: field.options[index] })
                setHasChanged(true)
              }}
            />
            {value.value !== null &&
              onChange !== undefined &&
              !field.isRequired && (
                <Button
                  onClick={() => {
                    onChange({ ...value, value: null })
                    setHasChanged(true)
                  }}
                >
                  Clear
                </Button>
              )}
          </Stack>
          {validationMessage}
        </Fragment>
      )}
    </FieldContainer>
  )
}

export const Cell: CellComponent<typeof controller> = ({
  item,
  field,
  linkTo,
}) => {
  const value = item[field.path] + ''
  const option = field.options.find((x) => x.value === value)
  const label = option?.label
  const color = option?.color

  const ColorSpan = () => (
    <span
      style={{
        display: 'inline-block',
        verticalAlign: 'bottom',
        width: '20px',
        height: '20px',
        borderRadius: '8px',
        marginRight: '8px',
        backgroundColor: color ?? 'transparent',
      }}
    ></span>
  )

  return linkTo ? (
    <CellLink {...linkTo}>
      {field.shouldShowColorSpan && <ColorSpan />}
      {label}
    </CellLink>
  ) : (
    <CellContainer>
      {field.shouldShowColorSpan && <ColorSpan />} {label}
    </CellContainer>
  )
}
Cell.supportsLinkTo = true

export const CardValue: CardValueComponent<typeof controller> = ({
  item,
  field,
}) => {
  const value = item[field.path] + ''
  const option = field.options.find((x) => x.value === value)
  const label = option?.label
  const color = option?.color

  const ColorSpan = () => (
    <span
      style={{
        display: 'inline-block',
        verticalAlign: 'bottom',
        width: '20px',
        height: '20px',
        borderRadius: '8px',
        marginRight: '8px',
        backgroundColor: color ?? 'transparent',
      }}
    ></span>
  )

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {field.shouldShowColorSpan && <ColorSpan />}
      {label}
    </FieldContainer>
  )
}

export type AdminSelectFieldMeta = {
  options: readonly { label: string; value: string | number; color?: string }[]
  type: 'string' | 'integer' | 'enum'
  displayMode: 'select' | 'segmented-control' | 'radio'
  shouldShowColorSpan?: boolean
  isRequired: boolean
  defaultValue: string | number | null
}

type Config = FieldControllerConfig<AdminSelectFieldMeta>

type Option = { label: string; value: string; color?: string }

type Value =
  | { value: Option | null; kind: 'create' }
  | { value: Option | null; initial: Option | null; kind: 'update' }

function validate(value: Value, isRequired: boolean) {
  if (isRequired) {
    // if you got null initially on the update screen, we want to allow saving
    // since the user probably doesn't have read access control
    if (value.kind === 'update' && value.initial === null) {
      return true
    }
    return value.value !== null
  }
  return true
}

export const controller = (
  config: Config
): FieldController<Value, Option[]> & {
  options: Option[]
  type: 'string' | 'integer' | 'enum'
  displayMode: 'select' | 'segmented-control' | 'radio'
  shouldShowColorSpan?: boolean
  isRequired: boolean
} => {
  const optionsWithStringValues = config.fieldMeta.options.map((x) => ({
    label: x.label,
    value: x.value.toString(),
    color: x.color,
  }))

  // Transform from string value to type appropriate value
  const t = (v: string | null) =>
    v === null ? null : config.fieldMeta.type === 'integer' ? parseInt(v) : v

  const stringifiedDefault = config.fieldMeta.defaultValue?.toString()

  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: {
      kind: 'create',
      value:
        optionsWithStringValues.find((x) => x.value === stringifiedDefault) ??
        null,
    },
    type: config.fieldMeta.type,
    displayMode: config.fieldMeta.displayMode,
    shouldShowColorSpan: config.fieldMeta.shouldShowColorSpan,
    isRequired: config.fieldMeta.isRequired,
    options: optionsWithStringValues,
    deserialize: (data) => {
      for (const option of config.fieldMeta.options) {
        if (option.value === data[config.path]) {
          const stringifiedOption = {
            label: option.label,
            value: option.value.toString(),
            color: option.color,
          }
          return {
            kind: 'update',
            initial: stringifiedOption,
            value: stringifiedOption,
          }
        }
      }
      return { kind: 'update', initial: null, value: null }
    },
    serialize: (value) => ({ [config.path]: t(value.value?.value ?? null) }),
    validate: (value) => validate(value, config.fieldMeta.isRequired),
    filter: {
      Filter(props) {
        return (
          <MultiSelect
            onChange={props.onChange}
            options={optionsWithStringValues}
            value={props.value}
            autoFocus
          />
        )
      },
      graphql: ({ type, value: options }) => ({
        [config.path]: {
          [type === 'not_matches' ? 'notIn' : 'in']: options.map((x) =>
            t(x.value)
          ),
        },
      }),
      Label({ type, value }) {
        if (!value.length) {
          return type === 'not_matches' ? `is set` : `has no value`
        }
        if (value.length > 1) {
          const values = value.map((i) => i.label).join(', ')
          return type === 'not_matches'
            ? `is not in [${values}]`
            : `is in [${values}]`
        }
        const optionLabel = value[0].label
        return type === 'not_matches'
          ? `is not ${optionLabel}`
          : `is ${optionLabel}`
      },
      types: {
        matches: {
          label: 'Matches',
          initialValue: [],
        },
        not_matches: {
          label: 'Does not match',
          initialValue: [],
        },
      },
    },
  }
}
