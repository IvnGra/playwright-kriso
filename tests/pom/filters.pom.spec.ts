/**
 * Part II — Page Object Model tests
 * Test suite: Navigate Products via Filters
 *
 * Rules:
 *   - No raw selectors in test files — all locators live in page classes
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { ProductPage } from '../../pages/ProductPage';

test.describe.configure({ mode: 'serial' });

let page: Page;
let homePage: HomePage;
let productPage: ProductPage;

test.describe('Navigate Products via Filters (POM)', () => {

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    homePage = new HomePage(page);

    await homePage.openUrl();
    await homePage.acceptCookies();
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('Test logo is visible', async () => {
    await homePage.verifyLogo();
  });

  test('Test navigation and filtering by category, language and format', async () => {
    productPage = await homePage.openMusicBooksCategory();
    await productPage.openKitarrCategory();

    const kitarrCount = await productPage.getResultsCount();
    await productPage.verifyResultsCountMoreThan(1);
    await productPage.verifyUrlContains(/kitarr|instrument=Guitar/i);

    await productPage.applyEnglishLanguageFilter();
    const languageCount = await productPage.getResultsCount();
    await productPage.verifyActiveFiltersContain(/English|Inglise|Ingliskeelsed/i);
    expect(languageCount).toBeLessThanOrEqual(kitarrCount);

    await productPage.applyCdFormatFilter();
    const cdCount = await productPage.getResultsCount();
    await productPage.verifyUrlContains(/format=CD|cd/i);
    expect(cdCount).toBeLessThanOrEqual(languageCount);

    await productPage.clearActiveFilters();
    await expect(page).not.toHaveURL(/format=CD/i);
  });


});
