import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { {{MODULE}}Locators } from '../locators/locator.{{MODULE}}';

export class {{MODULE_PASCAL}}Page extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('{{ROUTE_PATH}}');
    await this.waitForLoadingFinish();
  }

  // Add one method per distinct interaction, e.g.:
  // async submit{{MODULE_PASCAL}}Form() {
  //   await this.smartClick({ testId: {{MODULE}}Locators.submitButton });
  // }

  // Add one validate method per expected outcome, e.g.:
  // async validate{{MODULE_PASCAL}}Submitted() {
  //   await expect(this.page.locator(`[data-test="${ {{MODULE}}Locators.successMessage} "]`)).toBeVisible();
  // }
}
