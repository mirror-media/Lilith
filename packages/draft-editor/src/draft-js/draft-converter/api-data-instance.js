import { Record } from 'immutable'
import shortid from 'shortid'

/**
 * @typedef Property
 * @property {string} [id]
 * @property {string} [type]
 * @property {string} [alignment]
 * @property {any[]} [content]
 * @property {Record<string, any>} [styles]
 * @property {string} [textAlign]
 */

const ApiDataInstanceRecord = Record(
  /** @type {Property} */ ({
    id: shortid.generate(),
    type: 'paragraph',
    alignment: 'center',
    content: [],
    styles: {},
    textAlign: undefined,
  })
)

class ApiDataInstance extends ApiDataInstanceRecord {
  /**
   * @param {Property} props
   */
  constructor(props) {
    const id = (props && props.id) || shortid.generate()
    props.id = id
    super(props)
  }
  getId() {
    return this.get('id')
  }
  getType() {
    return this.get('type')
  }
  getAlignment() {
    return this.get('alignment')
  }
  getContent() {
    return this.get('content')
  }
  getStyles() {
    return this.get('styles')
  }
  getTextAlign() {
    return this.get('textAlign')
  }
}

export default ApiDataInstance
