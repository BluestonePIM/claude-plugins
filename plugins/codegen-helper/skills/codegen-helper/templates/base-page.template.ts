import { Page, expect } from '@playwright/test';

export interface LocatorConfig {
  testId?: string;
  id?: string;
  css?: string;
  xpath?: string;
}

const SMART_TIMEOUT = 5000;

export class BasePage {
  constructor(protected page: Page) {}

  protected resolveLocator(config: LocatorConfig) {
    if (config.testId) return this.page.locator(`[data-test="${config.testId}"]`);
    if (config.id) return this.page.locator(`#${config.id}`);
    if (config.css) return this.page.locator(config.css);
    if (config.xpath) return this.page.locator(`xpath=${config.xpath}`);
    throw new Error('BasePage: no valid locator strategy provided in config');
  }

  async smartClick(config: LocatorConfig) {
    const locator = this.resolveLocator(config);
    await locator.waitFor({ state: 'visible', timeout: SMART_TIMEOUT });
    await locator.click();
  }

  async smartFill(config: LocatorConfig, value: string) {
    const locator = this.resolveLocator(config);
    await locator.waitFor({ state: 'visible', timeout: SMART_TIMEOUT });
    await locator.fill(value);
  }

  async waitForLoadingFinish() {
    await this.page.waitForLoadState('networkidle');
  }

  async toHaveScreenshot(name: string) {
    await expect(this.page).toHaveScreenshot(name);
  }
}
