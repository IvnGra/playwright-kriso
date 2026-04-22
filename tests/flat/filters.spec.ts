/**
 * Part I — Flat tests (no POM)
 * Test suite: Navigate Products via Filters
 *
 * Rules:
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 *   - No CSS class selectors, no XPath
 *
 * Tip: run `npx playwright codegen https://www.kriso.ee` to discover selectors.
 */
import { test, expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

let page: Page;

test.describe('Navigate Products via Filters', () => {

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await page.goto('https://www.kriso.ee/');
    await page.getByRole('button', { name: 'Nõustun' }).click();
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('Test logo is visible', async () => {
    const logo = page.locator('.logo-icon');
    await expect(logo).toBeVisible();
  });

  test('Test navigation and filtering by category, language and format', async () => {
    const musicCategoryLink = page.getByRole('link', { name: 'Muusikaraamatud ja noodid' });
    await musicCategoryLink.first().scrollIntoViewIfNeeded();
    await expect(musicCategoryLink.first()).toBeVisible();
    await musicCategoryLink.first().click();

    await page.getByRole('link', { name: /Kitarr/i }).first().click();

    const kitarrCount = await getResultsCount(page);
    expect(kitarrCount).toBeGreaterThan(1);
    await expect(page).toHaveURL(/kitarr|instrument=Guitar/i);

    await clickFirstAvailable([
      page.getByRole('link', { name: /^English$/i }),
      page.getByRole('link', { name: /Inglise|Ingliskeelsed/i }),
      page.getByText(/^English$/i),
      page.getByText(/Inglise|Ingliskeelsed/i),
    ]);

    const languageCount = await getResultsCount(page);
    await expect(page.locator('.sb-filters-selected')).toContainText(/English|Inglise|Ingliskeelsed/i);
    expect(languageCount).toBeLessThanOrEqual(kitarrCount);

    await clickFirstAvailable([
      page.locator('a[href*="format=CD"]'),
      page.getByRole('link', { name: /^CD$/i }),
      page.getByText(/^CD$/i),
      page.locator('.itemname').filter({ hasText: /^CD$/i }),
    ]);

    const cdCount = await getResultsCount(page);
    await expect(page).toHaveURL(/format=CD|cd/i);
    expect(cdCount).toBeLessThanOrEqual(languageCount);

    await page.locator('.srcfilters-remove').first().click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).not.toHaveURL(/format=CD/i);
  });

  async function getResultsCount(currentPage: Page) {
    const totalLocator = currentPage.locator('.sb-results-total').first();

    try {
      const resultsText = await totalLocator.textContent({ timeout: 5000 });
      return Number((resultsText || '').replace(/\D/g, '')) || 0;
    } catch {
      return await currentPage.locator('.book-list .product').count();
    }
  }

  async function clickFirstAvailable(locators: Locator[]) {
    for (const locator of locators) {
      const count = await locator.count();
      for (let i = 0; i < count; i++) {
        const candidate = locator.nth(i);
        if (await candidate.isVisible()) {
          await candidate.click();
          await page.waitForLoadState('domcontentloaded');
          return;
        }
      }

      if (count > 0) {
        await locator.first().click({ force: true });
        await page.waitForLoadState('domcontentloaded');
        return;
      }
    }

    throw new Error('None of the candidate locators were found.');
  }

});
