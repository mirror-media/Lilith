type DraftBlock = {
  data: object
  depth: number
  entityRanges: any[]
  inlineStyleRanges: any[]
  key: string
  text: string
  type: string
}

type Draft = {
  blocks: DraftBlock[]
  entityMap: object
}

const hasContentInRawContentBlock = (rawContentBlock: Draft) => {
  if (
    !rawContentBlock ||
    !rawContentBlock.blocks ||
    !rawContentBlock.blocks.length
  ) {
    return false
  }
  const hasAtomicBlock = Boolean(
    rawContentBlock.blocks.some((block) => block.type === 'atomic')
  )
  if (hasAtomicBlock) {
    return hasAtomicBlock
  }
  const defaultBlockHasContent = Boolean(
    rawContentBlock.blocks
      .filter((block) => block.type !== 'atomic')
      .some((block) => block.text.trim())
  )
  return defaultBlockHasContent
}

const removeEmptyContentBlock = (rawContentBlock: Draft) => {
  const hasContent = hasContentInRawContentBlock(rawContentBlock)
  if (!hasContent) {
    throw new Error(
      'There is no content in rawContentBlock, please check again.'
    )
  }
  const blocksWithHideEmptyBlock = rawContentBlock.blocks
    .map((block) => {
      if (block.type === 'atomic' || block.text) {
        return block
      } else {
        return undefined
      }
    })
    .filter((block) => block)

  return { ...rawContentBlock, blocks: blocksWithHideEmptyBlock }
}

export { hasContentInRawContentBlock, removeEmptyContentBlock }
