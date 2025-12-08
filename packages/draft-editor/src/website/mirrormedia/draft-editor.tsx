import React, { Fragment } from 'react'
import styled, { css, StyledComponent, ThemeProvider } from 'styled-components'
import theme, { mediaSize } from './theme'
import {
  ContentBlock,
  DraftBlockType,
  DraftEditorCommand,
  DraftHandleValue,
  DraftInlineStyle,
  Editor,
  EditorState,
  KeyBindingUtil,
  RichUtils,
  getDefaultKeyBinding,
} from 'draft-js'

import { atomicBlockRenderer } from './block-renderer-fn'
import decorators from './entity-decorator'
import { AnnotationButton } from '../../draft-js/buttons/annotation'
import { EmbeddedCodeButton } from '../../draft-js/buttons/embedded-code'
import { EnlargeButton } from '../../draft-js/buttons/enlarge'
import { ImageButton } from '../../draft-js/buttons/image'
import { InfoBoxButton } from '../../draft-js/buttons/info-box'
import { LinkButton } from '../../draft-js/buttons/link'
import { SlideshowButton } from '../../draft-js/buttons/slideshow'
import { TableButton } from '../../draft-js/buttons/table'
import { DividerButton } from '../../draft-js/buttons/divider'
import { ColorBoxButton } from '../../draft-js/buttons/color-box'
import { BGImageButton } from '../../draft-js/buttons/background-image'
import { BGVideoButton } from '../../draft-js/buttons/background-video'
import { RelatedPostButton } from '../../draft-js/buttons/related-post'
import { SideIndexButton } from '../../draft-js/buttons/side-index'
import {
  AlignCenterButton,
  AlignLeftButton,
  getSelectionBlockData,
} from '../../draft-js/buttons/text-align'
import { FontColorButton } from '../../draft-js/buttons/font-color'
import { BackgroundColorButton } from '../../draft-js/buttons/background-color'
import { VideoButton } from '../../draft-js/buttons/video'
import { AudioButton } from '../../draft-js/buttons/audio'
import { YoutubeButton } from '../../draft-js/buttons/youtube'

import {
  CUSTOM_STYLE_PREFIX_FONT_COLOR,
  CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR,
} from '../../draft-js/const'
import { ImageEntity, ImageSelector } from './selector/image-selector'
import { VideoEntity, VideoSelector } from './selector/video-selector'
import { PostEntity, PostSelector } from './selector/post-selector'
import { AudioEntity, AudioSelector } from './selector/audio-selector'
import { defaultMarginBottom } from './shared-style'
import { useButtonDisabledChecker } from '../../hooks'

export const buttonNames = {
  // inline styles
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  code: 'code',

  // block styles
  h2: 'header-two',
  h3: 'header-three',
  h4: 'header-four',
  blockquote: 'blockquote',
  ul: 'unordered-list-item',
  ol: 'ordered-list-item',
  codeBlock: 'code-block',

  // custom styles
  annotation: 'annotation',
  divider: 'divider',
  embed: 'embed',
  fontColor: 'font-color',
  image: 'image',
  infoBox: 'info-box',
  link: 'link',
  slideshow: 'slideshow',
  table: 'table',
  textAlign: 'text-align',
  colorBox: 'color-box',
  backgroundColor: 'background-color',
  backgroundImage: 'background-image',
  backgroundVideo: 'background-video',
  relatedPost: 'related-post',
  sideIndex: 'side-index',
  video: 'video',
  audio: 'audio',
  youtube: 'youtube',
} as const

type ButtonName = (typeof buttonNames)[keyof typeof buttonNames]

const disabledButtonsOnBasicEditor: ButtonName[] = [
  buttonNames.annotation,
  buttonNames.divider,
  buttonNames.embed,
  buttonNames.image,
  buttonNames.infoBox,
  buttonNames.slideshow,
  buttonNames.table,
  buttonNames.textAlign,
  buttonNames.colorBox,
  buttonNames.backgroundColor,
  buttonNames.backgroundImage,
  buttonNames.backgroundVideo,
  buttonNames.relatedPost,
  buttonNames.sideIndex,
  buttonNames.video,
  buttonNames.audio,
  buttonNames.youtube,
]

type ButtonStyleProps = {
  isActive?: boolean
  isDisabled?: boolean
  readOnly?: boolean
}

