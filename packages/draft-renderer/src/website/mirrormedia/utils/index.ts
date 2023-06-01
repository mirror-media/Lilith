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

const hasContentInRawContentBlock = (rawContentBlock: Draft): boolean => {
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

const removeEmptyContentBlock = (rawContentBlock: Draft): Draft => {
  const hasContent = hasContentInRawContentBlock(rawContentBlock)
  if (!hasContent) {
    throw new Error(
      'There is no content in rawContentBlock, please check again.'
    )
  }
  const blocksWithHideEmptyBlock = rawContentBlock.blocks
    .map((block) => {
      if (block.type === 'atomic' || block.text.trim()) {
        return block
      } else {
        return undefined
      }
    })
    .filter((item): item is DraftBlock => !!item)

  return { ...rawContentBlock, blocks: blocksWithHideEmptyBlock }
}
const getContentBlocksH2H3 = (
  rawContentBlock: Draft
): Pick<DraftBlock, 'text' | 'key' | 'type'>[] => {
  try {
    const contentBlocks = removeEmptyContentBlock(rawContentBlock)
    return contentBlocks.blocks
      .filter(
        (block) => block.type === 'header-two' || block.type === 'header-three'
      )
      .map((block) => {
        return { key: block.key, text: block.text, type: block.type }
      })
  } catch (error) {
    console.warn(
      `Because ${error}, Function 'getContentBlocksH2H3' return an empty array`
    )
    return []
  }
}

const getContentTextBlocks = (
  rawContentBlock: Draft
): Pick<DraftBlock, 'text' | 'key' | 'type'>[] => {
  try {
    const contentBlocks = removeEmptyContentBlock(rawContentBlock)
    return contentBlocks.blocks
      .filter(
        (block) =>
          block.type === 'header-two' ||
          block.type === 'header-three' ||
          block.type === 'unstyled'
      )
      .map((block) => {
        return { key: block.key, text: block.text, type: block.type }
      })
  } catch (error) {
    console.warn(
      `Because ${error}, Function 'getContentTextBlocks' return an empty array`
    )
    return []
  }
}

export {
  hasContentInRawContentBlock,
  removeEmptyContentBlock,
  getContentBlocksH2H3,
  getContentTextBlocks,
}
