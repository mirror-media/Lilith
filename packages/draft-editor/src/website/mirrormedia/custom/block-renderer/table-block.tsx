import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import {
  ContentBlock,
  ContentState,
  Editor,
  EditorState,
  RawDraftContentState,
  convertFromRaw,
  convertToRaw,
} from 'draft-js'
import cloneDeep from 'lodash/cloneDeep'

const _ = {
  cloneDeep,
}

enum ActionType {
  Insert = 'insert',
  Delete = 'delete',
  Update = 'update',
}

enum TableEnum {
  Row = 'row',
  Column = 'column',
}

type RawTableData = RawDraftContentState[][]
type TableData = EditorState[][]
type UpdateAction = {
  type: ActionType.Update
  cIndex: number
  rIndex: number
  value: EditorState
}
type InsertAction = {
  type: ActionType.Insert
  target: TableEnum.Row | TableEnum.Column
  index: number
}
type DeleteAction = {
  type: ActionType.Delete
  target: TableEnum.Row | TableEnum.Column
  index: number
}

type TableStyles = {
  rows: Record<string, string>[]
  columns?: Record<string, string>[]
  cells?: Record<string, string>[][]
}

function createEmptyRow(colLen = 0, emptyValue: EditorState): TableData {
  const rtn: EditorState[] = []
  for (let i = 0; i < colLen; i++) {
    rtn.push(emptyValue)
  }
  return rtn
}

function resolveTableStyles(
  action: InsertAction | DeleteAction,
  tableStyles: TableStyles
) {
  switch (action?.type) {
    case ActionType.Insert: {
      if (action.target === TableEnum.Row) {
        const rows = [
          ...tableStyles.rows.slice(0, action.index),
          {},
          ...tableStyles.rows.slice(action.index),
        ]
        return Object.assign({}, tableStyles, { rows })
      }
      // TODO: handle target === TableEnum.Column if needed
      return tableStyles
    }
    case ActionType.Delete: {
      if (action.target === TableEnum.Row) {
        const rows = [
          ...tableStyles.rows.slice(0, action.index),
          ...tableStyles.rows.slice(action.index + 1),
        ]
        return Object.assign({}, tableStyles, { rows })
      }
      // TODO: handle target === TableEnum.Column if needed
      return tableStyles
    }
    // TODO: handle action.type === ActionType.Update if needed
    default: {
      return tableStyles
    }
  }
}

function resolveTableData(
  action: UpdateAction | InsertAction | DeleteAction,
  tableData: TableData
): TableData {
  switch (action?.type) {
    case ActionType.Insert: {
      if (typeof action?.index !== 'number') {
        return tableData
      }
      if (action?.target === TableEnum.Column) {
        // add the new column at specific position in each row
        return tableData.map((r) => [
          ...r.slice(0, action?.index),
          EditorState.createEmpty(),
          ...r.slice(action?.index),
        ])
      }
      // add the new row
      return [
        ...tableData.slice(0, action?.index),
        createEmptyRow(tableData?.[0]?.length, EditorState.createEmpty()),
        ...tableData.slice(action?.index),
      ]
    }
    case ActionType.Delete: {
      if (typeof action?.index !== 'number') {
        return tableData
      }
      if (action?.target === 'column') {
        // delete the column at specific position in each row
        return tableData.map((r) => [
          ...r.slice(0, action.index),
          ...r.slice(action.index + 1),
        ])
      }
      // delete the column
      return [
        ...tableData.slice(0, action.index),
        ...tableData.slice(action.index + 1),
      ]
    }
    case ActionType.Update: {
      // The reason we copy the array is to make sure
      // that React component re-renders.
      const copiedData = [...tableData]
      if (
        typeof action?.rIndex !== 'number' ||
        typeof action?.cIndex !== 'number'
      ) {
        return copiedData
      }
      copiedData[action.rIndex][action.cIndex] = action?.value
      return copiedData
    }
    default: {
      return tableData
    }
  }
}

type TableBlockProps = {
  block: ContentBlock
  blockProps: {
    onEditStart: () => void
    onEditFinish: ({
      entityKey,
      entityData,
    }: {
      entityKey?: string
      entityData?: Record<string, unknown>
    }) => void
    getMainEditorReadOnly: () => boolean
  }
  contentState: ContentState
}

function convertTableDataFromRaw(rawTableData: RawTableData): TableData {
  return rawTableData.map((rowData) => {
    return rowData.map((colData) => {
      const contentState = convertFromRaw(colData)
      return EditorState.createWithContent(contentState)
    })
  })
}

