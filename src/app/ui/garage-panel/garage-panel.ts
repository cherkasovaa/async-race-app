import styles from './garage-panel.module.scss';
import type {
  CarInformation,
  Creator,
  GaragePanelCallbacks,
  GeneratorOptions,
  InteractiveElementOptions,
} from '../../types/interfaces';
import Button from '../button/button';
import View from '../view';
import Generator from '../generator/generator';
import ElementCreator from '../../utils/element-creator';

enum Buttons {
  CREATE = 'Create',
  UPDATE = 'Update',
}

/**
 * Implements the control panel for the Garage page,
 * containing forms for car creation/update and buttons for race control.
 *
 * @export
 * @class GaragePanel
 * @extends {View}
 */
export default class GaragePanel extends View {
  private callbacks: GaragePanelCallbacks;
  private updateForm: Generator | undefined = undefined;
  private raceButton: Button | undefined;
  private DISABLED_STATE = 'disabled';
  /**
   * Creates an instance of GaragePanel.
   *
   * @param {GaragePanelCallbacks} callbacks - Callbacks provided by the parent component (Garage).
   */
  constructor(callbacks: GaragePanelCallbacks) {
    const options: Creator = {
      tag: 'div',
      classNames: [styles.garagePanel],
    };

    super(options);

    this.callbacks = callbacks;
    this.createView();
  }

  /**
   * Locks the race button before starting a race
   *
   */
  public disabledRaceButton(): void {
    this.raceButton?.getHTMLElement().setAttribute(this.DISABLED_STATE, '');
  }

  /**
   * Unlocks the race button
   *
   */
  public enabledRaceButton(): void {
    this.raceButton?.getHTMLElement().removeAttribute(this.DISABLED_STATE);
  }

  /**
   * Sets car information to update form inputs
   *
   * @param {CarInformation} data An object with car information
   */
  public setCarInformation(data: CarInformation): void {
    if (this.updateForm) {
      this.updateForm.setCarInformation(data);
    }
  }

  /**
   * Disables update form panel
   *
   */
  public disabledUpdatePanel(): void {
    if (this.updateForm) {
      this.updateForm.disabled();
    }
  }

  /**
   * Creates the content of the control panel (forms, buttons)
   *
   * @private
   */
  private createView(): void {
    const createForm = this.createCarForm(
      Buttons.CREATE,
      this.callbacks.onCreate
    );
    this.updateForm = this.createCarForm(
      Buttons.UPDATE,
      this.callbacks.onUpdate
    );
    this.updateForm.disabled();
    const controlButtons = this.createControlButtons();

    this.element.addInnerElement(createForm.getHTMLElement());
    this.element.addInnerElement(this.updateForm.getHTMLElement());
    this.element.addInnerElement(controlButtons);
  }

  /**
   * Creates a car form component (Generator)
   *
   * @private
   * @param {string} buttonText - The text content for the form's submit button
   * @param {(data: CarInformation) => void} submitCallback - The function to call when the form is submitted.
   * @return {Generator} The Generator instance.
   */
  private createCarForm(
    buttonText: string,
    submitCallback: (data: CarInformation) => Promise<void>
  ): Generator {
    const options: GeneratorOptions = {
      buttonText: buttonText,
      onSubmit: submitCallback,
    };

    const container: Generator = new Generator(options);

    return container;
  }

  /**
   * Creates the race control container.
   *
   * @private
   * @return {HTMLElement} The root element of the control buttons: race, reset and generate 100 cars.
   */
  private createControlButtons(): HTMLElement {
    const containerOptions: Creator = {
      tag: 'div',
      classNames: [styles.garagePanelButtonsContainer],
    };
    const container: ElementCreator = new ElementCreator(containerOptions);
    const raceButtonOptions: InteractiveElementOptions = {
      text: 'Race',
      classNames: [styles.garagePanelButton],
      callback: (): void => void this.callbacks.onRace(),
    };

    this.raceButton = new Button(raceButtonOptions);
    container.addInnerElement(this.raceButton.getHTMLElement());

    const buttons = [
      {
        text: 'Reset',
        classNames: [styles.garagePanelButton],
        callback: this.callbacks.onReset,
      },
      {
        text: 'Generate Cars (100)',
        classNames: [styles.garagePanelButton],
        callback: this.callbacks.onGenerate,
      },
    ];

    for (const button of buttons) {
      const buttonElement: Button = new Button(button);
      container.addInnerElement(buttonElement.getHTMLElement());
    }

    return container.getElement();
  }
}