const buttonStyle = css<ButtonStyleProps>`
  border-radius: 6px;
  text-align: center;
  font-size: 1rem;
  padding: 0 12px;
  margin: 0px 0px 10px 0px;
  background-color: #fff;
  border: solid 1px rgb(193, 199, 208);
  align-items: center;
  height: 40px;

  cursor: ${({ readOnly }) => {
    if (readOnly) {
      return 'not-allowed'
    }
    return 'pointer'
  }};
  color: ${({ readOnly, isActive }) => {
    if (readOnly) {
      return '#c1c7d0'
    }
    if (isActive) {
      return '#3b82f6'
    }
    return '#6b7280'
  }};
  border: solid 1px
    ${({ readOnly, isActive }) => {
      if (readOnly) {
        return '#c1c7d0'
      }
      if (isActive) {
        return '#3b82f6'
      }
      return '#6b7280'
    }};
  box-shadow: ${({ readOnly, isActive }) => {
    if (readOnly) {
      return 'unset'
    }
    if (isActive) {
      return 'rgba(38, 132, 255, 20%)  0px 1px 4px '
    }
    return 'unset'
  }};
  transition: box-shadow 100ms linear;

  display: ${({ isDisabled }) => {
    if (isDisabled) {
      return 'none'
    }
    return 'inline-flex'
  }};
`

const longFormButtonStyle = css`
  ${buttonStyle}
  color: ${({ readOnly, isActive }) => {
    if (readOnly) {
      return '#c1c7d0'
    }
    if (isActive) {
      return '#ED8B00'
    }
    return '#6b7280'
  }};
  border: solid 1px
    ${({ readOnly, isActive }) => {
      if (readOnly) {
        return '#c1c7d0'
      }
      if (isActive) {
        return '#ED8B00'
      }
      return '#FECC85'
    }};
  box-shadow: ${({ readOnly, isActive }) => {
    if (readOnly) {
      return 'unset'
    }
    if (isActive) {
      return 'rgba(237, 139, 0, 0.5) 0px 1px 4px'
    }
    return 'unset'
  }};
`

const CustomFontColorButton = styled(FontColorButton)<ButtonStyleProps>`
  ${buttonStyle}
`

const CustomBackgroundColorButton = styled(
  BackgroundColorButton
)<ButtonStyleProps>`
  ${longFormButtonStyle}
`

const CustomButton = styled.div<ButtonStyleProps>`
  ${buttonStyle}
`

const CustomAnnotationButton = styled(AnnotationButton)<ButtonStyleProps>`
  ${buttonStyle}
`

const CustomLinkButton = styled(LinkButton)<ButtonStyleProps>`
  ${buttonStyle}
`

function createButtonWithoutProps<T extends React.FC<any>>(
  referenceComponent: T,
  isLongForm = false,
  additionalCSS = ``
) {
  const component: React.FC<any> = referenceComponent

  return (
    isLongForm
      ? styled(component).withConfig({
          shouldForwardProp: (prop) =>
            !['isActive', 'isDisabled', 'readOnly'].includes(prop),
        })`
          ${longFormButtonStyle}
          ${additionalCSS}
        `
      : styled(component).withConfig({
          shouldForwardProp: (prop) =>
            !['isActive', 'isDisabled', 'readOnly'].includes(prop),
        })`
          ${buttonStyle}
          ${additionalCSS}
        `
  ) as StyledComponent<T, any, ButtonStyleProps, never>
}
const CustomEnlargeButton = createButtonWithoutProps(
  EnlargeButton,
  false,
  `color: #999`
)
const CustomImageButton = createButtonWithoutProps(ImageButton<ImageEntity>)
const CustomSlideshowButton = createButtonWithoutProps(
  SlideshowButton<ImageEntity>
)
const CustomEmbeddedCodeButton = createButtonWithoutProps(EmbeddedCodeButton)
const CustomTableButton = createButtonWithoutProps(TableButton)
const CustomInfoBoxButton = createButtonWithoutProps(InfoBoxButton)
const CustomDividerButton = createButtonWithoutProps(DividerButton)
const CustomColorBoxButton = createButtonWithoutProps(ColorBoxButton, true)
const CustomBGImageButton = createButtonWithoutProps(
  BGImageButton<ImageEntity>,
  true
)
const CustomBGVideoButton = createButtonWithoutProps(
  BGVideoButton<VideoEntity>,
  true
)
const CustomRelatedPostButton = createButtonWithoutProps(
  RelatedPostButton<PostEntity>,
  true
)
const CustomSideIndexButton = createButtonWithoutProps(SideIndexButton, true)
const CustomAlignCenterButton = createButtonWithoutProps(
  AlignCenterButton,
  true
)
const CustomAlignLeftButton = createButtonWithoutProps(AlignLeftButton, true)
const CustomVideoButton = createButtonWithoutProps(VideoButton<VideoEntity>)
const CustomAudioButton = createButtonWithoutProps(AudioButton<AudioEntity>)
const CustomYoutubeButton = createButtonWithoutProps(YoutubeButton)

