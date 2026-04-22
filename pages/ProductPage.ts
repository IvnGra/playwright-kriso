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
      this.page.getByRole('link', { name: /^CD$/i }),
      this.page.getByText(/^CD$/i),
      this.page.locator('.itemname').filter({ hasText: /^CD$/i }),
    ];
  }

  async getResultsCount() {
    const resultsText = await this.resultsTotal.textContent();
    return Number((resultsText || '').replace(/\D/g, '')) || 0;
  }

  async verifyResultsCountMoreThan(minCount: number) {
    const total = await this.getResultsCount();
    expect(total).toBeGreaterThan(minCount);
  }

  async verifyUrlContains(value: string | RegExp) {
    await expect(this.page).toHaveURL(value);
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
      if (await candidate.count()) {
        await candidate.first().click();
        return;
      }
    }

    throw new Error('None of the candidate filter locators were found.');
  }
}
