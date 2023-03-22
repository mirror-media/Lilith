import { CompositeDecorator } from 'draft-js'
import {} from './entity-decorator'
import { entityDecorators } from './entity-decorators'

const { annotationDecorator, linkDecorator } = entityDecorators

const decorators = new CompositeDecorator([annotationDecorator, linkDecorator])

export default decorators