const DraftEditorWrapper = styled.div`
  /* Rich-editor default setting (.RichEditor-root)*/
  background: #fff;
  border: 1px solid #ddd;
  font-family: 'Georgia', serif;
  font-size: 14px;
  padding: 15px;

  /* Custom setting */
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  width: 100%;
  height: 100%;
  background: rgb(255, 255, 255);
  border-radius: 6px;
  padding: 0 1rem 1rem;
  font-size: 18px;
  line-height: 2;
  letter-spacing: 0.5px;

  .public-DraftStyleDefault-block {
    ${defaultMarginBottom}
  }

  /* Draft built-in buttons' style */
  .public-DraftStyleDefault-header-two {
    font-size: 36px;
    line-height: 1.5;
  }
  .public-DraftStyleDefault-header-three {
    font-size: 30px;
    line-height: 1.5;
  }
  .public-DraftStyleDefault-header-four {
  }
  .public-DraftStyleDefault-blockquote {
  }
  .public-DraftStyleDefault-ul {
    ${defaultMarginBottom}
  }
  .public-DraftStyleDefault-unorderedListItem {
  }
  .public-DraftStyleDefault-ol {
    ${defaultMarginBottom}
  }
  .public-DraftStyleDefault-orderedListItem {
  }
  /* code-block */
  .public-DraftStyleDefault-pre {
  }
  .alignCenter * {
    text-align: center;
  }
  .alignLeft * {
    text-align: left;
  }
`

const DraftEditorControls = styled.div`
  padding-top: 1rem;
  width: 100%;
  background: rgb(255, 255, 255);
`

const DraftEditorControlsWrapper = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding-right: 45px;
  column-gap: 5px;
`

const TextEditorWrapper = styled.div`
  /* Rich-editor default setting (.RichEditor-editor)*/
  border-top: 1px solid #ddd;
  cursor: text;
  font-size: 16px;
  margin-top: 10px;
  /* Custom setting */
  h2 {
    font-size: 22px;
  }
  h3 {
    font-size: 17.5px;
  }
  font-weight: normal;
  max-width: 800px;

  // atimoic block float setting
  display: flow-root;
  figure {
    clear: both;
    margin: 0;
  }
  figure.left {
    float: left;
    width: 33%;
  }
  figure.right {
    float: right;
    width: 33%;
  }
`

const DraftEditorContainer = styled.div<{ isEnlarged: boolean }>`
  position: relative;
  margin-top: 4px;
  ${({ isEnlarged }) =>
    isEnlarged
      ? css`
          position: fixed;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          z-index: 30;
          padding-left: 3em;
          padding-right: 3em;
          background: rgba(0, 0, 0, 0.5);
        `
      : ''}
  ${DraftEditorWrapper} {
    ${({ isEnlarged }) =>
      isEnlarged
        ? css`
            width: 100%;
            height: 100%;
            padding: 0 1rem 0;
            overflow: scroll;
          `
        : ''}
  }
  ${DraftEditorControls} {
    ${({ isEnlarged }) =>
      isEnlarged
        ? css`
            position: sticky;
            top: 0;
            z-index: 12;
          `
        : ''}
  }
  ${DraftEditorControlsWrapper} {
    ${({ isEnlarged }) =>
      isEnlarged
        ? css`
            overflow: auto;
            padding-bottom: 0;
          `
        : ''}
  }
  ${TextEditorWrapper} {
    ${({ isEnlarged }) =>
      isEnlarged
        ? css`
            max-width: 100%;
            min-height: 100vh;
            padding-bottom: 0;
          `
        : ''}
  }
`

const ButtonGroup = styled.div<{ isDisabled?: boolean }>`
  margin: 0 10px 0 0;
  ${({ isDisabled }) =>
    isDisabled
      ? css`
          display: none;
        `
      : ''}
