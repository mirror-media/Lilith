import { css } from 'styled-components'

export const blockQuoteSpacingBetweenContent = css`
  .public-DraftStyleDefault-block {
    margin-top: 8px;
  }
`
export const textAroundPictureStyle = css`
  max-width: 33.3%;
  > figure {
    margin-bottom: 0;
    width: 150%;
    transform: unset;
  }
  figcaption {
    padding: 0;
  }
`

export const defaultH2Style = css`
  ${({ theme }) => theme.fontSize.lg};
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0.032em;
  color: #000928;

  ${({ theme }) => theme.breakpoint.md} {
    ${({ theme }) => theme.fontSize.xl};
  }
`

export const defaultUlStyle = css`
  list-style-type: disc;
  padding-left: 1.2rem;
`

export const defaultUnorderedListStyle = css`
  letter-spacing: 0.01em;
  text-align: justify;
  color: rgba(0, 9, 40, 0.87);
`

export const defaultOlStyle = css`
  list-style-type: decimal;
  padding-left: 1.2rem;
`

export const defaultOrderedListStyle = css`
  letter-spacing: 0.01em;
  text-align: justify;
  color: rgba(0, 9, 40, 0.87);
`

export const defaultLinkStyle = css`
  display: inline;
  border-bottom: 2px solid #ebf02c;
  letter-spacing: 0.01em;
  text-align: justify;
  color: rgba(0, 9, 40, 0.87);
  padding-bottom: 2px;

  &:hover {
    border-bottom: 2px solid #04295e;
  }
`

export const defaultBlockQuoteStyle = css`
  ${({ theme }) => theme.fontSize.sm};
  line-height: 1.6;
  color: rgba(0, 9, 40, 0.66);
  opacity: 0.87;
  padding: 0 20px;
`

export const defaultSpacingBetweenContent = css`
  .public-DraftStyleDefault-block {
    margin-top: 32px;
  }
`

export const narrowSpacingBetweenContent = css`
  .public-DraftStyleDefault-block {
    margin-top: 16px;
  }
`

export const noSpacingBetweenContent = css`
  .public-DraftStyleDefault-block {
    margin-top: unset;
  }
`
