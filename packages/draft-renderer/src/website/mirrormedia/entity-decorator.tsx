import { CompositeDecorator } from 'draft-js'
import {} from './entity-decorator'
import { entityDecorators } from './entity-decorators'
import { ContentLayout } from './types'
const { annotationDecorator, linkDecorator } = entityDecorators

const decoratorsGenerator = (contentLayout: ContentLayout = 'normal') => {
  return new CompositeDecorator([
    annotationDecorator(contentLayout),
    linkDecorator(contentLayout),
  ])
}
export default decoratorsGenerator
