import { test, expect } from '@playwright/test';
import { {{MODULE_PASCAL}}Page } from '../../../page_objects/{{MODULE}}.page';

test.describe('{{MODULE_PASCAL}} - Rainy', () => {
  let {{MODULE}}Page: {{MODULE_PASCAL}}Page;

  test.beforeEach(async ({ page }) => {
    {{MODULE}}Page = new {{MODULE_PASCAL}}Page(page);
    await {{MODULE}}Page.goto();
  });

  test('1. TC00X - <Describe the negative-path scenario>@{{MODULE_TAG}}', async ({ page }) => {
    // e.g. mock a network error:
    // await page.route('**/api/{{MODULE}}/**', route => route.fulfill({ status: 500 }));
  });
});
