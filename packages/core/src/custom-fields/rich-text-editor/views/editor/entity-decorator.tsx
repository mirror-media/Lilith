import { CompositeDecorator } from 'draft-js'
import { annotationDecorator } from './annotation'
import { linkDecorator } from './link'

const decorators = new CompositeDecorator([annotationDecorator, linkDecorator])

export default decorators
