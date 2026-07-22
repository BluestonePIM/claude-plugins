import { test, expect } from '@playwright/test';
import { {{MODULE_PASCAL}}Page } from '../../../page_objects/{{MODULE}}.page';

test.describe('{{MODULE_PASCAL}} - Sunny', () => {
  let {{MODULE}}Page: {{MODULE_PASCAL}}Page;

  test.beforeEach(async ({ page }) => {
    {{MODULE}}Page = new {{MODULE_PASCAL}}Page(page);
    await {{MODULE}}Page.goto();
  });

  test('1. TC001 - <Describe the happy-path scenario>@{{MODULE_TAG}}', async () => {
    // Arrange/Act/Assert using {{MODULE}}Page methods
  });
});
