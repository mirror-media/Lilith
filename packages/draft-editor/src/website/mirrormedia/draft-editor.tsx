import React from 'react'
import styled, { css } from 'styled-components'

import {
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
} from '../../draft-js/buttons/text-align'
import { FontColorButton } from '../../draft-js/buttons/font-color'
import { BackgroundColorButton } from '../../draft-js/buttons/background-color'
import { VideoButton } from '../../draft-js/buttons/video'
import { AudioButton } from '../../draft-js/buttons/audio'

import {
  CUSTOM_STYLE_PREFIX_FONT_COLOR,
  CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR,
} from '../../draft-js/const'
import { getSelectionBlockData } from '../../draft-js/buttons/text-align'
import { ImageSelector } from './selector/image-selector'
import { VideoSelector } from './selector/video-selector'
import { PostSelector } from './selector/post-selector'
import { AudioSelector } from './selector/audio-selector'

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
}

const disabledButtonsOnBasicEditor = [
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
]

type ButtonStyleProps = {
  isActive: boolean
  isDisabled: boolean
  readOnly: boolean
}

const buttonStyle = css`
  border-radius: 6px;
  text-align: center;
  font-size: 1rem;
  padding: 0 12px;
  margin: 0px 0px 10px 0px;
  background-color: #fff;
  border: solid 1px rgb(193, 199, 208);
  align-items: center;
  height: 40px;

  cursor: ${(props: ButtonStyleProps) => {
    if (props.readOnly) {
      return 'not-allowed'
    }
    return 'pointer'
  }};
  color: ${(props: ButtonStyleProps) => {
    if (props.readOnly) {
      return '#c1c7d0'
    }
    if (props.isActive) {
      return '#3b82f6'
    }
    return '#6b7280'
  }};
  border: solid 1px
    ${(props: ButtonStyleProps) => {
      if (props.readOnly) {
        return '#c1c7d0'
      }
      if (props.isActive) {
        return '#3b82f6'
      }
      return '#6b7280'
    }};
  box-shadow: ${(props: ButtonStyleProps) => {
    if (props.readOnly) {
      return 'unset'
    }
    if (props.isActive) {
      return 'rgba(38, 132, 255, 20%)  0px 1px 4px '
    }
    return 'unset'
  }};
  transition: box-shadow 100ms linear;

  display: ${(props: ButtonStyleProps) => {
    if (props.isDisabled) {
      return 'none'
    }
    return 'inline-flex'
  }};
`

const longFormButtonStyle = css`
  ${buttonStyle}
  color: ${(props) => {
    if (props.readOnly) {
      return '#c1c7d0'
    }
    if (props.isActive) {
      return '#ED8B00'
    }
    return '#6b7280'
  }};
  border: solid 1px
    ${(props) => {
      if (props.readOnly) {
        return '#c1c7d0'
      }
      if (props.isActive) {
        return '#ED8B00'
      }
      return '#FECC85'
    }};
  box-shadow: ${(props) => {
    if (props.readOnly) {
      return 'unset'
    }
    if (props.isActive) {
      return 'rgba(237, 139, 0, 0.5) 0px 1px 4px'
    }
    return 'unset'
  }};
`

const CustomFontColorButton = styled(FontColorButton)<{
  isActive: boolean
  readOnly: boolean
}>`
  ${buttonStyle}
`

const CustomBackgroundColorButton = styled(BackgroundColorButton)<{
  isActive: boolean
  readOnly: boolean
}>`
  ${longFormButtonStyle}
`

const CustomButton = styled.div<{ isActive: boolean; readOnly: boolean }>`
  ${buttonStyle}
`

const CustomAnnotationButton = styled(AnnotationButton)<{
  isActive: boolean
  readOnly: boolean
  isDisabled: boolean
}>`
  ${buttonStyle}
`

const CustomLinkButton = styled(LinkButton)<{
  isActive: boolean
  readOnly: boolean
  isDisabled: boolean
}>`
  ${buttonStyle}
`

