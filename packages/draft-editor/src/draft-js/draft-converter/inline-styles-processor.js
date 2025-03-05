// Modified from https://github.com/dburrows/draft-js-basic-html-editor/blob/master/src/utils/processInlineStylesAndEntities.js

import _ from 'lodash'
import {
  CUSTOM_STYLE_PREFIX_FONT_COLOR,
  CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR,
} from '../const'

/**
 * @typedef {import('./jsdoc').RawDraftContentBlock} RawDraftContentBlock
 * @typedef {import('./jsdoc').EntityMap} EntityMap
 * @typedef {import('./jsdoc').RawDraftEntityRange} RawDraftEntityRange
 * @typedef {import('./jsdoc').DraftInlineStyleType} DraftInlineStyleType
 * @typedef {import('./jsdoc').RawDraftInlineStyleRange} RawDraftInlineStyleRange
 * @typedef {import('./jsdoc').EntityTagMap} EntityTagMap
 * @typedef {import('./jsdoc').InlineTagMap} InlineTagMap
 * @typedef {Record<string, any>} TagInsertMap
 */

/**
 * @param {DraftInlineStyleType} style
 */
function tagForCustomInlineStyle(style) {
  const customInlineStylePrefixs = [
    CUSTOM_STYLE_PREFIX_FONT_COLOR,
    CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR,
  ]
  const stylePrefix = customInlineStylePrefixs.find((prefix) =>
    style.startsWith(prefix)
  )

  /** @type {string[]} */
  let tag, value
  switch (stylePrefix) {
    case CUSTOM_STYLE_PREFIX_FONT_COLOR:
      value = style.split(CUSTOM_STYLE_PREFIX_FONT_COLOR)[1]
      tag = [`<span style="color: ${value}">`, '</span>']
      break
    case CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR:
      value = style.split(CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR)[1]
      tag = [`<span style="background-color: ${value}">`, '</span>']
      break
    default:
      tag = []
      break
  }
  return tag
}

/**
 * @param {RawDraftContentBlock} block
 */
function _fullfilIntersection(block) {
  // SORT BEFORE PROCESSING
  const sortedISRanges = _.sortBy(block.inlineStyleRanges, 'offset')
  const sortedEntityRanges = _.sortBy(block.entityRanges, 'offset')
  const splitedISInline = []

  for (let i = 0; i < sortedEntityRanges.length; i++) {
    const entityRange = sortedEntityRanges[i]
    for (let j = 0; j < sortedISRanges.length; j++) {
      const entityOffset = _.get(entityRange, 'offset', 0)
      const entityLength = _.get(entityRange, 'length', 0)
      const inlineLength = _.get(sortedISRanges, [j, 'length'], 0)
      const inlineOffset = _.get(sortedISRanges, [j, 'offset'], 0)
      const inlineStyle = /** @type {DraftInlineStyleType}*/ (
        _.get(sortedISRanges, [j, 'style'], '')
      )
      const nextEntityOffset = _.get(sortedEntityRanges, [i + 1, 'offset'], 0)
      const nextEntityLength = _.get(sortedEntityRanges, [i + 1, 'length'], 0)

      // handle intersections of inline style and entity
      // <a></a> is entity
      // <abbr></abbr> is next entity
      // <strong></strong>  is inline style
      if (
        nextEntityOffset >= inlineOffset &&
        nextEntityOffset < inlineOffset + inlineLength &&
        nextEntityOffset + nextEntityLength > inlineOffset + inlineLength && // <a><strong></a></strong>
        entityOffset < inlineOffset &&
        entityOffset + entityLength > inlineOffset &&
        entityOffset + entityLength <= inlineOffset + inlineLength
      ) {
        // <strong><abbr></strong></abbr>
        // situation: <a><strong></a><abbr></strong></abbr>
        // should be: <a><strong></strong></a><strong></strong><abbr><strong></strong></abbr>

        // skip next entity checking
        i = i + 1

        splitedISInline.push({
          index: j,
          replace: [
            {
              length: entityOffset + entityLength - inlineOffset,
              offset: inlineOffset,
              style: inlineStyle,
            },
            {
              length: nextEntityOffset - (entityOffset + entityLength),
              offset: entityOffset + entityLength,
              style: inlineStyle,
            },
            {
              length: inlineOffset + inlineLength - nextEntityOffset,
              offset: nextEntityOffset,
              style: inlineStyle,
            },
          ],
        })
      } else if (
        entityOffset >= inlineOffset &&
        entityOffset < inlineOffset + inlineLength &&
        entityOffset + entityLength > inlineOffset + inlineLength
      ) {
        // situation: <strong><a></strong></a>
        // should be: <strong></strong><a><strong></strong></a>
        splitedISInline.push({
          index: j,
          replace: [
            {
              length: entityOffset - inlineOffset,
              offset: inlineOffset,
              style: inlineStyle,
            },
            {
              length: inlineOffset + inlineLength - entityOffset,
              offset: entityOffset,
              style: inlineStyle,
            },
          ],
        })
      } else if (
        entityOffset < inlineOffset &&
        entityOffset + entityLength > inlineOffset &&
        entityOffset + entityLength <= inlineOffset + inlineLength
      ) {
        // situation: <a><strong></a></strong>
        // should be: <a><strong></strong></a><strong></strong>
        splitedISInline.push({
          index: j,
          replace: [
            {
              length: entityOffset + entityLength - inlineOffset,
              offset: inlineOffset,
              style: inlineStyle,
            },
            {
              length: inlineOffset + inlineLength - entityOffset - entityLength,
              offset: entityOffset + entityLength,
              style: inlineStyle,
            },
          ],
        })
      }
    }
  }

  _.forEachRight(splitedISInline, (ele) => {
    sortedISRanges.splice(ele.index, 1, ...ele.replace)
  })

  return sortedISRanges
}

