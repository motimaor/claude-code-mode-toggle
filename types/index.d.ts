export type CodeMode = boolean | null

declare module 'claude-code' {
  interface PluginState {
    'code-mode-toggle': { isOn: CodeMode; isChanged: boolean }
  }
}
