import type { AdminConfig } from '@keystone-6/core/types'
import { CustomNavigation } from './components/custom-navigation'

function CustomLogo() {
  return <h3>《鏡週刊》</h3>
}

export const components: AdminConfig['components'] = {
  Logo: CustomLogo,
  Navigation: CustomNavigation,
}
