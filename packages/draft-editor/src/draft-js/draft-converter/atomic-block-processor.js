/* eslint-disable @typescript-eslint/no-var-requires */
import _ from 'lodash'
// import sizeOf from 'image-size';
import ApiDataInstance from './api-data-instance'
import ENTITY from './entities'
import { convertFromRaw } from 'draft-js'
import { convertToHTML } from 'draft-convert'

// import htmlparser2 from 'htmlparser2'
// eslint-disable-next-line no-undef
const htmlparser2 = require('htmlparser2')

/**
 *  @typedef {Object} DraftEditor.TableEntity.TableStyles
 *  @property {Record<string, string>[]} rows
 *  @property {Record<string, string>[]} columns
 *  @property {Record<string, string>[][]} cells
 */

/**
 *  @typedef {import('./jsdoc').RawDraftContentState} RawDraftContentState
 *  @typedef {import('./jsdoc').RawDraftContentBlock} RawDraftContentBlock
 *  @typedef {import('./jsdoc').EntityMap} EntityMap
 *  @typedef {RawDraftContentState[][]} DraftEditor.TableEntity.TableData
 */

const processor = {
  /**
   * @param {EntityMap} entityMap
   * @param {RawDraftContentBlock} block
   */
  convertBlock(entityMap, block) {
    let alignment = 'center'
    let content
    const entityRange = block.entityRanges[0]
    const styles = {}
    // current block's entity data
    // ex:
    // entity.type = IMAGE, entity.data={id,name,url...}
    const entity = entityMap[entityRange.key]

    let type = _.get(entity, 'type', '')

    // backward compatible. Old entity type might be lower case
    switch (type && type.toUpperCase()) {
      case ENTITY.INFOBOX.type: {
        // About INFOBOX atomic block entity data structure,
        // see `../views/editor/info-box.tsx` for more information.
        content = [
          {
            title: entity?.data?.title,
            body: entity?.data?.body,
          },
        ]
        break
      }
      case ENTITY.COLORBOX.type: {
        content = [
          {
            color: entity?.data?.color,
            body: entity?.data?.body,
          },
        ]
        break
      }
      case ENTITY.TABLE.type: {
        // About TABLE atomic block entity data structure,
        // see `../views/editor/table.tsx` for more information.
        content = entity?.data
        /** @type DraftEditor.TableEntity.TableData */
        // since apiData is now only for app,
        // keep the rows data structure for app to style the table
        const tableData = content?.tableData
        const rows = tableData?.map((row) => {
          const cols = row?.map((col) => {
            return { html: convertToHTML(convertFromRaw(col)) }
          })
          return cols
        })
        content = rows
        break
      }
      case ENTITY.DIVIDER.type:
        content = ['<hr>']
        break
      case ENTITY.BLOCKQUOTE.type:
        // this is different from default blockquote of draftjs
        // so we name our specific blockquote as 'quoteby'
        type = 'quoteby'
        alignment = (entity?.data && entity?.data.alignment) || alignment
        content = _.get(entity, 'data')
        content = Array.isArray(content) ? content : [content]
        break
      case ENTITY.AUDIO.type:
      case ENTITY['AUDIO-V2'].type:
      case ENTITY.IMAGE.type:
      case ENTITY.IMAGEDIFF.type:
      case ENTITY.SLIDESHOW.type:
      case ENTITY['SLIDESHOW-V2'].type:
      case ENTITY.VIDEO.type:
      case ENTITY['VIDEO-V2'].type:
      case ENTITY.YOUTUBE.type:
      case ENTITY.BACKGROUNDIMAGE.type:
      case ENTITY.BACKGROUNDVIDEO.type:
      case ENTITY.RELATEDPOST.type:
      case ENTITY.SIDEINDEX.type:
        alignment = (entity?.data && entity?.data.alignment) || alignment
        content = _.get(entity, 'data')
        content = Array.isArray(content) ? content : [content]
        break
      case ENTITY.IMAGELINK.type: {
        // use Embedded component to dangerouslySetInnerHTML
        type = ENTITY.EMBEDDEDCODE.type
        alignment = (entity?.data && entity?.data.alignment) || alignment
        const description = _.get(entity, ['data', 'description'], '')
        const url = _.get(entity, ['data', 'url'], '')
        content = [
          {
            caption: description,
            embeddedCodeWithoutScript: `<img alt="${description}" src="${url}" class="img-responsive"/>`,
            url: url,
          },
        ]
        break
      }
      case ENTITY.EMBEDDEDCODE.type: {
        alignment = (entity?.data && entity?.data.alignment) || alignment
        const caption = _.get(entity, ['data', 'caption'], '')
        const embeddedCode = _.get(entity, ['data', 'embeddedCode'], '')
        /** @type {Record<string, any>} */
        const script = {}
        /** @type {typeof script[]} */
        const scripts = []
        let scriptTagStart = false
        let height
        let width
        const parser = new htmlparser2.Parser({
          onopentag: (name, attribs) => {
            if (name === 'script') {
              scriptTagStart = true
              script.attribs = attribs
            } else if (name === 'iframe') {
              height = _.get(attribs, 'height', 0)
              width = _.get(attribs, 'width', 0)
            }
          },
          ontext: (text) => {
            if (scriptTagStart) {
              script.text = text
            }
          },
          onclosetag: (tagname) => {
            if (tagname === 'script' && scriptTagStart) {
              scriptTagStart = false
              scripts.push(script)
            }
          },
        })
        parser.write(embeddedCode)
        parser.end()

        content = [
          {
            caption,
            embeddedCode,
            embeddedCodeWithoutScript: embeddedCode.replace(
              /<script(.+?)\/script>/g,
              ''
            ),
            height,
            scripts,
            width,
          },
        ]

        break
      }
      default:
        return
    }

    // block type of api data should be lower case
    return new ApiDataInstance({
      id: block.key,
      alignment,
      type: type && type.toLowerCase(),
      content,
      styles,
    })
  },
}

export default processor
