import React from 'react'
import decorators from './entity-decorator'
import {
  Editor,
  EditorState,
  KeyBindingUtil,
  RichUtils,
  getDefaultKeyBinding,
} from 'draft-js'
import { LinkButton } from './link'
import { FontColorButton, CUSTOM_STYLE_PREFIX_FONT_COLOR } from './font-color'
// import { MediaButton } from './media'
import styled, { css } from 'styled-components'

const DraftEditor = styled.div`
  position: relative;
  margin-top: 4px;
`

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

const ButtonGroup = styled.div`
  margin: 0 10px 0 0;
`

const buttonStyle = css`
  /* Rich-editor default setting (.RichEditor-styleButton)*/
  cursor: pointer;
  margin-right: 16px;
  padding: 2px 0;
  display: inline-block;
  /* Custom Setting */
  border-radius: 6px;
  font-size: 1rem;
  padding: 8px 12px;
  margin: 0px 0px 10px 0px;
  border: solid 1px rgb(193, 199, 208);
`

const CustomButton = styled.div<{ isActive: boolean }>`
  ${buttonStyle}
  border: solid 1px
  ${(props) => (props.isActive ? 'rgb(38,132,255)' : 'rgb(193, 199, 208)')};
  box-shadow: ${(props) =>
    props.isActive ? 'rgba(38, 132, 255, 20%)  0px 0px 0px 3px  ' : 'unset'};
  transition: box-shadow 100ms linear;
  color: ${(props) => (props.isActive ? 'rgb(23, 43, 77)' : '#999')};
`

const CustomLinkButton = styled(LinkButton)<{ isActive: boolean }>`
  ${buttonStyle}
  color: ${(props) => (props.isActive ? '#5890ff' : '#999')};
`

const CustomFontColorButton = styled(FontColorButton)<{ isActive: boolean }>`
  ${buttonStyle}
  color: ${(props) => (props.isActive ? '#5890ff' : '#999')};
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
`

type BasicEditorProps = {
  onChange: (editorState) => void
  editorState: EditorState
}

export class BasicEditor extends React.Component<BasicEditorProps> {
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
    const styleName = style.findLast((value) =>
      value.startsWith(CUSTOM_STYLE_PREFIX_FONT_COLOR)
    )
    const styles = {}
    if (styleName) {
      styles['color'] = styleName.split(CUSTOM_STYLE_PREFIX_FONT_COLOR)[1]
    }
    return styles
  }

  customStyleFn = (style) => {
    return this.getCustomStyle(style)
  }

  render() {
    let { editorState } = this.props
    if (!(editorState instanceof EditorState)) {
      editorState = EditorState.createEmpty(decorators)
    }

    const entityType = this.getEntityType(editorState)
    const customStyle = this.getCustomStyle(editorState.getCurrentInlineStyle())

    return (
      <DraftEditor>
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
                  editorState={editorState}
                  onToggle={this.toggleBlockType}
                />
              </ButtonGroup>
              <ButtonGroup>
                <InlineStyleControls
                  editorState={editorState}
                  onToggle={this.toggleInlineStyle}
                />
              </ButtonGroup>
              <ButtonGroup>
                <CustomLinkButton
                  isActive={entityType === 'LINK'}
                  editorState={editorState}
                  onChange={this.onChange}
                />
                <CustomFontColorButton
                  isActive={Object.prototype.hasOwnProperty.call(
                    customStyle,
                    'color'
                  )}
                  editorState={editorState}
                  onChange={this.onChange}
                />
              </ButtonGroup>
            </DraftEditorControlsWrapper>
          </DraftEditorControls>
          <TextEditorWrapper
            onClick={() => {
              ;(this.refs.basicEditor as HTMLElement)?.focus()
            }}
          >
            <Editor
              blockStyleFn={getBlockStyle}
              customStyleFn={this.customStyleFn}
              editorState={editorState}
              handleKeyCommand={this.handleKeyCommand}
              handleReturn={this.handleReturn}
              keyBindingFn={this.mapKeyToEditorCommand}
              onChange={this.onChange}
              placeholder="Tell a story..."
              ref="basicEditor"
              spellCheck={true}
            />
          </TextEditorWrapper>
        </DraftEditorWrapper>
      </DraftEditor>
    )
  }
}

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote'
    default:
      return null
  }
}

type StyleButtonProps = {
  active: boolean
  label: string
  onToggle: (string) => void
  style: string
  icon: string
}

class StyleButton extends React.Component<StyleButtonProps> {
  onToggle = (e) => {
    e.preventDefault()
    this.props.onToggle(this.props.style)
  }

  render() {
    return (
      <CustomButton isActive={this.props.active} onMouseDown={this.onToggle}>
        <i className={this.props.icon}></i>
        <span>{!this.props.icon ? this.props.label : ''}</span>
      </CustomButton>
    )
  }
}

const blockStyles = [
  { label: 'H2', style: 'header-two', icon: '' },
  { label: 'H3', style: 'header-three', icon: '' },
  { label: 'H4', style: 'header-four', icon: '' },
  { label: 'Blockquote', style: 'blockquote', icon: 'fas fa-quote-right' },
  { label: 'UL', style: 'unordered-list-item', icon: 'fas fa-list-ul' },
  { label: 'OL', style: 'ordered-list-item', icon: 'fas fa-list-ol' },
]

const BlockStyleControls = (props) => {
  const { editorState } = props
  const selection = editorState.getSelection()
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType()
  return (
    <div className="RichEditor-controls">
      {blockStyles.map((type) => (
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
          icon={type.icon}
        />
      ))}
    </div>
  )
}

const inlineStyles = [
  { label: 'Bold', style: 'BOLD', icon: 'fas fa-bold' },
  { label: 'Italic', style: 'ITALIC', icon: 'fas fa-italic' },
  { label: 'Underline', style: 'UNDERLINE', icon: 'fas fa-underline' },
  { label: 'Monospace', style: 'CODE', icon: 'fas fa-terminal' },
]

const InlineStyleControls = (props) => {
  const currentStyle = props.editorState.getCurrentInlineStyle()
  return (
    <div className="RichEditor-controls">
      {inlineStyles.map((type) => (
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
          icon={type.icon}
        />
      ))}
    </div>
  )
}
