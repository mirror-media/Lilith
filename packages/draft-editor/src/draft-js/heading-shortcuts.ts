import type { DraftBlockType } from 'draft-js'

export const headingShortcutCommands = {
  h2: 'toggle-header-two',
  h3: 'toggle-header-three',
} as const

export type HeadingShortcutCommand =
  (typeof headingShortcutCommands)[keyof typeof headingShortcutCommands]

type HeadingShortcutEvent = {
  altKey: boolean
  ctrlKey: boolean
  keyCode: number
  metaKey: boolean
  shiftKey: boolean
}

const headingBlockTypeByCommand: Record<
  HeadingShortcutCommand,
  DraftBlockType
> = {
  [headingShortcutCommands.h2]: 'header-two',
  [headingShortcutCommands.h3]: 'header-three',
}

export const getHeadingBlockType = (command: string): DraftBlockType | null =>
  headingBlockTypeByCommand[command as HeadingShortcutCommand] ?? null

export const getHeadingShortcutCommand = (
  event: HeadingShortcutEvent,
  usesMacOSHeuristics: boolean,
  disabledButtons: readonly string[] = []
): HeadingShortcutCommand | null => {
  const hasCommandModifier = usesMacOSHeuristics
    ? event.metaKey && !event.ctrlKey
    : event.ctrlKey && !event.metaKey

  if (!hasCommandModifier || !event.altKey || event.shiftKey) {
    return null
  }

  const command =
    event.keyCode === 50
      ? headingShortcutCommands.h2
      : event.keyCode === 51
      ? headingShortcutCommands.h3
      : null

  if (!command) {
    return null
  }

  const blockType = getHeadingBlockType(command)
  return blockType && disabledButtons.includes(blockType) ? null : command
}
