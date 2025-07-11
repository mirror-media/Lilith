// Modified from https://github.com/dburrows/draft-js-basic-html-editor/blob/master/src/utils/draftRawToHtml.js

// 'use strict';
import { List } from 'immutable'
import _ from 'lodash'
import * as InlineStylesProcessor from './inline-styles-processor'
import ApiDataInstance from './api-data-instance'
import AtomicBlockProcessor from './atomic-block-processor'
import ENTITY from './entities'

const defaultBlockTagMap = {
  atomic: `<div>%content%</div>`,
  blockquote: `<blockquote>%content%</blockquote>`,
  'code-block': `<code>%content%</code>`,
  default: `<p>%content%</p>`,
  'header-two': `<h2>%content%</h2>`,
  'header-three': `<h3>%content%</h3>`,
  'header-four': `<h4>%content%</h4>`,
  'ordered-list-item': `<li>%content%</li>`,
  paragraph: `<p>%content%</p>`,
  'unordered-list-item': `<li>%content%</li>`,
  unstyled: `<p>%content%</p>`,
}

const inlineTagMap = {
  BOLD: ['<strong>', '</strong>'],
  CODE: ['<code>', '</code>'],
  default: ['<span>', '</span>'],
  ITALIC: ['<em>', '</em>'],
  SUP: ['<sup>', '</sup>'],
  SUB: ['<sub>', '</sub>'],
  UNDERLINE: ['<u>', '</u>'],
}

const defaultEntityTagMap = {
  [ENTITY.DIVIDER.type]: ['<hr>', ''],
  [ENTITY.ANNOTATION.type]: [
    '<abbr title="<%= data.body %>"><%= data.text %>',
    '</abbr>',
  ],
  [ENTITY.AUDIO.type]: [
    '<div class="audio-container center"><div class="audio-title"><%= data.name %></div><!-- <div class="audio-desc"><%= data.description %></div> --><audio src="<%= data.url %>" />',
    '</div>',
  ],
  [ENTITY.BLOCKQUOTE.type]: [
    '<blockquote class="center"><div><%= data.quote %></div><div><%= data.quotedBy %></div>',
    '<blockquote>',
  ],
  [ENTITY.EMBEDDEDCODE.type]: [
    '<div class="embedded <%= data.alignment %>" title="<%= data.caption %>"><%= data.code%>',
    '</div>',
  ],
  [ENTITY.INFOBOX.type]: [
    '<div class="info-box-container center"><div class="info-box-title"><%= data.title %></div><div class="info-box-body"><%= data.body %></div>',
    '</div>',
  ],
  [ENTITY.STOREDIMAGE.type]: [
    '<img alt="<%= data.name %>" src="<%= data.url %>" srcset="<%= data.urlMobileSized %> 800w,  <%= data.urlTabletSized %> 1280w, <%= data.urlDesktopSized %> 2400w" class="center">',
    '</img>',
  ],
  [ENTITY.IMAGE.type]: [
    '<img alt="<%=data.name%>" src="<%=data.url%>" srcset="<%= data.mobile.url %> 800w,  <%= data.tablet.url %> 1280w, <%= data.desktop.url %> 2400w" class="center">',
    '</img>',
  ],
  /*[ENTITY.IMAGEDIFF.type]: ['<!-- imageDiff component start --> <ol class="image-diff-container"> <% _.forEach(data, function(image, index) { if (index > 1) { return; } %><li class="image-diff-item"><img src="<%- image.url %>" /></li><% }); %>', '</ol><!-- imageDiff component end-->'],
	[ENTITY.IMAGELINK.type]: ['<img alt="<%= data.description %>" src="<%= data.url %>" class="<%= data.alignment %>">', '</img>'],*/
  [ENTITY.LINK.type]: ['<a target="_blank" href="<%= data.url %>">', '</a>'],
  [ENTITY.SLIDESHOW.type]: [
    '<!-- slideshow component start --> <ol class="slideshow-container"> <%  _.forEach(data, function(image) { %><li class="slideshow-slide"><img alt="<%- image.name %>" src="<%- image.url %>" srcset="<%= image.mobile.url %> 800w,  <%= image.tablet.url %> 1280w, <%= image.desktop.url %> 2400w" /></li><% }); %>',
    '</ol><!-- slideshow component end -->',
  ],
  [ENTITY.VIDEO.type]: [
    '<div controls class="video-container <%= data.alignment %>"><div class="video-name"><%= data.title %></div><div class="video-desc"><%= data.description %></div><video src="<%= data.url %>" />',
    '</div>',
  ],
  [ENTITY.YOUTUBE.type]: [
    '<iframe width="560" alt="<%= data.description %>" height="315" src="https://www.youtube.com/embed/<%= data.id %>" frameborder="0" allowfullscreen>',
    '</iframe>',
  ],
}