/**
 * @param {InlineTagMap} inlineTagMap
 * @param {RawDraftInlineStyleRange[]} inlineStyleRanges
 * @param {TagInsertMap} [tagInsertMap]
 */
function _inlineTag(inlineTagMap, inlineStyleRanges, tagInsertMap = {}) {
  // SORT BEFORE PROCESSING
  const sortedRanges = _.sortBy(inlineStyleRanges, 'offset')

  // map all the tag insertions we're going to do
  sortedRanges.forEach(function (range) {
    let tag = inlineTagMap[range.style]

    // handle dynamic inline style
    if (!tag) {
      tag = tagForCustomInlineStyle(range.style)
    }

    if (!tagInsertMap[range.offset]) {
      tagInsertMap[range.offset] = []
    }

    // add starting tag to the end of the array to form the tag nesting
    tagInsertMap[range.offset].push(tag[0])
    if (tag[1]) {
      if (!tagInsertMap[range.offset + range.length]) {
        tagInsertMap[range.offset + range.length] = []
      }
      // add closing tags to start of array, otherwise tag nesting will be invalid
      tagInsertMap[range.offset + range.length].unshift(tag[1])
    }
  })
  return tagInsertMap
}

/**
 * @param {EntityTagMap} entityTagMap
 * @param {EntityMap} entityMap
 * @param {RawDraftEntityRange[]} entityRanges
 * @param {TagInsertMap} tagInsertMap
 */
function _entityTag(entityTagMap, entityMap, entityRanges, tagInsertMap = {}) {
  _.forEach(entityRanges, (range) => {
    const entity = entityMap[range.key]
    const type = entity.type && entity.type.toUpperCase()
    const tag = entityTagMap[type]
    const data = entity.data

    const compiledTag0 = _.template(tag[0], { variable: 'data' })(data)
    const compiledTag1 = _.template(tag[1], { variable: 'data' })(data)

    if (!tagInsertMap[range.offset]) {
      tagInsertMap[range.offset] = []
    }

    // add starting tag
    tagInsertMap[range.offset].push(compiledTag0)
    if (tag[1]) {
      if (!tagInsertMap[range.offset + range.length]) {
        tagInsertMap[range.offset + range.length] = []
      }
      // add closing tags to start of array, otherwise tag nesting will be invalid
      tagInsertMap[range.offset + range.length].unshift(compiledTag1)
    }
  })
  return tagInsertMap
}

/**
 * @param {InlineTagMap} inlineTagMap
 * @param {EntityTagMap} entityTagMap
 * @param {EntityMap} entityMap
 * @param {RawDraftContentBlock} block
 */
function convertToHtml(inlineTagMap, entityTagMap, entityMap, block) {
  //  exit if there is no inlineStyleRanges/entityRanges or length === 0 as well
  if (
    (!block.inlineStyleRanges && !block.entityRanges) ||
    (block.inlineStyleRanges.length === 0 && block.entityRanges.length === 0)
  ) {
    return block.text
  }
  let html = block.text
  const inlineStyleRanges = _fullfilIntersection(block)

  /** @type {TagInsertMap} */
  let tagInsertMap = {}
  tagInsertMap = _entityTag(
    entityTagMap,
    entityMap,
    block.entityRanges,
    tagInsertMap
  )

  tagInsertMap = _inlineTag(inlineTagMap, inlineStyleRanges, tagInsertMap)

  // sort on position, as we'll need to keep track of offset
  const orderedKeys = Object.keys(tagInsertMap).sort(function (a, b) {
    const x = Number(a)
    const y = Number(b)
    if (x > y) {
      return 1
    }
    if (x < y) {
      return -1
    }
    return 0
  })

  // insert tags into string, keep track of offset caused by our text insertions
  let offset = 0
  orderedKeys.forEach(function (pos) {
    const index = Number(pos)
    tagInsertMap[pos].forEach(function (/** @type {any} */ tag) {
      html = html.substr(0, offset + index) + tag + html.substr(offset + index)
      offset += tag.length
    })
  })

  return html
}

export { convertToHtml }
