import type { AdminConfig } from '@keystone-6/core/types'
import { ListSearchMobileFix } from '../../core/src/admin/list-search-mobile-fix'
import { CustomNavigation } from './components/custom-navigation'

function CustomLogo() {
  return (
    <>
      <ListSearchMobileFix />
      <h3>《鏡週刊》</h3>
    </>
  )
}

export const components: AdminConfig['components'] = {
  Logo: CustomLogo,
  Navigation: CustomNavigation,
}
