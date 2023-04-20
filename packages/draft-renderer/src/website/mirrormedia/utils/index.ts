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

export { hasContentInRawContentBlock }
