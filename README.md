# Code Mode Toggle for Claude Code

A small Claude Code mod that adds a **Code Mode** side pane with one button to turn
Code Mode on or off.

Code Mode is enabled by the environment variable `CLAUDE_CODE_EXPERIMENTAL_CODE_MODE=1`
in the `env` block of your user settings file, `~/.claude/settings.json`. Claude Code
ignores this variable in a project's settings files, so it has to live in your user
settings. This mod edits that one key for you and leaves the rest of the file as it is.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install code-mode-toggle --marketplace motimaor/claude-code-mode-toggle
```

Answer `y` to add the marketplace, then press Enter to install it at the user scope.

From a shell:

```
claude plugin install code-mode-toggle --marketplace motimaor/claude-code-mode-toggle
```

In the Claude desktop app, where `/plugin` does not run: click **+** next to the prompt
box, then **Plugins**, **Add marketplace** with `motimaor/claude-code-mode-toggle`,
then **Add plugin**.

## Use

- The **Code Mode** pane opens at the start of each session. It shows `ON` or `OFF`
  and a button to switch.
- `/code-mode` opens the pane again if you closed it.
- Claude Code reads the variable when a session starts, so a change applies to the
  **next** session you start, not the one that is open.

## What it changes

Only `env.CLAUDE_CODE_EXPERIMENTAL_CODE_MODE` in `~/.claude/settings.json`: set to `"1"`
when on, removed when off (and the `env` block is removed if it ends up empty).

## License

MIT
