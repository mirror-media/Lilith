import type { AdminConfig } from '@keystone-6/core/types'
import { CustomNavigation } from './components/CustomNavigation'
import { admin } from '@mirrormedia/lilith-core'

const { ListSearchMobileFix } = admin

function MultiSelectTruncationFix() {
  return (
    <style>{`
      /* Prevent long multi-value labels from expanding the select control */
      div:has(> div[role="button"][aria-label^="Remove "]) {
        max-width: 500px !important;
      }
      div:has(+ div[role="button"][aria-label^="Remove "]) {
        min-width: 0 !important;
        white-space: normal !important;
      }
    `}</style>
  )
}

function CustomLogo() {
  return (
    <>
      <ListSearchMobileFix />
      <MultiSelectTruncationFix />
      <h3>《鏡報》</h3>
    </>
  )
}

export const components: AdminConfig['components'] = {
  Logo: CustomLogo,
  Navigation: CustomNavigation,
}
