import styles from './header.module.scss';

import type {
  Creator,
  InteractiveElementOptions,
} from '../../types/interfaces';
import View from '../view';
import ElementCreator from '../../utils/element-creator';
import Button from '../button/button';
import type Main from '../main/main';
import type Garage from '../pages/garage/garage';
import type Winner from '../pages/winner/winner';

/**
 * Represents the header component of the application, including navigation.
 *
 * @export
 * @class Header
 * @extends {View}
 */

enum Pages {
  GARAGE = 'Garage',
  WINNER = 'Winner',
}
interface PageOptions {
  name: string;
  callback: (event: Event) => void;
}

export default class Header extends View {
  /**
   * Creates an instance of Header.
   * @param {Main} mainComponent - The main application container responsible for displaying page content
   * @param {Garage} garageView - The instance of Garage class
   * @param {Winner} winnerView - The instance of Winner class
   */
  constructor(mainComponent: Main, garageView: Garage, winnerView: Winner) {
    const parameters: Creator = {
      tag: 'header',
      classNames: [styles.header],
    };

    super(parameters);

    this.createView(mainComponent, garageView, winnerView);
  }

  /**
   * Creates the navigation element and page buttons and appends them
   * to the header element.
   *
   * @private
   * @param {Main} mainComponent - The main application container responsible for displaying page content
   * @param {Garage} garageView - The instance of Garage class
   * @param {Winner} winnerView - The instance of Winner class
   */
  private createView(
    mainComponent: Main,
    garageView: Garage,
    winnerView: Winner
  ): void {
    const navigationElement: ElementCreator = this.createNavigationElement();

    this.createNavigationButtons(
      mainComponent,
      garageView,
      winnerView,
      navigationElement
    );
  }

  /**
   * Creates navigation element and adds it to header component.
   *
   * @private
   * @return {ElementCreator} - A navigation created element.
   */
  private createNavigationElement(): ElementCreator {
    const navParameters: Creator = {
      tag: 'nav',
      classNames: [styles.navigation],
    };

    const navigationElement: ElementCreator = new ElementCreator(navParameters);

    this.element.addInnerElement(navigationElement);

    return navigationElement;
  }

  /**
   * Creates the navigation buttons for switching pages Garage and Winner.
   *
   * @private
   * @param {Main} mainComponent - The main application container responsible for displaying page content
   * @param {Garage} garageView - The instance of Garage class
   * @param {Winner} winnerView - The instance of Winner class
   * @param {ElementCreator} navigationElement - The navigation element.
   */
  private createNavigationButtons(
    mainComponent: Main,
    garageView: Garage,
    winnerView: Winner,
    navigationElement: ElementCreator
  ): void {
    const pages: PageOptions[] = [
      {
        name: Pages.GARAGE,
        callback: (event: Event): void => {
          this.setContent(event, garageView, mainComponent);
        },
      },
      {
        name: Pages.WINNER,
        callback: (event: Event): void => {
          this.setContent(event, winnerView, mainComponent);
        },
      },
    ];

    for (let page of pages) {
      const parameters: InteractiveElementOptions = {
        text: page.name,
        classNames: [styles.navigationButton],
        attributes: {
          'data-id': page.name.toLowerCase(),
        },
        callback: page.callback,
      };

      const button: Button = new Button(parameters);

      navigationElement.addInnerElement(button.getHTMLElement());
    }
  }

  /**
   * Renders a page view only if it should be shown another page.
   *
   * @private
   * @param {Event} event - The click event object.
   * @param {View} view - The page view instance to be potentially displayed
   * @param {Main} mainComponent - Parent component
   */
  private setContent(event: Event, view: View, mainComponent: Main): void {
    if (event.target instanceof HTMLElement) {
      const targetId = event.target.dataset.id;

      if (targetId === undefined) {
        throw new Error('Target element is missing data-id attribute');
      }

      mainComponent.setContent(view, targetId);
    }
  }
}