function createButtonWithoutProps(
  referenceComponent,
  isLongForm = false,
  additionalCSS = ``
) {
  return isLongForm
    ? styled(referenceComponent)`
        ${longFormButtonStyle}
        ${additionalCSS}
      `
    : styled(referenceComponent)`
        ${buttonStyle}
        ${additionalCSS}
      `
}
const CustomEnlargeButton = createButtonWithoutProps(
  EnlargeButton,
  false,
  `color: #999`
)
const CustomImageButton = createButtonWithoutProps(ImageButton)
const CustomSlideshowButton = createButtonWithoutProps(SlideshowButton)
const CustomEmbeddedCodeButton = createButtonWithoutProps(EmbeddedCodeButton)
const CustomTableButton = createButtonWithoutProps(TableButton)
const CustomInfoBoxButton = createButtonWithoutProps(InfoBoxButton)
const CustomDividerButton = createButtonWithoutProps(DividerButton)
const CustomColorBoxButton = createButtonWithoutProps(ColorBoxButton, true)
const CustomBGImageButton = createButtonWithoutProps(BGImageButton, true)
const CustomBGVideoButton = createButtonWithoutProps(BGVideoButton, true)
const CustomRelatedPostButton = createButtonWithoutProps(
  RelatedPostButton,
  true
)
const CustomSideIndexButton = createButtonWithoutProps(SideIndexButton, true)
const CustomAlignCenterButton = createButtonWithoutProps(
  AlignCenterButton,
  true
)
const CustomAlignLeftButton = createButtonWithoutProps(AlignLeftButton, true)
const CustomVideoButton = createButtonWithoutProps(VideoButton)
const CustomAudioButton = createButtonWithoutProps(AudioButton)

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

  /* Draft built-in buttons' style */
  .public-DraftStyleDefault-header-two {
  }
  .public-DraftStyleDefault-header-three {
  }
  .public-DraftStyleDefault-header-four {
  }
  .public-DraftStyleDefault-blockquote {
  }
  .public-DraftStyleDefault-ul {
  }
  .public-DraftStyleDefault-unorderedListItem {
  }
  .public-DraftStyleDefault-ol {
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
  ${(props) =>
    props.isEnlarged
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
    ${(props) =>
      props.isEnlarged
        ? css`
            width: 100%;
            height: 100%;
            padding: 0 1rem 0;
            overflow: scroll;
          `
        : ''}
  }
  ${DraftEditorControls} {
    ${(props) =>
      props.isEnlarged
        ? css`
            position: sticky;
            top: 0;
            z-index: 12;
          `
        : ''}
  }
  ${DraftEditorControlsWrapper} {
    ${(props) =>
      props.isEnlarged
        ? css`
            overflow: auto;
            padding-bottom: 0;
          `
        : ''}
  }
  ${TextEditorWrapper} {
    ${(props) =>
      props.isEnlarged
        ? css`
            max-width: 100%;
            min-height: 100vh;
            padding-bottom: 0;
          `
        : ''}
  }
`

const ButtonGroup = styled.div`
  margin: 0 10px 0 0;
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
}

type BasicEditorProps = RichTextEditorProps

type State = {
  isEnlarged?: boolean
  readOnly: boolean
}

