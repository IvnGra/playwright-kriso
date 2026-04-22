import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  private readonly resultsTotal: Locator;
  private readonly selectedFilters: Locator;
  private readonly clearFiltersButton: Locator;

  private readonly englishFilterCandidates: Locator[];
  private readonly cdFilterCandidates: Locator[];

  constructor(page: Page) {
    super(page);
    this.resultsTotal = this.page.locator('.sb-results-total').first();
    this.selectedFilters = this.page.locator('.sb-filters-selected');
    this.clearFiltersButton = this.page.locator('.srcfilters-remove').first();

    this.englishFilterCandidates = [
      this.page.getByRole('link', { name: /^English$/i }),
      this.page.getByRole('link', { name: /Inglise|Ingliskeelsed/i }),
      this.page.getByText(/^English$/i),
      this.page.getByText(/Inglise|Ingliskeelsed/i),
    ];

    this.cdFilterCandidates = [
      this.page.locator('a[href*="format=CD"]'),
      this.page.getByRole('link', { name: /^CD$/i }),
      this.page.getByText(/^CD$/i),
      this.page.locator('.itemname').filter({ hasText: /^CD$/i }),
    ];
  }

  async getResultsCount() {
    try {
      const resultsText = await this.resultsTotal.textContent({ timeout: 5000 });
      return Number((resultsText || '').replace(/\D/g, '')) || 0;
    } catch {
      return await this.page.locator('.book-list .product').count();
    }
  }

  async verifyResultsCountMoreThan(minCount: number) {
    const total = await this.getResultsCount();
    expect(total).toBeGreaterThan(minCount);
  }

  async verifyUrlContains(value: string | RegExp) {
    await expect(this.page).toHaveURL(value);
  }

  async openKitarrCategory() {
    await this.page.getByRole('link', { name: /Kitarr/i }).first().click();
  }

  async applyEnglishLanguageFilter() {
    await this.clickFirstAvailable(this.englishFilterCandidates);
  }

  async applyCdFormatFilter() {
    await this.clickFirstAvailable(this.cdFilterCandidates);
  }

  async verifyActiveFiltersContain(value: string | RegExp) {
    await expect(this.selectedFilters).toContainText(value);
  }

  async clearActiveFilters() {
    await this.clearFiltersButton.click();
  }

  private async clickFirstAvailable(candidates: Locator[]) {
    for (const candidate of candidates) {
      const count = await candidate.count();
      for (let i = 0; i < count; i++) {
        const option = candidate.nth(i);
        if (await option.isVisible()) {
          await option.click();
          await this.page.waitForLoadState('domcontentloaded');
          return;
        }
      }

      if (count > 0) {
        await candidate.first().click({ force: true });
        await this.page.waitForLoadState('domcontentloaded');
        return;
      }
    }

    throw new Error('None of the candidate filter locators were found.');
  }
}
