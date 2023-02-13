import { CompositeDecorator } from 'draft-js'
import { annotationDecorator } from '../custom/entity-decorator/annotation-decorator'
import { linkDecorator } from '../custom/entity-decorator/link-decorator'

const decorators = new CompositeDecorator([annotationDecorator, linkDecorator])

export default decorators