function convertTableDataToRaw(tableData: TableData): RawTableData {
  return tableData.map((rowData) => {
    return rowData.map((colData) => {
      return convertToRaw(colData.getCurrentContent())
    })
  })
}

const Table = styled.div`
  display: table;
  width: 95%;
  border-collapse: collapse;
`

const Tr = styled.div`
  display: table-row;
`

const Td = styled.div`
  display: table-cell;
  border-width: 1px;
  min-width: 100px;
  min-height: 40px;
  padding: 10px;
`

const StyledFirstRow = styled.div`
  display: table-row;
  height: 10px;

  div {
    display: table-cell;
    position: relative;
  }

  span {
    cursor: pointer;
    line-height: 10px;
  }

  span:first-child {
    position: absolute;
    right: 50%;
    transform: translateX(50%);
  }

  span:first-child:before {
    content: '•';
  }

  span:first-child:hover:before {
    content: '➖';
  }

  span:last-child {
    position: absolute;
    right: -5px;
  }

  span:last-child:before {
    content: '•';
  }

  span:last-child:hover:before {
    content: '➕';
  }
`

const StyledFirstColumn = styled.div`
  display: table-cell;
  width: 10px;
  position: relative;

  span {
    cursor: pointer;
  }

  span:first-child {
    position: absolute;
    bottom: 50%;
    right: 0px;
    transform: translateY(50%);
  }

  span:first-child:before {
    content: '•';
  }

  span:first-child:hover:before {
    content: '➖';
  }

  span:last-child {
    position: absolute;
    bottom: -10px;
    right: 0px;
  }

  span:last-child:before {
    content: '•';
  }

  span:last-child:hover:before {
    content: '➕';
  }
`

const TableBlockContainer = styled.div`
  margin: 15px 0;
  position: relative;
  overflow: scroll;
  padding: 15px;
`

const StyledTable = styled.div`
  display: table;
  width: 95%;
  border-collapse: collapse;
`

const StyledTr = styled.div`
  display: table-row;
`

const StyledTd = styled.div`
  display: table-cell;
  border: 1px solid #e1e5e9;
  min-width: 100px;
  min-height: 40px;
  padding: 10px;
`

