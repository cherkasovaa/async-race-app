import styles from './main.module.scss';

import type { Creator } from '../../types/interfaces';
import View from '../view';

export default class Main extends View {
  /**
   * Creates an instance of Main.
   */
  constructor() {
    const parameters: Creator = {
      tag: 'main',
      classNames: [styles.main],
    };
    super(parameters);
  }

  /**
   * Views the page view.
   *
   * @param {View} view - The page view instance to display.
   * @param {string} [buttonId='garage'] - The data-id associated with the requested page, used to prevent re-rendering.
   */
  public setContent(view: View, buttonId = 'garage'): void {
    const element = view.getHTMLElement();
    const currentElement = this.element.getElement();
    if (
      currentElement.firstElementChild instanceof HTMLElement &&
      buttonId === currentElement.firstElementChild.dataset.id
    ) {
      return;
    }

    if (currentElement.firstElementChild) {
      currentElement.firstElementChild.remove();
    }

    this.element.addInnerElement(element);
  }
}
