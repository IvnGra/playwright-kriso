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
    const musicSection = page.getByRole('heading', { name: /Muusikaraamatud ja noodid/i });
    await musicSection.first().scrollIntoViewIfNeeded();
    await expect(musicSection.first()).toBeVisible();

    await page.getByRole('link', { name: /Kitarr/i }).first().click();

    const kitarrCount = await getResultsCount(page);
    expect(kitarrCount).toBeGreaterThan(1);
    await expect(page).toHaveURL(/kitarr/i);

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
      page.getByRole('link', { name: /^CD$/i }),
      page.getByText(/^CD$/i),
      page.locator('.itemname').filter({ hasText: /^CD$/i }),
    ]);

    const cdCount = await getResultsCount(page);
    await expect(page.locator('.sb-filters-selected')).toContainText(/CD/i);
    expect(cdCount).toBeLessThanOrEqual(languageCount);

    await page.locator('.srcfilters-remove').first().click();

    const afterRemoveCount = await getResultsCount(page);
    expect(afterRemoveCount).toBeGreaterThanOrEqual(cdCount);
  });

  async function getResultsCount(currentPage: Page) {
    const resultsText = await currentPage.locator('.sb-results-total').first().textContent();
    return Number((resultsText || '').replace(/\D/g, '')) || 0;
  }

  async function clickFirstAvailable(locators: Locator[]) {
    for (const locator of locators) {
      if (await locator.count()) {
        await locator.first().click();
        return;
      }
    }

    throw new Error('None of the candidate locators were found.');
  }

});