`

const EnlargeButtonWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  margin: 0;
`

type RichTextEditorProps = {
  onChange: (editorState: EditorState) => void
  editorState: EditorState
  disabledButtons: string[]
  hideOnMobileButtons?: string[]
}

type BasicEditorProps = Pick<RichTextEditorProps, 'editorState' | 'onChange'>

const MOBILE_BOUNDARY = mediaSize.md

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  editorState: propEditorState,
  onChange,
  disabledButtons = [],
  hideOnMobileButtons = [],
}) => {
  const [isEnlarged, setIsEnlarged] = React.useState(false)
  const [readOnly, setReadOnly] = React.useState(false)
  const editorRef = React.useRef<Editor>(null)
  const checkIsDisabled = useButtonDisabledChecker({
    mobileBoundary: MOBILE_BOUNDARY,
    disabledButtons,
    hideOnMobileButtons,
  })

  // Custom overrides for "code" style.
  const customStyleMap = {
    CODE: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: 16,
      padding: 2,
    },
  }

  let editorState = propEditorState
  if (!(editorState instanceof EditorState)) {
    editorState = EditorState.createEmpty(decorators)
  }

  const handleKeyCommand = (
    command: DraftEditorCommand,
    editorState: EditorState
  ): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (newState) {
      onChange(newState)
      return 'handled'
    }
    return 'not-handled'
  }

  const handleReturn = (event: React.KeyboardEvent) => {
    if (KeyBindingUtil.isSoftNewlineEvent(event)) {
      onChange(RichUtils.insertSoftNewline(editorState))
      return 'handled'
    }
    return 'not-handled'
  }

  const mapKeyToEditorCommand = (e: React.KeyboardEvent) => {
    if (e.keyCode === 9 /* TAB */) {
      const newEditorState = RichUtils.onTab(e, editorState, 4 /* maxDepth */)
      if (newEditorState !== editorState) {
        onChange(newEditorState)
      }
      return null
    }
    return getDefaultKeyBinding(e)
  }

  const toggleBlockType = (blockType: DraftBlockType) => {
    onChange(RichUtils.toggleBlockType(editorState, blockType))
  }

  const toggleInlineStyle = (inlineStyle: string) => {
    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle))
  }

  const getEntityType = (editorState: EditorState) => {
    const contentState = editorState.getCurrentContent()
    const selection = editorState.getSelection()
    const startOffset = selection.getStartOffset()
    const startBlock = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())

    const endOffset = selection.getEndOffset()
    let entityInstance
    let entityKey

    if (!selection.isCollapsed()) {
      entityKey = startBlock.getEntityAt(startOffset)
    } else {
      entityKey = startBlock.getEntityAt(endOffset)
    }

    if (entityKey !== null) {
      entityInstance = contentState.getEntity(entityKey)
    }

    let entityType = ''
    if (entityInstance) {
      entityType = entityInstance.getType()
    }

    return entityType
  }

  const getCustomStyle = (style: DraftInlineStyle) => {
    return style.reduce((styles = {}, styleName) => {
      if (styleName?.startsWith(CUSTOM_STYLE_PREFIX_FONT_COLOR)) {
        styles['color'] = styleName.split(CUSTOM_STYLE_PREFIX_FONT_COLOR)[1]
      }
      if (styleName?.startsWith(CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR)) {
        styles['backgroundColor'] = styleName.split(
          CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR
        )[1]
      }
      return styles
    }, {} as Record<string, any>)
  }

  const customStyleFn = (style: DraftInlineStyle) => {
    return getCustomStyle(style)
  }

  const toggleEnlarge = () => {
    setIsEnlarged(!isEnlarged)
  }

  const blockStyleFn = (block: ContentBlock) => {
    const entityKey = block.getEntityAt(0)
    const entity = entityKey
      ? editorState.getCurrentContent().getEntity(entityKey)
      : null

    let result = ''
    const blockData = block.getData()
    if (blockData) {
      const textAlign = blockData?.get('textAlign')
      if (textAlign === 'center') {
        result += 'alignCenter '
      } else if (textAlign === 'left') {
        result += 'alignLeft '
      }
    }

    switch (block.getType()) {
      case 'header-two':
      case 'header-three':
      case 'header-four':
      case 'blockquote':
        result += 'public-DraftStyleDefault-' + block.getType()
        break
      case 'atomic':
        if (entity?.getData()?.alignment) {
          // support all atomic block to set alignment
          result += ' ' + entity.getData().alignment
        }
        break
      default:
        break
    }
    return result
  }

  const renderBasicEditor = (propsOfBasicEditor: BasicEditorProps) => {
    return (
      <RichTextEditor
        {...propsOfBasicEditor}
        disabledButtons={disabledButtonsOnBasicEditor}
        hideOnMobileButtons={hideOnMobileButtons}
      />
    )
  }

  const blockRendererFn = (block: ContentBlock) => {
    const atomicBlockObj = atomicBlockRenderer(block)
    if (atomicBlockObj) {
      const onEditStart = () => {
        // If custom block renderer requires mouse interaction,
        // [Draft.js document](https://draftjs.org/docs/advanced-topics-block-components#recommendations-and-other-notes)
        // suggests that we should temporarily set Editor
        // to readOnly={true} during the interaction.
        // In readOnly={true} condition, the user does not
        // trigger any selection changes within the editor
        // while interacting with custom block.
        // If we don't set readOnly={true},
        // it will cause some subtle bugs in InfoBox button.
        setReadOnly(true)
      }
      const onEditFinish = ({
        entityKey,
        entityData,
      }: {
        entityKey?: string
        entityData?: Record<string, unknown>
      }) => {
        if (entityKey && entityData) {
          const oldContentState = editorState.getCurrentContent()
          const newContentState = oldContentState.replaceEntityData(
            entityKey,
            entityData
          )
          onChange(
            EditorState.set(editorState, {
              currentContent: newContentState,
            })
          )
        }
        // Custom block interaction is finished.
        // Therefore, we set readOnly={false} to
        // make editor editable.
        setReadOnly(false)
      }

      // `onEditStart` and `onEditFinish` will be passed
      // into custom block component.
      // We can get them via `props.blockProps.onEditStart`
      // and `props.blockProps.onEditFinish` in the custom block components.
      const extendedAtomicBlockObj = Object.assign({}, atomicBlockObj, {
        props: {
          onEditStart,
          onEditFinish,
          getMainEditorReadOnly: () => readOnly,
          renderBasicEditor: renderBasicEditor,
        },
      })
      return extendedAtomicBlockObj
    } else {
      return atomicBlockObj
    }
  }

  const entityType = getEntityType(editorState)
  const customStyle = getCustomStyle(editorState.getCurrentInlineStyle())

  return (
    <ThemeProvider theme={theme}>
      <DraftEditorContainer isEnlarged={Boolean(isEnlarged)}>
        <DraftEditorWrapper>
          <link
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
            rel="stylesheet"
            type="text/css"
          />
          <link
            href="https://cdnjs.cloudflare.com/ajax/libs/draft-js/0.11.7/Draft.css"
            rel="stylesheet"
            type="text/css"
          />
          <link
            href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css"
            rel="stylesheet"
            type="text/css"
          />
          <DraftEditorControls>
            <DraftEditorControlsWrapper>
              <BlockStyleControls
                readOnly={readOnly}
                disabledButtons={disabledButtons}
                hideOnMobileButtons={hideOnMobileButtons}
                editorState={editorState}
                onToggle={toggleBlockType}
              />
              <InlineStyleControls
                readOnly={readOnly}
                disabledButtons={disabledButtons}
                hideOnMobileButtons={hideOnMobileButtons}
                editorState={editorState}
                onToggle={toggleInlineStyle}
              />
              <EnlargeButtonWrapper>
                <CustomEnlargeButton
                  onToggle={toggleEnlarge}
                  isEnlarged={isEnlarged}
                ></CustomEnlargeButton>
              </EnlargeButtonWrapper>
            </DraftEditorControlsWrapper>
            <DraftEditorControlsWrapper>
              <ButtonGroup
                isDisabled={disabledButtons.includes(buttonNames.link)}
              >
                <CustomLinkButton
                  isDisabled={checkIsDisabled(buttonNames.link)}
                  isActive={entityType === 'LINK'}
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                />
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(buttonNames.fontColor)}
              >
                <CustomFontColorButton
                  isDisabled={checkIsDisabled(buttonNames.fontColor)}
                  isActive={Object.prototype.hasOwnProperty.call(
                    customStyle,
                    'color'
                  )}
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                />
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(buttonNames.divider)}
              >
                <CustomDividerButton
                  isDisabled={checkIsDisabled(buttonNames.divider)}
                  editorState={editorState}
                  onChange={onChange}
                ></CustomDividerButton>
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(buttonNames.annotation)}
              >
                <CustomAnnotationButton
                  isDisabled={checkIsDisabled(buttonNames.annotation)}
                  isActive={entityType === 'ANNOTATION'}
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                  renderBasicEditor={renderBasicEditor}
                  decorators={decorators}
                />
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(buttonNames.image)}
              >
                <CustomImageButton
                  isDisabled={checkIsDisabled(buttonNames.image)}
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                  ImageSelector={ImageSelector}
                />
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(buttonNames.video)}
              >
                <CustomVideoButton
                  isDisabled={checkIsDisabled(buttonNames.video)}
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                  VideoSelector={VideoSelector}
                />
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(buttonNames.youtube)}
              >
                <CustomYoutubeButton
                  isDisabled={checkIsDisabled(buttonNames.youtube)}
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                />
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(buttonNames.audio)}
              >
                <CustomAudioButton
                  isDisabled={checkIsDisabled(buttonNames.audio)}
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                  AudioSelector={AudioSelector}
                />
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(buttonNames.slideshow)}
              >
                <CustomSlideshowButton
                  isDisabled={checkIsDisabled(buttonNames.slideshow)}
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                  ImageSelector={ImageSelector}
                />
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(buttonNames.infoBox)}
              >
                <CustomInfoBoxButton
                  isDisabled={checkIsDisabled(buttonNames.infoBox)}
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                  renderBasicEditor={renderBasicEditor}
                  // decorators={decorators}
                />
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(buttonNames.embed)}
              >
                <CustomEmbeddedCodeButton
                  isDisabled={checkIsDisabled(buttonNames.embed)}
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                ></CustomEmbeddedCodeButton>
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(buttonNames.table)}
              >
                <CustomTableButton
                  isDisabled={checkIsDisabled(buttonNames.table)}
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                ></CustomTableButton>
              </ButtonGroup>
            </DraftEditorControlsWrapper>
            <DraftEditorControlsWrapper>
              <ButtonGroup
                isDisabled={disabledButtons.includes(buttonNames.textAlign)}
              >
                <CustomAlignLeftButton
                  isDisabled={checkIsDisabled(buttonNames.textAlign)}
                  isActive={
                    getSelectionBlockData(editorState, 'textAlign') === 'left'
                  }
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                />
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(buttonNames.textAlign)}
              >
                <CustomAlignCenterButton
                  isDisabled={checkIsDisabled(buttonNames.textAlign)}
                  isActive={
                    getSelectionBlockData(editorState, 'textAlign') === 'center'
                  }
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                />
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(buttonNames.colorBox)}
              >
                <CustomColorBoxButton
                  isDisabled={checkIsDisabled(buttonNames.colorBox)}
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                  renderBasicEditor={renderBasicEditor}
                  // decorators={decorators}
                />
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(
                  buttonNames.backgroundColor
                )}
              >
                <CustomBackgroundColorButton
                  isDisabled={checkIsDisabled(buttonNames.backgroundColor)}
                  isActive={Object.prototype.hasOwnProperty.call(
                    customStyle,
                    'backgroundColor'
                  )}
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                />
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(
                  buttonNames.backgroundImage
                )}
              >
                <CustomBGImageButton
                  isDisabled={checkIsDisabled(buttonNames.backgroundImage)}
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                  ImageSelector={ImageSelector}
                  renderBasicEditor={renderBasicEditor}
                  decorators={decorators}
                />
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(
                  buttonNames.backgroundVideo
                )}
              >
                <CustomBGVideoButton
                  isDisabled={checkIsDisabled(buttonNames.backgroundVideo)}
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                  VideoSelector={VideoSelector}
                  renderBasicEditor={renderBasicEditor}
                  decorators={decorators}
                />
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(buttonNames.relatedPost)}
              >
                <CustomRelatedPostButton
                  isDisabled={checkIsDisabled(buttonNames.relatedPost)}
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                  PostSelector={PostSelector}
                />
              </ButtonGroup>
              <ButtonGroup
                isDisabled={disabledButtons.includes(buttonNames.sideIndex)}
              >
                <CustomSideIndexButton
                  isDisabled={checkIsDisabled(buttonNames.sideIndex)}
                  readOnly={readOnly}
                  editorState={editorState}
                  onChange={onChange}
                />
              </ButtonGroup>
            </DraftEditorControlsWrapper>
          </DraftEditorControls>
          <TextEditorWrapper
            onClick={() => {
              editorRef.current?.focus()
            }}
          >
            <Editor
              blockStyleFn={blockStyleFn}
              blockRendererFn={blockRendererFn}
              customStyleMap={customStyleMap}
              customStyleFn={customStyleFn}
              editorState={editorState}
              handleKeyCommand={handleKeyCommand}
              handleReturn={handleReturn}
              keyBindingFn={mapKeyToEditorCommand}
              onChange={onChange}
              placeholder="Tell a story..."
              ref={editorRef}
              spellCheck={true}
              readOnly={readOnly}
            />
          </TextEditorWrapper>
        </DraftEditorWrapper>
      </DraftEditorContainer>
    </ThemeProvider>
  )
}

