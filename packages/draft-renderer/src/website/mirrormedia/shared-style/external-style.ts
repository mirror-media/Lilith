import { css } from 'styled-components'
import { defaultMarginTop, defaultMarginBottom } from './index'
import {
  noSpacingBetweenContent,
  draftEditorLineHeight,
} from '../draft-renderer'

const narrowMarginBottom = css`
  margin-bottom: 16px;
`

/**
 * Since the `content` of the externals posts is in `string` format and not draft data (ex: blocks.entityMap).
 * So we create `draftEditorCssExternal` to manage `/external/[slug]` page's `content` style.
 * The styles are similar to `draftEditorCssNormal`, but there are differences in the block styles.(ex: image-block)
 */
const draftEditorCssExternal = css`
  width: 100%;
  height: 100%;
  border: 0;
  padding: 0px;
  font-size: 18px;
  line-height: ${draftEditorLineHeight};
  color: black;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-weight: normal;

  //last item in raw-content block should not have margin-bottom
  > div {
    > * {
      ${defaultMarginBottom}
    }
    > *:last-child {
      > *:last-child {
        margin-bottom: 0;
      }
    }
  }

  h2 {
    font-size: 36px;
    line-height: 1.5;
  }

  h3 {
    font-size: 30px;
    line-height: 1.5;
  }

  blockquote {
    color: rgba(97, 184, 198, 1);
    border-image: linear-gradient(
        to right,
        rgba(97, 184, 198, 1) 42.5%,
        transparent 42.5%,
        transparent 57.5%,
        rgba(97, 184, 198, 1) 57.5%
      )
      100% 1;
    &::before {
      background-color: rgba(97, 184, 198, 1);
    }
  }

  img {
    ${defaultMarginTop}
    ${narrowMarginBottom}
  }

  a {
    color: #054f77;
    text-decoration: underline;
    text-underline-offset: 2px;
    &:active {
      color: rgba(157, 157, 157, 1);
    }
  }

  ol {
    margin-left: 18px;
    ${defaultMarginBottom}

    > * {
      ${noSpacingBetweenContent.list}
    }

    > li {
      position: relative;
      counter-increment: list;
      padding-left: 6px;
      &::before {
        content: counter(list) '.';
        position: absolute;
        color: #054f77;
        left: -15px;
        width: auto;
      }
    }
  }

  ul {
    margin-left: 18px;
    list-style: none;
    ${defaultMarginBottom}

    > * {
      ${noSpacingBetweenContent.list}
    }

    > li {
      position: relative;
      &::before {
        content: '';
        position: absolute;
        top: calc((1rem * ${draftEditorLineHeight}) / 2);
        left: -12px;
        width: 6px;
        height: 6px;
        transform: translateX(-50%);
        border-radius: 50%;
        background-color: #054f77;
      }
    }
  }
`
export { draftEditorCssExternal }
