import type { AdminConfig } from '@keystone-6/core/types'
import { CustomNavigation } from './components/custom-navigation'
export const components: AdminConfig['components'] = {
  Navigation: CustomNavigation,
}