type StyleButtonProps = ButtonStyleProps & {
  label: string
  onToggle: (value: string) => void
  style: string
  icon: string
}

const StyleButton = (props: StyleButtonProps) => {
  const onToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    props.onToggle(props.style)
  }

  return (
    <CustomButton
      isDisabled={props.isDisabled}
      isActive={props.isActive}
      onMouseDown={onToggle}
      readOnly={props.readOnly}
    >
      {props.icon && <i className={props.icon}></i>}
      <span>{!props.icon ? props.label : ''}</span>
    </CustomButton>
  )
}

type StyleControlsProps = Pick<
  RichTextEditorProps,
  'editorState' | 'disabledButtons' | 'hideOnMobileButtons'
> &
  Pick<ButtonStyleProps, 'readOnly'> & {
    onToggle: (buttonName: string) => void
  }

const blockStyles = [
  { label: 'H2', style: buttonNames.h2, icon: '' },
  { label: 'H3', style: buttonNames.h3, icon: '' },
  { label: 'H4', style: buttonNames.h4, icon: '' },
  {
    label: 'Blockquote',
    style: buttonNames.blockquote,
    icon: 'fas fa-quote-right',
  },
  { label: 'UL', style: buttonNames.ul, icon: 'fas fa-list-ul' },
  { label: 'OL', style: buttonNames.ol, icon: 'fas fa-list-ol' },
  { label: 'Code Block', style: buttonNames.codeBlock, icon: 'fas fa-code' },
]

