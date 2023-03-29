export const mediaSize = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 960,
  xl: 1200,
  xxl: 1400,
}

export const theme = {
  breakpoint: {
    xs: `@media (min-width: ${mediaSize.xs}px)`,
    sm: `@media (min-width: ${mediaSize.sm}px)`,
    md: `@media (min-width: ${mediaSize.md}px)`,
    lg: `@media (min-width: ${mediaSize.lg}px)`,
    xl: `@media (min-width: ${mediaSize.xl}px)`,
    xxl: `@media (min-width: ${mediaSize.xxl}px)`,
  },
}

export default theme
