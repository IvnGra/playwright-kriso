import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartPage } from './CartPage';
import { ProductPage } from './ProductPage';

export class HomePage extends BasePage {
  private readonly url = 'https://www.kriso.ee/';
  private readonly resultsTotal: Locator;
  private readonly addToCartLink: Locator;
  private readonly addToCartMessage: Locator;
  private readonly cartCount: Locator;
  private readonly backButton: Locator;
  private readonly forwardButton: Locator;
  private readonly noResultsMessage: Locator;
  private readonly musicBooksAndSheetLink: Locator;
  private readonly kitarrLink: Locator;
  private readonly resultTitles: Locator;

  constructor(page: Page) {
    super(page);
    this.resultsTotal = this.page.locator('.sb-results-total');
    this.addToCartLink = this.page.getByRole('link', { name: 'Lisa ostukorvi' });
    this.addToCartMessage = this.page.locator('.item-messagebox');
    this.cartCount = this.page.locator('.cart-products');
    this.backButton = this.page.locator('.cartbtn-event.back');
    this.forwardButton = this.page.locator('.cartbtn-event.forward');
    this.noResultsMessage = this.page.locator('.msg.msg-info');
    this.musicBooksAndSheetLink = this.page.getByRole('link', { name: 'Muusikaraamatud ja noodid' });
    this.kitarrLink = this.page.getByRole('link', { name: /Kitarr/i });
    this.resultTitles = this.page.locator('.book-list .product h3');
  }

  async openUrl() {
    await this.page.goto(this.url);
  }

  async verifyResultsCountMoreThan(minCount: number) {
    const resultsText = await this.resultsTotal.textContent();
    const total = Number((resultsText || '').replace(/\D/g, '')) || 0;
    expect(total).toBeGreaterThan(minCount);
  }

  async addToCartByIndex(index: number) {
    await this.addToCartLink.nth(index).click();
  }

  async verifyAddToCartMessage() {
    await expect(this.addToCartMessage).toContainText('Toode lisati ostukorvi');
  }

  async verifyCartCount(expectedCount: number) {
    await expect(this.cartCount).toContainText(expectedCount.toString());
  }

  async goBackFromCart() {
    await this.backButton.click();
  }

  async openShoppingCart() {
    await this.forwardButton.click();
    return new CartPage(this.page);
  }

  async verifyNoProductsFoundMessage() {
    await expect(this.noResultsMessage).toContainText('Teie poolt sisestatud märksõnale vastavat raamatut ei leitud. Palun proovige uuesti!');
  }

  async verifySearchResultsContainKeyword(keyword: string) {
    const titles = await this.resultTitles.allTextContents();
    expect(titles.length).toBeGreaterThan(0);

    const loweredKeyword = keyword.toLowerCase();
    const matchingTitles = titles.filter((title) => title.toLowerCase().includes(loweredKeyword));

    expect(matchingTitles.length).toBeGreaterThan(0);
  }

  async verifyResultContainsText(expectedText: string) {
    const titles = await this.resultTitles.allTextContents();
    const hasMatch = titles.some((title) => title.toLowerCase().includes(expectedText.toLowerCase()));

    expect(hasMatch).toBeTruthy();
  }

  async openKitarrCategory() {
    await this.musicBooksAndSheetLink.first().scrollIntoViewIfNeeded();
    await this.kitarrLink.first().click();
    return new ProductPage(this.page);
  }
}
