import React from 'react'

/**
 * Injects global CSS to fix the Keystone list page search box on mobile.
 *
 * On mobile, the search toolbar (Stack across) puts the search input,
 * Create button, and Filter buttons all in one row, causing the search
 * input to be squeezed too small to use.
 *
 * This component makes the toolbar wrap on mobile so the search input
 * takes the full width and other buttons wrap to the next line.
 */
export function ListSearchMobileFix() {
  return (
    <style>{`
      @media (max-width: 767px) {
        main > div:has(> div > form) {
          flex-wrap: wrap !important;
          width: 100% !important;
        }
        main > div > div:has(> form) {
          width: 100%;
        }
        main form > div {
          width: 100% !important;
        }
        main form > div > div:first-child {
          flex: 1;
          min-width: 0;
        }
      }
    `}</style>
  )
}