export const TableEditorBlock = (props: TableBlockProps) => {
  const { block, blockProps, contentState } = props
  const { onEditStart, onEditFinish, getMainEditorReadOnly } = blockProps
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const {
    tableData: rawTableData,
    tableStyles: _tableStyles,
  }: { tableData: RawTableData; tableStyles: TableStyles } = entity.getData()
  const [tableData, setTableData] = useState(
    convertTableDataFromRaw(rawTableData)
  )
  // deep clone `_tableStyles` to prevent updating the entity data directly
  const [tableStyles, setTableStyles] = useState(_.cloneDeep(_tableStyles))
  const tableRef = useRef(null)

  // `TableBlock` will render other inner/nested DraftJS Editors inside the main Editor.
  // However, main Editor's `readOnly` needs to be mutually exclusive with nested Editors' `readOnly`.
  // If the main Editor and nested Editor are editable (`readOnly={false}`) at the same time,
  // there will be a DraftJS Edtior Selection bug.
  const [cellEditorReadOnly, setCellEditorReadOnly] = useState(
    !getMainEditorReadOnly()
  )

  // The user clicks the table for editing
  const onTableClick = () => {
    // call `onEditStart` function to tell the main DraftJS Editor
    // that we are going to interact with the custom atomic block.
    onEditStart()

    // make nested DraftJS Editors editable
    setCellEditorReadOnly(false)
  }

  useEffect(
    () => {
      // The user clicks other places except the table,
      // so we think he/she doesn't want to edit the table anymore.
      // Therefore, we call `onEditFinish` function to pass modified table data
      // back to the main DraftJS Edtior.
      function handleClickOutside(event) {
        // `!cellEditorReadOnly` condition is needed.
        //  If there are two tables in the main Editor,
        //  this `handleClickOutside` will only handle the just updated one.
        if (
          tableRef.current &&
          !(tableRef.current as HTMLElement).contains(event.target) &&
          !cellEditorReadOnly
        ) {
          // make inner DraftJS Editors NOT editable
          setCellEditorReadOnly(true)

          // call `onEditFinish` function tell the main DraftJS Editor
          // that we are finishing interacting with the custom atomic block.
          onEditFinish({
            entityKey,
            entityData: {
              tableData: convertTableDataToRaw(tableData),
              tableStyles,
            },
          })
        }
      }
      console.debug(
        '(rich-text-editor/table): add click outside event listener'
      )
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        // Unbind the event listener on clean up
        console.debug(
          '(rich-text-editor/table): remove click outside event listener'
        )
        document.removeEventListener('mousedown', handleClickOutside)
      }
    },
    // Skip running effect if `tableData` and `cellEditorReadOnly` are not changed.
    [tableData, cellEditorReadOnly]
  )

  return (
    <TableBlockContainer>
      <Table key={entityKey} onClick={onTableClick} ref={tableRef}>
        <StyledFirstRow>
          {/* The following `div` is for the first empty column in rows */}
          <div />
          {tableData?.[0]?.map((colData, cIndex) => {
            return (
              <div key={`col_${cIndex + 1}`}>
                <span
                  onClick={() => {
                    const deleteColumn: DeleteAction = {
                      type: ActionType.Delete,
                      target: TableEnum.Column,
                      index: cIndex,
                    }
                    const updatedTableData = resolveTableData(
                      deleteColumn,
                      tableData
                    )
                    setTableData(updatedTableData)
                  }}
                />
                <span
                  onClick={() => {
                    const insertColumn: InsertAction = {
                      type: ActionType.Insert,
                      target: TableEnum.Column,
                      index: cIndex + 1,
                    }
                    const updatedTableData = resolveTableData(
                      insertColumn,
                      tableData
                    )
                    setTableData(updatedTableData)
                  }}
                />
              </div>
            )
          })}
        </StyledFirstRow>
        {tableData.map((rowData, rIndex) => {
          const colsJsx = rowData.map((colData, cIndex) => {
            return (
              <Td key={`col_${cIndex}`}>
                {/* TODO: add editor buttons if needed */}
                <Editor
                  onChange={(editorState) => {
                    const updateAction: UpdateAction = {
                      type: ActionType.Update,
                      cIndex,
                      rIndex,
                      value: editorState,
                    }
                    const updatedTableData = resolveTableData(
                      updateAction,
                      tableData
                    )
                    setTableData(updatedTableData)
                  }}
                  editorState={colData}
                  readOnly={cellEditorReadOnly}
                />
              </Td>
            )
          })
          return (
            <React.Fragment key={`row_${rIndex}`}>
              <Tr style={tableStyles?.rows?.[rIndex]}>
                <StyledFirstColumn>
                  <span
                    onClick={() => {
                      const deleteRowAction: DeleteAction = {
                        type: ActionType.Delete,
                        target: TableEnum.Row,
                        index: rIndex,
                      }
                      const updatedTableData = resolveTableData(
                        deleteRowAction,
                        tableData
                      )
                      setTableData(updatedTableData)
                      setTableStyles(
                        resolveTableStyles(deleteRowAction, tableStyles)
                      )
                    }}
                  />
                  <span
                    onClick={() => {
                      const addRowAction: InsertAction = {
                        type: ActionType.Insert,
                        target: TableEnum.Row,
                        index: rIndex + 1,
                      }
                      const updatedTableData = resolveTableData(
                        addRowAction,
                        tableData
                      )
                      setTableData(updatedTableData)
                      setTableStyles(
                        resolveTableStyles(addRowAction, tableStyles)
                      )
                    }}
                  />
                </StyledFirstColumn>
                {colsJsx}
              </Tr>
            </React.Fragment>
          )
        })}
      </Table>
    </TableBlockContainer>
  )
}

export const TableBlock = (props) => {
  const { block, contentState } = props
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { tableData: rawTableData } = entity.getData()
  const [tableData] = useState(convertTableDataFromRaw(rawTableData))
  const tableRef = useRef(null)

  return (
    <TableBlockContainer>
      <StyledTable key={entityKey} ref={tableRef}>
        {tableData.map((rowData, rIndex) => {
          const colsJsx = rowData.map((colData, cIndex) => {
            return (
              <StyledTd key={`col_${cIndex}`}>
                {/* TODO: add editor buttons if needed */}
                <Editor editorState={colData} readOnly />
              </StyledTd>
            )
          })
          return (
            <React.Fragment key={`row_${rIndex}`}>
              <StyledTr>{colsJsx}</StyledTr>
            </React.Fragment>
          )
        })}
      </StyledTable>
    </TableBlockContainer>
  )
}
