import type { Creator } from '../types/interfaces';
import ElementCreator from '../utils/element-creator';

/**
 * Represents a basic view component, encapsulating an HTML element created by ElementCreator.
 * Acts as a base class for other view components.
 *
 * @export
 * @class View
 */
export default class View {
  protected element: ElementCreator;

  /**
   * Creates an instance of View.
   *
   * @param {Creator} parameters - An object with the element's parameters:
   * tag, classNames, and optional textContent, attributes and callback
   */
  constructor(parameters: Creator) {
    this.element = new ElementCreator(parameters);
  }

  /**
   * Returns the HTML element.
   *
   * @return {HTMLElement} The HTML element.
   */
  public getHTMLElement(): HTMLElement {
    return this.element.getElement();
  }
}
