# Bluestone Claude Plugins

Internal marketplace of Claude Code plugins for the Bluestone PIM team.

## Setup (one-time, per person)

```
/plugin marketplace add BluestonePIM/claude-plugins
```

## Install a plugin

```
/plugin install codegen-helper
```

## Available plugins

| Plugin | What it does |
|---|---|
| `codegen-helper` | Turns raw Playwright codegen (or a feature name) into cleaned-up, sunny/rainy-covered test files. Works in any project — detects and follows whatever project structure already exists, or scaffolds a Page Object Model if starting fresh. |

## Adding a new plugin to this marketplace

1. Create `plugins/<name>/.claude-plugin/plugin.json` (name, description, author).
2. Put the skill under `plugins/<name>/skills/<name>/SKILL.md` (plus any supporting files).
3. Add an entry to `.claude-plugin/marketplace.json` under `"plugins"`.
4. Commit and push — teammates already on this marketplace get the update automatically.
