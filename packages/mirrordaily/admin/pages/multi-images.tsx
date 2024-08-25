import { PageContainer } from '@keystone-6/core/admin-ui/components'
import { Heading } from '@keystone-ui/core'
import { store } from '../redux/store'
import { Provider } from 'react-redux'
import MainContainer from '../components/main-container'

export default function MultiImages() {
  return (
    <PageContainer
      title="Multi Images"
      header={<Heading type="h3">Multi Images</Heading>}
    >
      <Provider store={store}>
        <MainContainer />
      </Provider>
    </PageContainer>
  )
}