class RichTextEditor extends React.Component<RichTextEditorProps, State> {
  customStyleMap: {
    CODE: {
      backgroundColor: string
      fontFamily: string
      fontSize: number
      padding: number
    }
  }
  constructor(props) {
    super(props)
    this.state = {
      isEnlarged: false,
      readOnly: false,
    }
    // Custom overrides for "code" style.
    this.customStyleMap = {
      CODE: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
        fontSize: 16,
        padding: 2,
      },
    }
  }
  onChange = (editorState) => {
    this.props.onChange(editorState)
  }

  handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (newState) {
      this.onChange(newState)
      return true
    }
    return false
  }

  handleReturn = (event) => {
    if (KeyBindingUtil.isSoftNewlineEvent(event)) {
      const { onChange, editorState } = this.props
      onChange(RichUtils.insertSoftNewline(editorState))
      return 'handled'
    }

    return 'not-handled'
  }

  mapKeyToEditorCommand = (e) => {
    if (e.keyCode === 9 /* TAB */) {
      const newEditorState = RichUtils.onTab(
        e,
        this.props.editorState,
        4 /* maxDepth */
      )
      if (newEditorState !== this.props.editorState) {
        this.onChange(newEditorState)
      }
      return
    }
    return getDefaultKeyBinding(e)
  }

  toggleBlockType = (blockType) => {
    this.onChange(RichUtils.toggleBlockType(this.props.editorState, blockType))
  }

  toggleInlineStyle = (inlineStyle) => {
    this.onChange(
      RichUtils.toggleInlineStyle(this.props.editorState, inlineStyle)
    )
  }

  getEntityType = (editorState) => {
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

  getCustomStyle = (style) => {
    return style.reduce((styles, styleName) => {
      if (styleName?.startsWith(CUSTOM_STYLE_PREFIX_FONT_COLOR)) {
        styles['color'] = styleName.split(CUSTOM_STYLE_PREFIX_FONT_COLOR)[1]
      }
      if (styleName?.startsWith(CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR)) {
        styles['backgroundColor'] = styleName.split(
          CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR
        )[1]
      }
      return styles
    }, {})
  }

  toggleEnlarge = () => {
    this.setState({ isEnlarged: !this.state.isEnlarged })
  }

  customStyleFn = (style) => {
    return this.getCustomStyle(style)
  }

  blockStyleFn(block) {
    const { editorState } = this.props

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
        if (entity.getData()?.alignment) {
          // support all atomic block to set alignment
          result += ' ' + entity.getData().alignment
        }
        break
      default:
        break
    }
    return result
  }

  blockRendererFn = (block) => {
    const atomicBlockObj = atomicBlockRenderer(block)
    if (atomicBlockObj) {
      const onEditStart = () => {
        this.setState({
          // If custom block renderer requires mouse interaction,
          // [Draft.js document](https://draftjs.org/docs/advanced-topics-block-components#recommendations-and-other-notes)
          // suggests that we should temporarily set Editor
          // to readOnly={true} during the interaction.
          // In readOnly={true} condition, the user does not
          // trigger any selection changes within the editor
          // while interacting with custom block.
          // If we don't set readOnly={true},
          // it will cause some subtle bugs in InfoBox button.
          readOnly: true,
        })
      }
      const onEditFinish = ({
        entityKey,
        entityData,
      }: {
        entityKey?: string
        entityData?: Record<string, unknown>
      }) => {
        if (entityKey) {
          const oldContentState = this.props.editorState.getCurrentContent()
          const newContentState = oldContentState.replaceEntityData(
            entityKey,
            entityData
          )
          this.onChange(
            EditorState.set(this.props.editorState, {
              currentContent: newContentState,
            })
          )
        }

        // Custom block interaction is finished.
        // Therefore, we set readOnly={false} to
        // make editor editable.
        this.setState({
          readOnly: false,
        })
      }

      // `onEditStart` and `onEditFinish` will be passed
      // into custom block component.
      // We can get them via `props.blockProps.onEditStart`
      // and `props.blockProps.onEditFinish` in the custom block components.
      atomicBlockObj['props'] = {
        onEditStart,
        onEditFinish,
        getMainEditorReadOnly: () => this.state.readOnly,
        renderBasicEditor: (propsOfBasicEditor: BasicEditorProps) => {
          return (
            <RichTextEditor
              {...propsOfBasicEditor}
              disabledButtons={disabledButtonsOnBasicEditor}
            />
          )
        },
      }
    }
    return atomicBlockObj
  }

  render() {
    const { disabledButtons = [] } = this.props
    let { editorState } = this.props

    if (!(editorState instanceof EditorState)) {
      editorState = EditorState.createEmpty(decorators)
    }
    const { isEnlarged, readOnly } = this.state

    const entityType = this.getEntityType(editorState)
    const customStyle = this.getCustomStyle(editorState.getCurrentInlineStyle())

    const renderBasicEditor = (propsOfBasicEditor: BasicEditorProps) => {
      return (
        <RichTextEditor
          {...propsOfBasicEditor}
          disabledButtons={disabledButtonsOnBasicEditor}
        />
      )
    }

    return (
      <DraftEditorContainer isEnlarged={isEnlarged}>
        <DraftEditorWrapper>
          <link
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
            rel="stylesheet"
            type="text/css"
          />
          <link
            href="https://storage.googleapis.com/static-readr-tw-dev/cdn/draft-js/rich-editor.css"
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
              <ButtonGroup>
                <BlockStyleControls
                  disabledButtons={disabledButtons}
                  editorState={editorState}
                  onToggle={this.toggleBlockType}
                  readOnly={this.state.readOnly}
                />
              </ButtonGroup>
              <ButtonGroup>
                <InlineStyleControls
                  disabledButtons={disabledButtons}
                  editorState={editorState}
                  onToggle={this.toggleInlineStyle}
                  readOnly={this.state.readOnly}
                />
              </ButtonGroup>
              <EnlargeButtonWrapper>
                <CustomEnlargeButton
                  onToggle={this.toggleEnlarge}
                  isEnlarged={isEnlarged}
                ></CustomEnlargeButton>
              </EnlargeButtonWrapper>
            </DraftEditorControlsWrapper>
            <DraftEditorControlsWrapper>
              <ButtonGroup>
                <CustomLinkButton
                  isDisabled={disabledButtons.includes(buttonNames.link)}
                  isActive={entityType === 'LINK'}
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                />
              </ButtonGroup>
              <ButtonGroup>
                <CustomFontColorButton
                  isDisabled={disabledButtons.includes(buttonNames.fontColor)}
                  isActive={Object.prototype.hasOwnProperty.call(
                    customStyle,
                    'color'
                  )}
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                />
              </ButtonGroup>
              <ButtonGroup>
                <CustomDividerButton
                  isDisabled={disabledButtons.includes(buttonNames.divider)}
                  editorState={editorState}
                  onChange={this.onChange}
                ></CustomDividerButton>
              </ButtonGroup>
              <ButtonGroup>
                <CustomAnnotationButton
                  isDisabled={disabledButtons.includes(buttonNames.annotation)}
                  isActive={entityType === 'ANNOTATION'}
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                  renderBasicEditor={renderBasicEditor}
                  decorators={decorators}
                />
              </ButtonGroup>
              <ButtonGroup>
                <CustomImageButton
                  isDisabled={disabledButtons.includes(buttonNames.image)}
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                  ImageSelector={ImageSelector}
                />
              </ButtonGroup>
              <ButtonGroup>
                <CustomVideoButton
                  isDisabled={disabledButtons.includes(buttonNames.video)}
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                  VideoSelector={VideoSelector}
                />
              </ButtonGroup>
              <ButtonGroup>
                <CustomAudioButton
                  isDisabled={disabledButtons.includes(buttonNames.audio)}
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                  AudioSelector={AudioSelector}
                />
              </ButtonGroup>
              <ButtonGroup>
                <CustomSlideshowButton
                  isDisabled={disabledButtons.includes(buttonNames.slideshow)}
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                  ImageSelector={ImageSelector}
                />
              </ButtonGroup>
              <ButtonGroup>
                <CustomInfoBoxButton
                  isDisabled={disabledButtons.includes(buttonNames.infoBox)}
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                  renderBasicEditor={renderBasicEditor}
                  decorators={decorators}
                />
              </ButtonGroup>
              <ButtonGroup>
                <CustomEmbeddedCodeButton
                  isDisabled={disabledButtons.includes(buttonNames.embed)}
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                ></CustomEmbeddedCodeButton>
              </ButtonGroup>
              <ButtonGroup>
                <CustomTableButton
                  isDisabled={disabledButtons.includes(buttonNames.table)}
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                ></CustomTableButton>
              </ButtonGroup>
            </DraftEditorControlsWrapper>
            <DraftEditorControlsWrapper>
              <ButtonGroup>
                <CustomAlignLeftButton
                  isDisabled={disabledButtons.includes(buttonNames.textAlign)}
                  isActive={
                    getSelectionBlockData(editorState, 'textAlign') === 'left'
                  }
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                />
              </ButtonGroup>
              <ButtonGroup>
                <CustomAlignCenterButton
                  isDisabled={disabledButtons.includes(buttonNames.textAlign)}
                  isActive={
                    getSelectionBlockData(editorState, 'textAlign') === 'center'
                  }
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                />
              </ButtonGroup>
              <ButtonGroup>
                <CustomColorBoxButton
                  isDisabled={disabledButtons.includes(buttonNames.colorBox)}
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                  renderBasicEditor={renderBasicEditor}
                  decorators={decorators}
                />
              </ButtonGroup>
              <ButtonGroup>
                <CustomBackgroundColorButton
                  isDisabled={disabledButtons.includes(
                    buttonNames.backgroundColor
                  )}
                  isActive={Object.prototype.hasOwnProperty.call(
                    customStyle,
                    'backgroundColor'
                  )}
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                />
              </ButtonGroup>
              <ButtonGroup>
                <CustomBGImageButton
                  isDisabled={disabledButtons.includes(
                    buttonNames.backgroundImage
                  )}
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                  ImageSelector={ImageSelector}
                  renderBasicEditor={renderBasicEditor}
                  decorators={decorators}
                />
              </ButtonGroup>
              <ButtonGroup>
                <CustomBGVideoButton
                  isDisabled={disabledButtons.includes(
                    buttonNames.backgroundVideo
                  )}
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                  VideoSelector={VideoSelector}
                  renderBasicEditor={renderBasicEditor}
                  decorators={decorators}
                />
              </ButtonGroup>
              <ButtonGroup>
                <CustomRelatedPostButton
                  isDisabled={disabledButtons.includes(buttonNames.relatedPost)}
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                  PostSelector={PostSelector}
                />
              </ButtonGroup>
              <ButtonGroup>
                <CustomSideIndexButton
                  isDisabled={disabledButtons.includes(buttonNames.sideIndex)}
                  editorState={editorState}
                  onChange={this.onChange}
                  readOnly={this.state.readOnly}
                />
              </ButtonGroup>
            </DraftEditorControlsWrapper>
          </DraftEditorControls>
          <TextEditorWrapper
            onClick={() => {
              // eslint-disable-next-line prettier/prettier
              (this.refs.editor as HTMLElement)?.focus()
            }}
          >
            <Editor
              blockStyleFn={this.blockStyleFn.bind(this)}
              blockRendererFn={this.blockRendererFn}
              customStyleMap={this.customStyleMap}
              customStyleFn={this.customStyleFn}
              editorState={editorState}
              handleKeyCommand={this.handleKeyCommand}
              handleReturn={this.handleReturn}
              keyBindingFn={this.mapKeyToEditorCommand}
              onChange={this.onChange}
              placeholder="Tell a story..."
              ref="editor"
              spellCheck={true}
              readOnly={readOnly}
            />
          </TextEditorWrapper>
        </DraftEditorWrapper>
      </DraftEditorContainer>
    )
  }
}

