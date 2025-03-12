import { useCallback } from 'react'
import { useWindowSize } from 'usehooks-ts'

export function useButtonDisabledChecker({
  mobileBoundary,
  disabledButtons,
  hideOnMobileButtons,
}: {
  mobileBoundary: number
  disabledButtons?: string[]
  hideOnMobileButtons?: string[]
}) {
  const { width } = useWindowSize()

  const checkIsDisabled = useCallback(
    (buttonName: string) => {
      let isDisabled = false
      if (Array.isArray(disabledButtons)) {
        isDisabled ||= disabledButtons.includes(buttonName)
      }

      if (Array.isArray(hideOnMobileButtons) && width < mobileBoundary) {
        isDisabled ||= hideOnMobileButtons.includes(buttonName)
      }

      return isDisabled
    },
    [width]
  )

  return checkIsDisabled
}
