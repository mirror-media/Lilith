/** @jsxRuntime classic */
/** @jsx jsx */
import React from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx } from '@keystone-ui/core'
import { Button } from '@keystone-ui/button'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import {
  CellComponent,
  FieldProps,
  CardValueComponent,
  FieldController,
  FieldControllerConfig,
} from '@keystone-6/core/types'

// Controller for virtual field with string value
export const controller = (
  config: FieldControllerConfig
): FieldController<string | null> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: null,
    deserialize: (item) => {
      const value = item[config.path]
      return typeof value === 'string' ? value : null
    },
    serialize: () => ({}),
  }
}

export const Field = ({ value }: FieldProps<typeof controller>) => {
  const url = value as string | null

  if (!url) {
    return (
      <FieldContainer>
        <div css={{ color: '#999' }}>-</div>
      </FieldContainer>
    )
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl

      // Extract filename from URL
      const urlParts = url.split('/')
      const filename = urlParts[urlParts.length - 1] || 'image.jpg'
      link.download = filename

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Download failed:', error)
      alert('下載失敗，請稍後再試')
    }
  }

  return (
    <FieldContainer>
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          css={{
            color: '#2563eb',
            textDecoration: 'none',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {url}
        </a>
        <Button
          size="small"
          tone="active"
          weight="bold"
          onClick={handleDownload}
          css={{
            flexShrink: 0,
          }}
        >
          下載
        </Button>
      </div>
    </FieldContainer>
  )
}

export const Cell: CellComponent = ({ item, field }) => {
  const url = item[field.path] as string | null

  if (!url) {
    return <div css={{ color: '#999' }}>-</div>
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl

      // Extract filename from URL
      const urlParts = url.split('/')
      const filename = urlParts[urlParts.length - 1] || 'image.jpg'
      link.download = filename

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Download failed:', error)
      alert('下載失敗，請稍後再試')
    }
  }

  return (
    <div
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        css={{
          color: '#2563eb',
          textDecoration: 'none',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        {url}
      </a>
      <Button
        size="small"
        tone="active"
        weight="bold"
        onClick={handleDownload}
        css={{
          flexShrink: 0,
        }}
      >
        下載
      </Button>
    </div>
  )
}

export const CardValue: CardValueComponent = ({ item, field }) => {
  const url = item[field.path] as string | null

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          css={{ color: '#2563eb' }}
        >
          {url}
        </a>
      ) : (
        <div css={{ color: '#999' }}>-</div>
      )}
    </FieldContainer>
  )
}
