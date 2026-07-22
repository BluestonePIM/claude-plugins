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

## How to use

No slash command needed — the skill triggers automatically from context.

### Option A: paste raw Playwright codegen

Paste whatever the Playwright codegen recorder produced, for example:

```ts
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await expect(page.locator('[data-test="username"]')).toBeVisible();

  await page.getByText('Swag Labs').click();
  await expect(page.locator('[data-test="username"]')).toBeVisible();
  await page.locator('[data-test="username"]').dblclick();
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="username"]').press('Tab');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await expect(page.locator('[data-test="title"]')).toBeVisible();
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await expect(page.locator('[data-test="shopping-cart-link"]')).toMatchAriaSnapshot(- text: "1");
});
```

...and ask something like "clean this up into proper tests." Claude will:

1. Call out redundant/misfired actions in a Cleanup Log — e.g. the `.click()` on "Swag Labs" that does nothing useful, the `.dblclick()` right before `.fill()` (fill already focuses the field, so the double click is redundant), and the stray `.press('Tab')`.
2. Propose a Sunny/Rainy test cases table (e.g. successful login + add to cart, wrong password, empty username/password) for you to review before anything is written.
3. Detect whether the project already has a Page Object Model or needs one scaffolded, then write clean `locators/`, `page_objects/`, and `tests/sunny|rainy` spec files following the project's own conventions.
4. Finish with plain-English instructions for running the tests, opening the HTML report, and viewing the trace — no coding knowledge required.

### Option B: ask without codegen

Just describe the feature, e.g. "add UI tests for the login page" or "start testing the checkout flow" — Claude will ask for any missing details (URL, credentials, expected behavior) and scaffold the tests from scratch.

## Available plugins

| Plugin | What it does |
|---|---|
| `codegen-helper` | Turns raw Playwright codegen (or a feature name) into cleaned-up, sunny/rainy-covered test files. Works in any project — detects and follows whatever project structure already exists, or scaffolds a Page Object Model if starting fresh. |

## Adding a new plugin to this marketplace

1. Create `plugins/<name>/.claude-plugin/plugin.json` (name, description, author).
2. Put the skill under `plugins/<name>/skills/<name>/SKILL.md` (plus any supporting files).
3. Add an entry to `.claude-plugin/marketplace.json` under `"plugins"`.
4. Commit and push — teammates already on this marketplace get the update automatically.
