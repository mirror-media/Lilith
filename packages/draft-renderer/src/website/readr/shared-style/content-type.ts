import { css } from 'styled-components'
import citationLink from '../assets/citation-link.png'

import {
  blockQuoteSpacingBetweenContent,
  defaultBlockQuoteStyle,
  defaultSpacingBetweenContent,
  noSpacingBetweenContent,
} from './index'

export const SummaryStyle = css`
  ${({ theme }) => theme.fontSize.sm};
  line-height: 1.6;

  *:not(:first-child) {
    .public-DraftStyleDefault-block {
      margin-top: 12px;
    }
  }

  .public-DraftStyleDefault-ul,
  .public-DraftStyleDefault-ol {
    margin-top: 12px;
  }

  .public-DraftStyleDefault-unorderedListItem,
  .public-DraftStyleDefault-orderedListItem {
    .public-DraftStyleDefault-block {
      margin-top: 4px;
    }
  }

  .public-DraftStyleDefault-blockquote {
    ${defaultBlockQuoteStyle};

    & + blockquote {
      ${blockQuoteSpacingBetweenContent};
    }
  }
`

export const NormalStyle = css`
  ${({ theme }) => theme.fontSize.md};
  line-height: 2;

  *:not(:first-child) {
    ${defaultSpacingBetweenContent}
  }

  .public-DraftStyleDefault-unorderedListItem,
  .public-DraftStyleDefault-orderedListItem {
    ${noSpacingBetweenContent};
  }

  .public-DraftStyleDefault-ul,
  .public-DraftStyleDefault-ol {
    margin-top: 32px;
  }

  .public-DraftStyleDefault-blockquote {
    ${defaultBlockQuoteStyle};

    & + blockquote {
      ${blockQuoteSpacingBetweenContent};
    }
  }
`

export const CitationStyle = css`
  ${({ theme }) => theme.fontSize.sm};
  line-height: 1.6;

  *:not(:first-child) {
    .public-DraftStyleDefault-block {
      margin-top: 12px;
    }
  }

  .public-DraftStyleDefault-unorderedListItem,
  .public-DraftStyleDefault-orderedListItem {
    .public-DraftStyleDefault-block {
      margin-top: 4px;
    }
  }

  .public-DraftStyleDefault-ul,
  .public-DraftStyleDefault-ol {
    margin-top: 12px;
  }

  //檔案下載
  .public-DraftStyleDefault-ul:has(a) {
    padding: 0;

    .public-DraftStyleDefault-unorderedListItem {
      list-style-type: none;
      padding: 8px 0;
    }

    a {
      width: 100%;
      border: none;
      font-weight: 700;
      font-size: 16px;
      line-height: 1.5;
      color: #04295e;
      display: inline-block;
      position: relative;
      padding-right: 60px;

      &:hover {
        color: rgba(0, 9, 40, 0.87);
      }

      &::after {
        content: '';
        background-image: url(${citationLink});
        background-repeat: no-repeat;
        background-position: center center;
        background-size: contain;
        position: absolute;
        right: 0;
        top: 50%;
        width: 24px;
        height: 24px;
        transform: translate(0%, -12px);
      }
    }
  }

  .public-DraftStyleDefault-blockquote {
    width: 100%;
    color: rgba(0, 9, 40, 0.5);
    ${({ theme }) => theme.fontSize.sm};
    line-height: 1.6;
    padding: 0;

    & + blockquote {
      ${blockQuoteSpacingBetweenContent};
    }

    & + ul {
      border-top: 1px solid rgba(0, 9, 40, 0.1);
      padding-top: 4px;

      ${({ theme }) => theme.breakpoint.md} {
        margin-top: 16px;
      }
    }
  }
`
