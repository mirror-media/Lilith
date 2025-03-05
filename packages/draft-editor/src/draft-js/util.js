export const getSelectionEntityData = (
  /** @type {import('draft-js').EditorState} */ editorState
) => {
  const selection = editorState.getSelection()
  const startOffset = selection.getStartOffset()
  const startBlock = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())

  let data
  let entityInstance
  let entityKey

  if (!selection.isCollapsed()) {
    entityKey = startBlock.getEntityAt(startOffset)
  } else {
    entityKey = startBlock.getEntityAt(0)
  }

  const contentState = editorState.getCurrentContent()
  if (entityKey !== null) {
    entityInstance = contentState.getEntity(entityKey)
    data = entityInstance.getData()
  }
  return data
}
