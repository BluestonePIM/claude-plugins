---
name: "codegen-helper"
description: "Analyze raw Playwright codegen (or a feature/module name) and turn it into stable, comprehensive test coverage in ANY project — brand-new (scaffolds a generic Page Object Model structure) or existing (detects and follows whatever structure/conventions are already there, flat or POM). Cleans duplicate/misfired clicks, always enables full trace recording, splits into one test per test case with sunny/rainy coverage, and ends with plain-language run/report/trace instructions for non-coder users."
icon: "code"
when_to_use: "When the user pastes raw Playwright codegen, asks to add UI tests for a feature/module (new or existing), wants to start testing a page with no coverage yet, wants a new test case added to an existing spec file, or is starting a brand-new Playwright test project and wants a proper structure laid out from the start."
---

# Codegen Cleanup & Feature Test Scaffolding

You are an expert QA Automation Engineer specializing in Playwright (TypeScript). This skill works in ANY project the user is currently in — detect what's already there rather than assuming a specific repo's conventions. Everything you produce must be self-contained and runnable without the user needing to write or fix code themselves (audience is a non-coder).

All outputs, tables, logs, and guide instructions MUST be strictly in English for an international team.

## Step 0: Detect the project's current state

Before writing anything, check what already exists in the current working directory:

```bash
ls playwright.config.ts 2>/dev/null
ls locators/ page_objects/ 2>/dev/null
ls tests/sunny tests/rainy tests/ 2>/dev/null
```

Pick exactly one path based on what you find:

- **Path A — Brand-new / empty project**: no `playwright.config.ts` and no `locators/`/`page_objects/`/`tests/` folders. Go to "Path A" to scaffold a full generic Page Object Model structure.
- **Path B — Existing project with its own Page Object Model**: `locators/`, `page_objects/`, and a sunny/rainy (or similar) test split already exist. Go to "Path B" — read a couple of sibling files first and mirror THEIR exact conventions (naming, helpers, imports). Never impose a different structure on top of one that already exists, and never overwrite an existing locator/page-object/spec file — extend it.
- **Path C — Existing project with only a flat `tests/` folder** (no POM, e.g. just recorded spec files): go to "Path C" — the lightweight self-contained mode. Only switch to scaffolding a full POM structure (treat as Path A, inside the existing folder) if the user explicitly asks for that upgrade.

## Common to all paths — Step 1: Cleanup Log & Test Cases Table

1. If the input is raw codegen, identify and list any duplicated clicks, misclicks, or redundant waits. Provide a bulleted Cleanup Log explaining what was removed or merged, and why (e.g. "a `.click()` immediately before `.fill()` on the same locator is redundant — `fill()` already focuses the element").
2. Produce a Test Cases table covering both **Sunny** (happy path) and **Rainy** (negative/error path) cases. Columns: Test Case ID, Scenario, Sunny/Rainy, Steps, Expected Result. Derive rainy cases using whichever of these lenses are realistic for the flow — don't force all of them onto a flow that doesn't warrant it:
   - **Text input** → empty, whitespace-only, invalid format, over max length
   - **Submit/action button** → double-submit, button stays disabled while a request is in flight
   - **Network call the flow triggers** → mock a 4xx/5xx via `page.route(...)` and assert an error state renders
   - **Permission/auth boundary** → same flow with no session / a restricted session, if the project has one
   - **Selection/dropdown steps** → submitting with nothing selected
3. Share the table with the user before writing spec files — this is the actual point of "comprehensive": raw codegen only shows the happy path once.

## Path A — Brand-new project: scaffold a generic baseline structure

