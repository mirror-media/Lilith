import { Modifier as DraftModifier, CharacterMetadata } from 'draft-js'
import { Map } from 'immutable'

const Modifier = { ...DraftModifier }

/* 
    This method is specified for custom inline style such as 'FONT_COLOR_#ffffff'.
    For this kind of inline style there may be more than one style name 'FONT_COLOR_#ffffff', 'FONT_COLOR_#000000'.
    To prevent any nested specific inline style got rendered after the outer inline style being removed, 
    clear all specific inline styles when custom inline style is applied or removed.

    Since getCurrentInlineStyle only return the inline style the starting position contains,
    loop through all char of blocks to remove all nested inline styles.

    Reference: https://github.com/facebook/draft-js/blob/main/src/model/transaction/ContentStateInlineStyle.js#L39-L88
  */
Modifier.removeInlineStyleByPrefix = (
  contentState,
  selectionState,
  inlineStylePrefix
) => {
  const blockMap = contentState.getBlockMap()
  const startKey = selectionState.getStartKey()
  const startOffset = selectionState.getStartOffset()
  const endKey = selectionState.getEndKey()
  const endOffset = selectionState.getEndOffset()

  // loop through all selected blocks and every block chars to remove specific inline style
  const newBlocks = blockMap
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat(Map([[endKey, blockMap.get(endKey)]]))
    .map((block, blockKey) => {
      let sliceStart
      let sliceEnd

      if (startKey === endKey) {
        sliceStart = startOffset
        sliceEnd = endOffset
      } else {
        sliceStart = blockKey === startKey ? startOffset : 0
        sliceEnd = blockKey === endKey ? endOffset : block.getLength()
      }

      let chars = block.getCharacterList()
      let current
      while (sliceStart < sliceEnd) {
        current = chars.get(sliceStart)
        const inlineStyle = current
          .getStyle()
          .find((styleName) => styleName.startsWith(inlineStylePrefix))
        if (inlineStyle) {
          chars = chars.set(
            sliceStart,
            CharacterMetadata.removeStyle(current, inlineStyle)
          )
        }
        sliceStart++
      }

      return block.set('characterList', chars)
    })

  return contentState.merge({
    blockMap: blockMap.merge(newBlocks),
    selectionBefore: selectionState,
    selectionAfter: selectionState,
  })
}

export { Modifier }
