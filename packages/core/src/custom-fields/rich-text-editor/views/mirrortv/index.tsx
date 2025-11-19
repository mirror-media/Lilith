import type { CardValueComponent, CellComponent } from '@keystone-6/core/types'
import {
  createCardValue,
  createCell,
  createController,
  createField,
} from '../utils'
// @ts-ignore: no type definitions
import Mirrortv from '@mirrormedia/lilith-draft-editor/lib/website/mirrortv'

const { RichTextEditor, decorators } = Mirrortv.DraftEditor

export const Field = createField(RichTextEditor)

export const Cell: CellComponent = createCell()

export const CardValue: CardValueComponent = createCardValue()

export const controller = createController(decorators)
