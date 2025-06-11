import styles from './pagination.module.scss';

import type {
  Creator,
  InteractiveElementOptions,
  PaginationCallbacks,
} from '../../types/interfaces';
import View from '../view';
import Button from '../button/button';

export default class Pagination extends View {
  private DISABLED_STATE = 'disabled';
  private prevButton: Button | undefined;
  private nextButton: Button | undefined;
  private callbacks: PaginationCallbacks;

  /**
   * Creates an instance of Pagination.
   *
   * @param {PaginationCallbacks} callbacks - An object containing callback functions invoked
   * when the 'Prev' or 'Next' buttons are clicked.
   */
  constructor(callbacks: PaginationCallbacks) {
    const rootOptions: Creator = {
      tag: 'div',
      classNames: [styles.pagination],
    };

    super(rootOptions);
    this.callbacks = callbacks;

    this.createView();
  }

  /**
   * Updates the enabled/disabled state of the pagination buttons
   *
   * @param {number} page - The current active page number
   * @param {number} totalPages - The total number of pages available
   * @throws {Error} If the pagination button instances are not properly initialized before calling this method.
   */
  public updatePaginationState(page: number, totalPages: number): void {
    if (!this.nextButton || !this.prevButton) {
      throw new Error('Pagination button does not exist');
    }

    const previousButtonElement: HTMLElement = this.prevButton.getHTMLElement();
    const nextButtonElement: HTMLElement = this.nextButton.getHTMLElement();

    if (page <= 1) {
      previousButtonElement.setAttribute(this.DISABLED_STATE, '');
    } else {
      previousButtonElement.removeAttribute(this.DISABLED_STATE);
    }

    if (page >= totalPages) {
      nextButtonElement.setAttribute(this.DISABLED_STATE, '');
    } else {
      nextButtonElement.removeAttribute(this.DISABLED_STATE);
    }
  }

  /**
   * Initializes the pagination view by creating the control buttons.
   *
   * @private
   */
  private createView(): void {
    this.createPreviousButton();
    this.createNextButton();
  }

  /**
   * Creates the 'Previous' page control button and adds it to the view.
   *
   * @private
   */
  private createPreviousButton(): void {
    const previousButtonOptions: InteractiveElementOptions = {
      text: 'Prev',
      classNames: [styles.paginationButton],
      attributes: {
        disabled: '',
      },
      callback: this.callbacks.goToPrevPage,
    };

    this.prevButton = new Button(previousButtonOptions);
    this.element.addInnerElement(this.prevButton.getHTMLElement());
  }

  /**
   * Creates the 'Next' page control button and adds it to the view.
   *
   * @private
   */
  private createNextButton(): void {
    const nextButtonOptions: InteractiveElementOptions = {
      text: 'Next',
      classNames: [styles.paginationButton],
      attributes: {
        disabled: '',
      },
      callback: this.callbacks.goToNextPage,
    };

    this.nextButton = new Button(nextButtonOptions);
    this.element.addInnerElement(this.nextButton.getHTMLElement());
  }
}
