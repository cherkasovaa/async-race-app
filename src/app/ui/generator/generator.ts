import styles from './generator.module.scss';
import type {
  Creator,
  InteractiveElementOptions,
  CarInformation,
  GeneratorOptions,
} from '../../types/interfaces';
import ElementCreator from '../../utils/element-creator';
import Button from '../button/button';
import View from '../view';

/**
 * Represents a form component used for creating or updating car information (name and color).
 *
 * @export
 * @class Generator
 * @extends {View}
 */
export default class Generator extends View {
  private DEFAULT_COLOR = '#98f701';
  private onSubmitCallback: (data: CarInformation) => void;
  private colorInput: HTMLElement | undefined;
  private nameInput: HTMLElement | undefined;
  private button: Button | undefined;
  /**
   * Creates an instance of Generator.
   *
   * @param {GeneratorOptions} options - Configuration options including button text and the submit callback.
   */
  constructor(options: GeneratorOptions) {
    const parameters: Creator = {
      tag: 'div',
      classNames: [styles.form],
    };

    super(parameters);

    const { buttonText, onSubmit } = options;

    this.onSubmitCallback = (data: CarInformation): void => {
      void onSubmit(data);
    };

    this.createView(buttonText);
  }

  /**
   * Sets car data to the inputs
   *
   * @param {CarInformation} data An object with car information
   */
  public setCarInformation(data: CarInformation): void {
    const { name, color } = data;
    this.enabled();

    if (this.nameInput instanceof HTMLInputElement) {
      this.nameInput.value = name;
    }

    if (this.colorInput instanceof HTMLInputElement) {
      this.colorInput.value = color;
    }
  }

  /**
   * Disables the container inputs and submit button, and reset the fields.
   *
   */
  public disabled(): void {
    this.reset();

    this.nameInput?.setAttribute('disabled', '');
    this.colorInput?.setAttribute('disabled', '');
    this.button?.getHTMLElement().setAttribute('disabled', '');
  }

  /**
   * Enables the container inputs and submit button.
   *
   */
  public enabled(): void {
    this.nameInput?.removeAttribute('disabled');
    this.colorInput?.removeAttribute('disabled');
    this.button?.getHTMLElement().removeAttribute('disabled');
  }

  /**
   * Creates generator view: text input, color selector and control button
   *
   * @private
   *  @param {string} buttonText - Text for the submit button.
   */
  private createView(buttonText: string): void {
    this.createInput();
    this.createColorInput();
    this.createButton(buttonText);
  }

  /**
   * Creates the text input
   *
   * @private
   */
  private createInput(): void {
    const inputOptions: Creator = {
      tag: 'input',
      classNames: [styles.formInput],
      attributes: {
        type: 'text',
        placeholder: 'Enter car model',
      },
    };

    const input: ElementCreator = new ElementCreator(inputOptions);
    this.nameInput = input.getElement();

    this.element.addInnerElement(this.nameInput);
  }

  /**
   * Creates color input. Color by default is `#98f701`
   *
   * @private
   */
  private createColorInput(): void {
    const colorInputOptions: Creator = {
      tag: 'input',
      classNames: [styles.formColorInput],
      attributes: {
        type: 'color',
        value: this.DEFAULT_COLOR,
      },
    };

    const colorInput: ElementCreator = new ElementCreator(colorInputOptions);
    this.colorInput = colorInput.getElement();

    this.element.addInnerElement(colorInput);
  }

  /**
   * Creates control button (Create or Update Car)
   *
   * @private
   * @param {string} text - The text content
   */
  private createButton(text: string): void {
    const buttonOptions: InteractiveElementOptions = {
      text: text,
      classNames: [styles.formButton],
      callback: (event: Event) => {
        event.preventDefault();
        this.handleSubmit();
      },
    };
    this.button = new Button(buttonOptions);

    this.element.addInnerElement(this.button.getHTMLElement());
  }

  /**
   * Handles the submission logic: gathers data and calls the onSubmit callback.
   * @private
   */
  private handleSubmit(): void {
    if (
      this.nameInput instanceof HTMLInputElement &&
      this.colorInput instanceof HTMLInputElement
    ) {
      let nameValue: string = this.nameInput.value.trim();
      const colorValue: string = this.colorInput.value;

      if (!nameValue) {
        nameValue = '';
      }

      const carInfo: CarInformation = {
        name: nameValue,
        color: colorValue,
      };
      this.onSubmitCallback(carInfo);

      this.reset();
    }
  }

  /**
   * Resets the input fields to their default state.
   *
   * @private
   */
  private reset(): void {
    if (this.nameInput instanceof HTMLInputElement) {
      this.nameInput.value = '';
    }
    if (this.colorInput instanceof HTMLInputElement) {
      this.colorInput.value = this.DEFAULT_COLOR;
    }
  }
}