type StyleButtonProps = {
  active: boolean
  label: string
  onToggle: (string) => void
  style: string
  icon: string
  readOnly: boolean
  isDisabled: boolean
}

class StyleButton extends React.Component<StyleButtonProps> {
  onToggle = (e) => {
    e.preventDefault()
    this.props.onToggle(this.props.style)
  }

  render() {
    return (
      <CustomButton
        isDisabled={this.props.isDisabled}
        isActive={this.props.active}
        onMouseDown={this.onToggle}
        readOnly={this.props.readOnly}
      >
        {this.props.icon && <i className={this.props.icon}></i>}
        <span>{!this.props.icon ? this.props.label : ''}</span>
      </CustomButton>
    )
  }
}

type StyleControlsProps = {
  editorState: EditorState
  disabledButtons: string[]
  onToggle: (buttonName: string) => void
  readOnly: boolean
}

const blockStyles = [
  { label: 'H2', style: 'header-two', icon: '' },
  { label: 'H3', style: 'header-three', icon: '' },
  { label: 'H4', style: 'header-four', icon: '' },
  { label: 'Blockquote', style: 'blockquote', icon: 'fas fa-quote-right' },
  { label: 'UL', style: 'unordered-list-item', icon: 'fas fa-list-ul' },
  { label: 'OL', style: 'ordered-list-item', icon: 'fas fa-list-ol' },
  { label: 'Code Block', style: 'code-block', icon: 'fas fa-code' },
]

