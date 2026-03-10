import type { AdminConfig } from '@keystone-6/core/types'
import { admin } from '@mirrormedia/lilith-core'
import { CustomNavigation } from './components/CustomNavigation'

const { ListSearchMobileFix } = admin

function CustomLogo() {
  return (
    <>
      <ListSearchMobileFix />
      <h3>《鏡電視》</h3>
    </>
  )
}

export const components: AdminConfig['components'] = {
  Logo: CustomLogo,
  Navigation: CustomNavigation,
}
