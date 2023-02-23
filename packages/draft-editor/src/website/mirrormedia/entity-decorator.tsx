import { CompositeDecorator } from 'draft-js'
import MirrorMedia from '@mirrormedia/lilith-draft-renderer/lib/website/mirrormedia'

const { annotationDecorator, linkDecorator } = MirrorMedia.entityDecorators

const decorators = new CompositeDecorator([annotationDecorator, linkDecorator])

export default decorators
