import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { CodeMode } from '../types'

const VAR = 'CLAUDE_CODE_EXPERIMENTAL_CODE_MODE'

// null = settings.json not read yet
const isOn = atom({ plugin: 'code-mode-toggle', key: 'isOn' } as const, null as CodeMode)
// true once toggled in this session: the change applies to the next session
const isChanged = atom({ plugin: 'code-mode-toggle', key: 'isChanged' } as const, false)

type Settings = { env?: Record<string, string>; [key: string]: unknown }

async function settingsPath($: EngineInterface): Promise<string> {
  const home = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME'))
  return `${home}/.claude/settings.json`
}

async function loadSettings($: EngineInterface): Promise<Settings> {
  const path = await settingsPath($)
  if (!(await $.fs.exists(path))) return {}
  return JSON.parse(await $.fs.read(path)) as Settings
}

async function refresh($: EngineInterface): Promise<void> {
  const settings = await loadSettings($)
  const value = settings.env?.[VAR]
  await update($, isOn, () => value === '1')
}

async function toggle($: EngineInterface): Promise<boolean> {
  const settings = await loadSettings($)
  const env = { ...(settings.env ?? {}) }
  const turnOn = env[VAR] !== '1'
  if (turnOn) env[VAR] = '1'
  else delete env[VAR]
  const out: Settings = { ...settings, env }
  if (Object.keys(env).length === 0) delete out.env
  await $.fs.write(await settingsPath($), JSON.stringify(out, null, 2) + '\n')
  await update($, isOn, () => turnOn)
  await update($, isChanged, () => true)
  $.ui.toast(`Code Mode ${turnOn ? 'ON' : 'OFF'} - start a new session to apply`)
  return turnOn
}

const PANE = 'code-mode'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'code-mode',
      description: 'Open the Code Mode pane (toggle CLAUDE_CODE_EXPERIMENTAL_CODE_MODE)',
    })
    await refresh($)
    void $.ui.open({ id: PANE, title: 'Code Mode' })
    return next(e)
  })

  on('command.run', { command: 'code-mode' }, async $ => {
    await refresh($)
    await $.ui.open({ id: PANE, title: 'Code Mode' })
    return { text: 'Code Mode pane opened.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const current = await read($, isOn)
    const changed = await read($, isChanged)

    if (current === null) {
      return <Text dimColor>Reading ~/.claude/settings.json...</Text>
    }

    return (
      <Box flexDirection="column" gap={1}>
        <Box>
          <Text>Code Mode: </Text>
          <Text color={current ? 'green' : undefined} bold>
            {current ? 'ON' : 'OFF'}
          </Text>
        </Box>
        <Button
          key="toggle"
          label={current ? 'Turn Code Mode off' : 'Turn Code Mode on'}
          onPress={() => void toggle($)}
        />
        <Text dimColor>
          {changed
            ? 'Saved. Start a new session to apply.'
            : 'Saved in ~/.claude/settings.json; applies to new sessions.'}
        </Text>
      </Box>
    )
  })
}
