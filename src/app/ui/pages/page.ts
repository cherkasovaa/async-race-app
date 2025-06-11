import type { Creator } from '../../types/interfaces';
import View from '../view';

export default class Page extends View {
  protected pageName = 'Garage';
  protected headerElement: HTMLElement | undefined = undefined;
  protected pageTextElement: HTMLElement | undefined = undefined;

  /**
   * Creates an instance of Page.
   * @param {string} pageName - The name of page view.
   * @param {Creator} options - An object with options of page view.
   */
  constructor(pageName: string, options: Creator) {
    super(options);

    this.pageName = pageName;
  }

  /**
   * Updates Header text content with total count of cars
   * and Page text content with current page index.
   *
   * @protected
   * @param {number} count - The total count of cars or winners
   * @param {number} pageIndex - The current view page index
   */
  protected updateHeaderFields(count: number, pageIndex: number): void {
    this.updateHeaderText(count);
    this.updatePageText(pageIndex);
  }

  /**
   * Initializes the basic page structure.
   * Subclasses should override this to add their specific content,
   * potentially calling super.createView() first.
   *
   * @protected
   */
  protected createView(): void {
    this.createHeader();
  }

  /**
   * Creates a header element.
   *
   * @protected
   */
  protected createHeader(): void {
    this.headerElement = document.createElement('h1');

    this.element.addInnerElement(this.headerElement);
    this.updateHeaderText();
  }

  /**
   * Updates the header text content.
   *
   * @protected
   */
  protected updateHeaderText(count = 0): void {
    if (this.headerElement) {
      this.headerElement.textContent = `${this.pageName} (${String(count)})`;
    }
  }

  /**
   * Creates the paragraph element used to display the current page number (e.g., "Page #1").
   *
   * @protected
   * @param {number} currentPageIndex - The index of the current display page.
   */
  protected createPageText(currentPageIndex: number): void {
    this.pageTextElement = document.createElement('p');

    this.element.addInnerElement(this.pageTextElement);
    this.updatePageText(currentPageIndex);
  }

  /**
   * Updates the text content of the page number element
   *
   * @protected
   * @param {number} currentPageIndex - The index of the current display page.
   */
  protected updatePageText(currentPageIndex: number): void {
    if (this.pageTextElement) {
      this.pageTextElement.textContent = `Page #${String(currentPageIndex)}`;
    }
  }
}
