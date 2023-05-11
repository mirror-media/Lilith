import { RawDraftContentState } from 'draft-js'
// eslint-disable-next-line prettier/prettier
import type { Post } from '../types'

const hasContentInRawContentBlock = (
  rawContentBlock?: RawDraftContentState
) => {
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

const removeEmptyContentBlock = (
  rawContentBlock?: RawDraftContentState
): any => {
  const hasContent = hasContentInRawContentBlock(rawContentBlock)
  if (!hasContent) {
    throw new Error(
      'There is no content in rawContentBlock, please check again.'
    )
  }
  const blocksWithHideEmptyBlock = rawContentBlock?.blocks
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

const insertRecommendInContent = (
  content: RawDraftContentState,
  insertRecommend: Post[]
) => {
  const relatedPostsEntityMaps = insertRecommend?.map((post: Post) => ({
    data: {
      posts: [
        {
          heroImage: post?.heroImage || {},
          id: post?.id || '',
          name: post?.title || '',
          ogImage: post?.ogImage || null,
          slug: post?.slug || '',
          subtitle: null,
        },
      ],
    },
    type: 'RELATEDPOST',
    mutability: 'IMMUTABLE',
  }))

  const insertRelatedEntities = relatedPostsEntityMaps.reduce(
    (accumulator, current) => {
      // +1000 to increase diversity to avoid `key` duplication
      const entityKey = Number(current?.data?.posts[0].id) + 1000
      return {
        ...accumulator,
        [entityKey]: current,
      }
    },
    {}
  )

  const entityMapWithInsertRecommend = {
    ...content.entityMap,
    ...insertRelatedEntities,
  }

  const relatedPostsBlocks = insertRecommend.map(
    (post: Post, index: number) => {
      // +1000 to increase diversity to avoid `key` duplication
      const entityKey = Number(post.id) + 1000
      return {
        key: `insertRecommend-${index}`,
        data: {},
        text: ' ', //notice: if text: '' will show error
        type: 'atomic',
        depth: 0,
        entityRanges: [{ key: entityKey, length: 1, offset: 0 }],
        inlineStyleRanges: [],
      }
    }
  )

  function insertRecommendBlocks(data: any) {
    let i = 0
    let count = 0

    // B: insert recommends based on related-posts amount
    const paragraphs = data?.filter(
      (item: any) => item?.type === 'unstyled' && item?.text.length
    )

    let divideAmount

    //if relatedPosts amounts far more than paragraphs amounts, insert a recommend every other paragraph until paragraphs end.
    if (relatedPostsBlocks.length) {
      divideAmount =
        Math.round(paragraphs?.length / (relatedPostsBlocks.length + 1)) ||
        (paragraphs?.length ? 1 : 0)
    } else {
      divideAmount = 0
    }

    if (paragraphs?.length) {
      while (i < data.length && divideAmount) {
        if (data[i]?.type === 'unstyled' && data[i]?.text.length) {
          count++

          const item = relatedPostsBlocks[count / divideAmount - 1]
          if (count % divideAmount === 0 && item) {
            data.splice(i + 1, 0, item)
          }
        }
        i++
      }
    }

    // A: insert recommends each 5 paragraphs (same as READr 2.0)
    // if (data?.length) {
    //   while (i < data.length) {
    //     if (data[i]?.type === 'unstyled' && data[i]?.text.length) {
    //       count++

    //       const item = relatedPostsBlocks[count / 5 - 1]
    //       if (count % 5 === 0 && item) {
    //         data.splice(i + 1, 0, item)
    //       }
    //     }
    //     i++
    //   }
    // }
    return data
  }

  const rawContent = removeEmptyContentBlock(content)

  const contentWithInsertRecommend: any = {
    blocks: insertRecommendBlocks(rawContent?.blocks),
    entityMap: entityMapWithInsertRecommend,
  }

  return contentWithInsertRecommend
}

export {
  hasContentInRawContentBlock,
  insertRecommendInContent,
  removeEmptyContentBlock,
}