const nestedTagMap = {
  'ordered-list-item': ['<ol>', '</ol>'],
  'unordered-list-item': ['<ul>', '</ul>'],
}

/**
 * @typedef {import('./jsdoc').RawDraftContentState} RawDraftContentState
 * @typedef {import('./jsdoc').RawDraftContentBlock} RawDraftContentBlock
 * @typedef {import('./jsdoc').EntityMap} EntityMap
 * @typedef {import('./jsdoc').BlockTagMap} BlockTagMap
 * @typedef {import('./jsdoc').EntityTagMap} EntityTagMap
 */

/**
 * @param {RawDraftContentBlock} block
 * @param {EntityMap} entityMap
 * @param {BlockTagMap} blockTagMap
 * @param {EntityTagMap} entityTagMap
 */
function _convertInlineStyle(block, entityMap, blockTagMap, entityTagMap) {
  return blockTagMap[block.type]
    ? blockTagMap[block.type].replace(
        '%content%',
        InlineStylesProcessor.convertToHtml(
          inlineTagMap,
          entityTagMap,
          entityMap,
          block
        )
      )
    : blockTagMap.default.replace(
        '%content%',
        InlineStylesProcessor.convertToHtml(
          inlineTagMap,
          entityTagMap,
          entityMap,
          block
        )
      )
}

/**
 * @param {RawDraftContentBlock[]} blocks
 * @param {EntityMap} entityMap
 * @param {BlockTagMap} blockTagMap
 * @param {EntityTagMap} entityTagMap
 */
function _convertBlocksToHtml(blocks, entityMap, blockTagMap, entityTagMap) {
  let html = ''
  /** @type {string[]} */
  const nestLevel = [] // store the list type of the previous item: null/ol/ul
  blocks.forEach((block) => {
    // create tag for <ol> or <ul>: deal with ordered/unordered list item
    // if the block is a list-item && the previous block is not a list-item
    if (
      block.type in nestedTagMap &&
      // @ts-ignore: block.type is nestedTagMap property
      nestedTagMap[block.type] &&
      nestLevel[0] !== block.type
    ) {
      // @ts-ignore: block.type is nestedTagMap property
      html += nestedTagMap[block.type][0] // start with <ol> or <ul>
      nestLevel.unshift(block.type)
    }

    // end tag with </ol> or </ul>: deal with ordered/unordered list item
    if (nestLevel.length > 0 && nestLevel[0] !== block.type) {
      // @ts-ignore: nestLevel.shift() is not undefined
      html += nestedTagMap[nestLevel.shift()][1] // close with </ol> or </ul>
    }

    html += _convertInlineStyle(block, entityMap, blockTagMap, entityTagMap)
  })

  // end tag with </ol> or </ul>: or if it is the last block
  // @ts-ignore: blocks[blocks.length - 1] is not undefined
  if (blocks.length > 0 && nestedTagMap[blocks[blocks.length - 1].type]) {
    // @ts-ignore: nestLevel.shift() should not be undefined
    html += nestedTagMap[nestLevel.shift()][1] // close with </ol> or </ul>
  }

  return html
}

