import styles from './button.module.scss';
import type {
  Creator,
  InteractiveElementOptions,
} from '../../types/interfaces';
import View from '../view';

/**
 * Creates a standard button element with associated styles
 * and behavior, extending the base View class.
 *
 * @export
 * @class Button
 * @extends {View}
 */
export default class Button extends View {
  /**
   * Creates an instance of Button.
   *
   * @param {InteractiveElementOptions} options - Configuration options for the button (text, classes, attributes, click callback).
   */
  constructor(options: InteractiveElementOptions) {
    const { text, classNames = [], attributes = {}, callback } = options;

    const properties: Creator = {
      tag: 'button',
      classNames: [styles.button, ...classNames],
      textContent: text,
      attributes: {
        type: 'button',
        ...attributes,
      },
      callback: callback,
    };

    super(properties);
  }
}
