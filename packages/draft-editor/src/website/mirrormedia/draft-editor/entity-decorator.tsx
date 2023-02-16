import { CompositeDecorator } from 'draft-js'
import { MirrorMedia } from '@mirrormedia/lilith-draft-renderer'

const { annotationDecorator, linkDecorator } = MirrorMedia.entityDecorator

const decorators = new CompositeDecorator([annotationDecorator, linkDecorator])

export default decorators