/**
 * @param {RawDraftContentBlock[]} blocks
 * @param {EntityMap} entityMap
 * @param {EntityTagMap} entityTagMap
 */
function convertBlocksToApiData(blocks, entityMap, entityTagMap) {
  let apiDataArr = List()
  /** @type {any[]} */
  let content = []
  /** @type {string[]} */
  const nestLevel = []
  blocks.forEach((block) => {
    // block is not a list-item
    if (!(block.type in nestedTagMap)) {
      // if previous block is a list-item
      if (content.length > 0 && nestLevel.length > 0) {
        apiDataArr = apiDataArr.push(
          new ApiDataInstance({
            type: nestLevel[0],
            content: [content],
          })
        )
        content = []
        nestLevel.shift()
      }

      if (block.type.startsWith('atomic') || block.type.startsWith('media')) {
        try {
          apiDataArr = apiDataArr.push(
            AtomicBlockProcessor.convertBlock(entityMap, block)
          )
        } catch (e) {
          console.error(e)
        }
      } else {
        const converted = InlineStylesProcessor.convertToHtml(
          inlineTagMap,
          entityTagMap,
          entityMap,
          block
        )
        const type = block.type

        const textAlign = block.data?.textAlign

        apiDataArr = apiDataArr.push(
          new ApiDataInstance({
            id: block.key,
            type,
            content: [converted],
            textAlign,
          })
        )
      }
    } else {
      const converted = InlineStylesProcessor.convertToHtml(
        inlineTagMap,
        entityTagMap,
        entityMap,
        block
      )

      // previous block is not an item-list block
      if (nestLevel.length === 0) {
        nestLevel.unshift(block.type)
        content.push(converted)
      } else if (nestLevel[0] === block.type) {
        // previous block is a item-list and current block is the same item-list
        content.push(converted)
      } else if (nestLevel[0] !== block.type) {
        // previous block is a different item-list.
        apiDataArr = apiDataArr.push(
          new ApiDataInstance({
            id: block.key,
            type: nestLevel[0],
            content: [content],
          })
        )
        content = [converted]
        nestLevel[0] = block.type
      }
    }
  })

  // last block is a item-list
  if (blocks.length > 0 && nestLevel.length > 0) {
    const block = blocks[blocks.length - 1]
    apiDataArr = apiDataArr.push(
      new ApiDataInstance({
        id: block.key,
        type: block.type,
        content: content,
      })
    )
  }

  return apiDataArr
}

/**
 * @param {RawDraftContentState} raw
 * @param {BlockTagMap} [blockTagMap]
 * @param {EntityTagMap} [entityTagMap]
 */
function convertRawToHtml(raw, blockTagMap, entityTagMap) {
  blockTagMap = _.merge({}, defaultBlockTagMap, blockTagMap)
  entityTagMap = entityTagMap || defaultEntityTagMap
  let html = ''
  raw = raw || /** @type {RawDraftContentState} */ ({})
  const blocks = Array.isArray(raw.blocks) ? raw.blocks : []
  const entityMap = typeof raw.entityMap === 'object' ? raw.entityMap : {}
  html = _convertBlocksToHtml(blocks, entityMap, blockTagMap, entityTagMap)
  return html
}

/**
 * @param {RawDraftContentState} raw
 */
function convertRawToApiData(raw) {
  raw = raw || /** @type {RawDraftContentState} */ ({})
  const blocks = Array.isArray(raw.blocks) ? raw.blocks : []
  const entityMap = typeof raw.entityMap === 'object' ? raw.entityMap : {}
  const entityTagMap = _.merge({}, defaultEntityTagMap, {
    [ENTITY.ANNOTATION.type]: [
      `<span data-entity-type="annotation" data-annotation-body="<%= data.bodyEscapedHTML %>">`,
      '</span>',
    ],
  })
  const apiData = convertBlocksToApiData(blocks, entityMap, entityTagMap)
  return apiData
}

export default {
  convertToHtml: convertRawToHtml,
  convertToApiData: convertRawToApiData,
}