const BlockStyleControls = ({
  editorState,
  disabledButtons,
  hideOnMobileButtons,
  onToggle,
  readOnly,
}: StyleControlsProps) => {
  const checkIsDisabled = useButtonDisabledChecker({
    mobileBoundary: MOBILE_BOUNDARY,
    disabledButtons,
    hideOnMobileButtons,
  })
  const selection = editorState.getSelection()
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType()
  return (
    <Fragment>
      {blockStyles.map((type) => (
        <StyleButton
          isDisabled={checkIsDisabled(type.style)}
          key={type.label}
          isActive={type.style === blockType}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
          icon={type.icon}
          readOnly={readOnly}
        />
      ))}
    </Fragment>
  )
}

const inlineStyles = [
  { label: 'Bold', style: 'BOLD', icon: 'fas fa-bold' },
  { label: 'Italic', style: 'ITALIC', icon: 'fas fa-italic' },
  { label: 'Underline', style: 'UNDERLINE', icon: 'fas fa-underline' },
  { label: 'Monospace', style: 'CODE', icon: 'fas fa-terminal' },
]

const InlineStyleControls = ({
  editorState,
  disabledButtons,
  hideOnMobileButtons,
  onToggle,
  readOnly,
}: StyleControlsProps) => {
  const checkIsDisabled = useButtonDisabledChecker({
    mobileBoundary: MOBILE_BOUNDARY,
    disabledButtons,
    hideOnMobileButtons,
  })
  const currentStyle = editorState.getCurrentInlineStyle()
  return (
    <Fragment>
      {inlineStyles.map((type) => (
        <StyleButton
          isDisabled={checkIsDisabled(type.style.toLowerCase())}
          key={type.label}
          isActive={currentStyle.has(type.style)}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
          icon={type.icon}
          readOnly={readOnly}
        />
      ))}
    </Fragment>
  )
}

const DraftEditor = {
  RichTextEditor,
  decorators,
}
export default DraftEditor