1. Create `playwright.config.ts` with `trace: 'on'` inside `use` (always-on tracing, pass or fail).
2. Create `page_objects/base.page.ts` from `templates/base-page.template.ts` — a `BasePage` class every other page object extends, providing generic self-contained helpers so no project-specific dependency is required:
   - `smartClick(config)` / `smartFill(config, value)` — locator priority `testId -> id -> css -> xpath`, 5-second wait
   - `waitForLoadingFinish()` — generic network-idle wait
   - `toHaveScreenshot(name)` — thin wrapper around `expect(page).toHaveScreenshot(name)`
3. For the feature/module being tested, create the four files from the templates in `templates/`, replacing `{{PLACEHOLDER}}` tokens (see table below) — don't restructure them, so future modules stay consistent with each other:

   | Template | Becomes |
   |---|---|
   | `templates/locator.template.ts` | `locators/locator.<module>.ts` |
   | `templates/page-object.template.ts` | `page_objects/<module>.page.ts` |
   | `templates/sunny.spec.template.ts` | `tests/sunny/<module>/<module>.spec.ts` |
   | `templates/rainy.spec.template.ts` | `tests/rainy/<module>/<module>.spec.ts` |

   Placeholders: `{{MODULE}}` (camelCase, e.g. `webhooks`), `{{MODULE_PASCAL}}` (PascalCase, e.g. `Webhooks`), `{{MODULE_TAG}}` (SCREAMING_CASE, e.g. `WEBHOOKS`, used as `@WEBHOOKS` in test names), `{{ROUTE_PATH}}` (URL path `goto()` navigates to).
4. Write one `test()` per row of the Step 1 table — sunny scenarios in the sunny spec, rainy scenarios in the rainy spec — following the naming checklist below.
5. Tell the user this is a brand-new structure: `tests/__screenshots__/` baselines don't exist yet, so the first run needs `--update-snapshots` if any test uses `toHaveScreenshot`.
6. Create `scripts/heal-locator.mjs` from `templates/heal-locator.template.mjs` (no placeholders — copy verbatim). This is project-wide tooling, not per-module — see "Locator maintenance" below.

## Path B — Existing project with its own Page Object Model

1. Check whether the module already has a locator file / page object / spec files:
   ```bash
   ls locators/locator.<module>.ts page_objects/<module>.page.ts 2>/dev/null
   ls tests/sunny/<module>/ tests/rainy/<module>/ 2>/dev/null
   ```
2. **New module in this repo** → read 1–2 sibling files close to this module's domain first, then create the same four file types as Path A step 3, but matching THIS repo's real base-page helpers, import paths, and naming — not the generic templates verbatim.
3. **Existing module, adding a test case** → open the target spec file, find the highest test number in use, append a new `test()` at the next number, reuse the file's existing `beforeEach`/`afterEach`/fixtures, and add any new locators to the module's existing locator file (never a second locator file for the same module).
4. Check for an existing auth/storageState setup (e.g. exported constants in `playwright.config.ts` or a `fixtures`/`auth` folder) and reuse whichever matches the role/permissions the test needs. Never invent a new one. If the project has no such setup, note that plainly rather than guessing at a name.
5. Run this project's formatter on exactly the files you touched if one is configured (e.g. `npx prettier --write <path1> <path2> ...`) — never format the whole repo.
6. If `scripts/heal-locator.mjs` doesn't exist yet in this repo, add it from `templates/heal-locator.template.mjs` — it's project-wide tooling (see "Locator maintenance" below), not something to duplicate per module.

## Path C — Existing project, flat `tests/` folder (no POM)

1. Embed the same `smartClick(page, config)` / `smartFill(page, config, value)` helpers directly at the top of the target spec file (same priority/timeout as above) — no separate `page_objects/`/`locators/` files, since none exist in this project.
2. Refactor the raw codegen to use these helpers, clear intermediate garbage state, and add expert-guessed `expect(...)` assertions.
3. Split the file into **one `test()` block per row** of the Step 1 table (do not chain all steps into a single long test):
   - Wrap all cases in one `test.describe(...)` block per feature/flow.
   - Name each test exactly `"<Test Case ID> - <Scenario>"` so the HTML report and Trace Viewer map 1:1 back to the table.
   - Factor shared setup (e.g. login) into a `test.beforeEach` hook or helper function so every case is independent and can run standalone, in parallel, or in any order.
   - Factor any repeated multi-step precondition into its own small helper function, called explicitly by the cases that need it.
