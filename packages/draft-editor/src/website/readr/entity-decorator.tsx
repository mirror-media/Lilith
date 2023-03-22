import { CompositeDecorator } from 'draft-js'
import Readr from '@mirrormedia/lilith-draft-renderer/lib/website/readr'

const { annotationDecorator, linkDecorator } = Readr.entityDecorators

const decorators = new CompositeDecorator([annotationDecorator, linkDecorator])

export default decorators
