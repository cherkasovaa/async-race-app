import type { Creator } from '../types/interfaces';

/**
 * This class is a utility for creating HTML elements.
 *
 * @export
 * @class ElementCreator
 */
export default class ElementCreator {
  protected readonly element: HTMLElement;

  /**
   * Creates an instance of ElementCreator.
   *
   * @param {Creator} parameters - An object with the element's parameters:
   * tag, classNames, and optional textContent, attributes and callback
   */
  constructor(parameters: Creator) {
    const { tag } = parameters;

    this.element = document.createElement(tag);

    this.createElement(parameters);
  }

  /**
   * Creates and configures the HTML element.
   *
   * @param {Creator} parameters - An object containing element properties: tag, classNames, and optional textContent, attributes, and callback.
   */

  public createElement(parameters: Creator): void {
    const { classNames, textContent, attributes, callback } = parameters;

    this.setCSSClasses(classNames);

    if (textContent) this.setTextContent(textContent);
    if (attributes) this.setAttributes(attributes);
    if (callback) this.addEventListener('click', callback);
  }

  /**
   * Returns the HTML element.
   *
   * @return {HTMLElement} - The HTML element.
   */
  public getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Adds the inner element to the parent element.
   *
   * @param {(HTMLElement | ElementCreator)} element -  The inner element to append.
   */
  public addInnerElement(element: HTMLElement | ElementCreator): void {
    const innerElement =
      element instanceof ElementCreator ? element.getElement() : element;

    this.element.append(innerElement);
  }

  /**
   * Adds CSS classes to the element.
   *
   * @param {string[]} cssClasses - An array of class names.
   */
  public setCSSClasses(cssClasses: string[]): void {
    this.element.classList.add(...cssClasses);
  }

  /**
   * Sets the text content of the element.
   *
   * @param {string} text - A text content.
   */
  public setTextContent(text: string): void {
    this.element.textContent = text;
  }

  /**
   * Sets the attributes tor the element.
   *
   * @param {Record<string, string>} attributes - An object where keys are attribute names and values are attribute values.
   */
  public setAttributes(attributes: Record<string, string>): void {
    for (const [key, value] of Object.entries(attributes)) {
      this.element.setAttribute(key, value);
    }
  }

  /**
   * Adds an event handler to the element.
   *
   * @param {keyof HTMLElementEventMap} eventType The type of event to listen for.
   * @param {(event: Event) => void} callback - The callback function.
   */
  public addEventListener(
    eventType: keyof HTMLElementEventMap,
    callback: (event: Event) => void
  ): void {
    this.element.addEventListener(eventType, callback);
  }
}
