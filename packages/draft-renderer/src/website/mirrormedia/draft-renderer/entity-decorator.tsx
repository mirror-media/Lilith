import { CompositeDecorator } from 'draft-js'
import { entityDecorator } from '../custom'

const { annotationDecorator, linkDecorator } = entityDecorator

const decorators = new CompositeDecorator([annotationDecorator, linkDecorator])

export default decorators