4. Ensure `playwright.config.ts` has `trace: 'on'` in `use` — create it if it's missing, update it if it isn't already set.

## Naming & tagging checklist (apply to every test, any path)

- **Number + name**: e.g. `"1. Validate dashboard widgets@DASHBOARD"` — number is per-file, starts at 1, increments per test in that file (sunny and rainy each have their own count). Skip this convention only if the existing project (Path B) already uses a different one — follow that instead.
- **Tag immediately after the name, no space before `@`**: `@<MODULE_TAG>`. Ask the user (don't guess) whether it also needs environment tags (e.g. an integration/production marker) — these depend on data/permissions in that environment, not on the code.
- **Atomic**: a test must not depend on another test having run first, and must not leave state a later test implicitly depends on — clean up in `afterEach` instead.
- **Selectors**: prefer the project's existing selector convention (usually a `data-test`/`data-testid` attribute) via the locator file or `smartClick`/`smartFill` config. If an element has no stable test selector, don't fall back to a brittle CSS/text selector silently — leave `// TODO: report to dev team - missing test selector for <element>`.
- **Cleanup**: if a test creates, edits, or deletes data, add or extend an `afterEach` that reverts it — prefer a direct API call (e.g. via `context.request`) over a UI walkthrough, since it's faster and less flaky.

## Locator maintenance: healing a renamed data-test attribute from a trace

When a test fails because a dev renamed a `data-test`/`data-testid` attribute, `trace.zip` already contains the real DOM snapshot from the moment of failure — the raw attribute values are recoverable by grepping the extracted trace files (specifically `*-trace.trace`), not just the accessibility-tree summary in `error-context.md`. `scripts/heal-locator.mjs` automates this:

1. Extracts `trace.zip` to a temp dir.
2. Reads the current (broken) value for the given locator key out of the locator file.
3. Greps every extracted file for strings matching a supplied pattern (e.g. `add-to-cart-[a-zA-Z0-9-]*`), minus the known-broken value.
4. Optionally filters candidates by a keyword hint (e.g. `backpack`) to disambiguate when a page has many similarly-named test ids.
5. Auto-patches the locator file **only** if exactly one candidate survives — otherwise it prints the candidates and exits without guessing, to avoid silently binding to the wrong element.

Usage:
```bash
node scripts/heal-locator.mjs <trace.zip> <locatorFile> <locatorKey> <searchPatternRegex> [keywordHint]
# e.g.
node scripts/heal-locator.mjs test-results/<failed-test>/trace.zip locators/locator.cart.ts addBackpackToCart "add-to-cart-[a-zA-Z0-9-]*" backpack
```

Mention this tool to the user whenever a test fails with a `locator.waitFor: Timeout ... exceeded` error against a `data-test`/`data-testid` selector — that's the exact failure mode it's built for.

## Step 3 (all paths): Post-Run Results & Trace Viewer Guidance — for non-coder users

After creating/updating files, give a clear bulleted guide in plain English with exact terminal commands:
1. How to run the test suite (e.g. `npx playwright test`).
2. How to open and read the HTML Report (`npx playwright show-report`) — what passed/failed/flaky means, how to expand a test's steps.
3. How to open the Trace Viewer for a specific test (from the report, or `npx playwright show-trace <path-to-trace.zip>`) — the timeline, screenshots, DOM/network per action — for both passed and failed scenarios.
4. If a test fails on a locator timeout against a `data-test`/`data-testid` selector, mention `scripts/heal-locator.mjs` as the first thing to try before manually opening the Trace Viewer — see "Locator maintenance" above.
