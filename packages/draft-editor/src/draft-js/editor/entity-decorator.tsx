import { CompositeDecorator } from 'draft-js'
import { annotationDecorator } from '../entity-decorator/annotation-decorator'
import { linkDecorator } from '../entity-decorator/link-decorator'

const decorators = new CompositeDecorator([annotationDecorator, linkDecorator])

export default decorators