const BlockStyleControls = (props: StyleControlsProps) => {
  const { editorState, disabledButtons } = props
  const selection = editorState.getSelection()
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType()
  return (
    <React.Fragment>
      {blockStyles.map((type) => (
        <StyleButton
          isDisabled={disabledButtons.includes(type.style)}
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
          icon={type.icon}
          readOnly={props.readOnly}
        />
      ))}
    </React.Fragment>
  )
}

const inlineStyles = [
  { label: 'Bold', style: 'BOLD', icon: 'fas fa-bold' },
  { label: 'Italic', style: 'ITALIC', icon: 'fas fa-italic' },
  { label: 'Underline', style: 'UNDERLINE', icon: 'fas fa-underline' },
  { label: 'Monospace', style: 'CODE', icon: 'fas fa-terminal' },
]

const InlineStyleControls = (props: StyleControlsProps) => {
  const currentStyle = props.editorState.getCurrentInlineStyle()
  return (
    <React.Fragment>
      {inlineStyles.map((type) => (
        <StyleButton
          isDisabled={props.disabledButtons.includes(type.style.toLowerCase())}
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
          icon={type.icon}
          readOnly={props.readOnly}
        />
      ))}
    </React.Fragment>
  )
}

const DraftEditor = {
  RichTextEditor,
  decorators,
}
export default DraftEditor
