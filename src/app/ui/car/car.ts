import styles from './car.module.scss';
import carSvgString from '../../../assets/images/car.svg?raw';
import flagSvgString from '../../../assets/images/flag.svg?raw';

import type {
  CarCallbacks,
  CarDataFromApi,
  Creator,
  InteractiveElementOptions,
} from '../../types/interfaces';
import ElementCreator from '../../utils/element-creator';
import Button from '../button/button';
import View from '../view';

/**
 * Represents a single Car component in the Garage view.
 *
 * @export
 * @class Car
 * @extends {View}
 */
export default class Car extends View {
  public carImageElement!: SVGElement;
  public flagImageElement!: SVGElement;
  private stopButtonElement!: Button;
  private startButtonElement!: Button;
  private data: CarDataFromApi;
  private callbacks: CarCallbacks;
  private DEFAULT_COLOR = '#ff0000';
  private START_STATE = 'start';
  private STOP_STATE = 'stop';
  private DISABLED_STATE = 'disabled';
  /**
   * Creates an instance of Car.
   *
   * @param {CarDataFromApi} data - The data for this specific car (id, name, color).
   * @param {CarCallbacks} callbacks - Callback functions provided by the parent component (`Garage`)
   */
  constructor(data: CarDataFromApi, callbacks: CarCallbacks) {
    const options: Creator = {
      tag: 'div',
      classNames: [styles.car],
    };

    super(options);

    this.data = data;
    this.callbacks = callbacks;

    this.createView();
  }

  /**
   * Sets the enabled/disabled state of the car's Start (A) and Stop (B) buttons.
   *
   * @param {string} [state=this.STOP_STATE] - Specifies the state the buttons should reflect.
   */
  public handleButtonState(state: string = this.STOP_STATE): void {
    if (state === this.START_STATE) {
      this.startButtonElement
        .getHTMLElement()
        .setAttribute(this.DISABLED_STATE, '');
      this.stopButtonElement
        .getHTMLElement()
        .removeAttribute(this.DISABLED_STATE);
    } else {
      this.stopButtonElement
        .getHTMLElement()
        .setAttribute(this.DISABLED_STATE, '');
      this.startButtonElement
        .getHTMLElement()
        .removeAttribute(this.DISABLED_STATE);
    }
  }

  /**
   * Creates the main visual structure of the car component.
   *
   * @private
   */
  private createView(): void {
    const controls: ElementCreator = this.createControls();
    const track: ElementCreator = this.createTrack();

    this.element.addInnerElement(controls);
    this.element.addInnerElement(track);
  }

  /**
   * Creates the top control section for the car.
   *
   * @private
   * @return {ElementCreator} An ElementCreator instance containing the control elements.
   */
  private createControls(): ElementCreator {
    const containerOptions: Creator = {
      tag: 'div',
      classNames: [styles.carTopPart],
    };
    const container: ElementCreator = new ElementCreator(containerOptions);

    const buttons = [
      {
        text: 'Select',
        classNames: [styles.carButton],
        callback: (): void => {
          this.callbacks.onSelect(this.data);
        },
      },
      {
        text: 'Remove',
        classNames: [styles.carButton],
        callback: (): void => {
          void this.callbacks.onDelete(this.data.id);
        },
      },
    ];

    for (const button of buttons) {
      const buttonElement: Button = new Button(button);
      container.addInnerElement(buttonElement.getHTMLElement());
    }

    const headerOptions: Creator = {
      tag: 'p',
      classNames: [],
      textContent: this.data.name,
    };

    const carName: ElementCreator = new ElementCreator(headerOptions);
    container.addInnerElement(carName.getElement());

    return container;
  }

  /**
   * Creates the bottom track section for the car.
   *
   * @private
   * @return {ElementCreator} - An ElementCreator instance containing the track elements.
   */
  private createTrack(): ElementCreator {
    const containerOptions: Creator = {
      tag: 'div',
      classNames: [styles.carBottomPart],
    };
    const container: ElementCreator = new ElementCreator(containerOptions);

    this.carImageElement = this.renderImage(
      String(carSvgString),
      styles.carImage,
      this.data.color
    );

    this.flagImageElement = this.renderImage(
      String(flagSvgString),
      styles.carFlag
    );

    this.createControlCarButtons(container);

    container.getElement().append(this.carImageElement);
    container.getElement().append(this.flagImageElement);
    return container;
  }

  /**
   * Creates the 'A' (Start) and 'B' (Stop) buttons for the car.
   *
   * @private
   * @param {ElementCreator} rootElement - The container element to which buttons will be added.
   */
  private createControlCarButtons(rootElement: ElementCreator): void {
    const startButtonOptions: InteractiveElementOptions = {
      text: 'A',
      classNames: [styles.carButton],
      callback: (): void => {
        void this.callbacks.onStart(this.data.id);
      },
    };

    this.startButtonElement = new Button(startButtonOptions);
    rootElement.addInnerElement(this.startButtonElement.getHTMLElement());

    const stopButtonOptions: InteractiveElementOptions = {
      text: 'B',
      classNames: [styles.carButton],
      attributes: {
        disabled: '',
      },
      callback: (): void => {
        void this.callbacks.onStop(this.data.id);
      },
    };

    this.stopButtonElement = new Button(stopButtonOptions);
    rootElement.addInnerElement(this.stopButtonElement.getHTMLElement());
  }

  /**
   * Creates an SVG element from a raw SVG string.
   *
   * @private
   * @param {string} svgString - The raw SVG string content
   * @param {string} className - The CSS class to add to the root SVG element
   * @param {string} [color=this.DEFAULT_COLOR] - The color to apply via `style.color`.
   * Defaults to `this.DEFAULT_COLOR`.
   * @return {SVGElement} - The created and configured SVG element
   * @throws {Error} If the SVG string is empty or the root `<svg>` element cannot be found after parsing.
   */
  private renderImage(
    svgString: string,
    className: string,
    color: string = this.DEFAULT_COLOR
  ): SVGElement {
    const container: HTMLDivElement = document.createElement('div');
    container.innerHTML = svgString;

    const svgElement: SVGElement | null = container.querySelector('svg');

    if (svgElement === null) {
      throw new Error('Could not find SVG element within the provided string');
    }

    svgElement.classList.add(className);
    svgElement.style.color = color;

    return svgElement;
  }
}
