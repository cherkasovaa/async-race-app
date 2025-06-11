import styles from './table.module.scss';

import type {
  Cell,
  Creator,
  FilterCallbacks,
  FullWinnerDetails,
} from '../../types/interfaces';
import ElementCreator from '../../utils/element-creator';
import type { Order } from '../pages/winner/winner';
import View from '../view';

export default class Table extends View {
  public tBody: ElementCreator | undefined = undefined;
  private callbacks: FilterCallbacks;
  private tHeadCells: Cell[] = [
    {
      textContent: '№',
      callback: (): void => {
        return;
      },
    },
    {
      textContent: 'Car',
      callback: (): void => {
        return;
      },
    },
    {
      textContent: 'Name',
      callback: (): void => {
        return;
      },
    },
    {
      textContent: 'Wins',
      callback: (event: Event): void => {
        this.updateSortIndicators(event);
        this.callbacks.onFilterWins();
      },
    },
    {
      textContent: 'Fast Time (seconds)',
      callback: (event: Event): void => {
        this.updateSortIndicators(event);
        this.callbacks.onFilterTime();
      },
    },
  ];
  private currentOrder: Order;
  private headerCells: ElementCreator[] = [];

  /**
   * Creates an instance of Table.
   *
   * @param {FilterCallbacks} callbacks - An object containing callback functions for sorting/filtering actions initiated by table headers.
   * @param {Order} order - The initial sort order to be displayed.
   */
  constructor(callbacks: FilterCallbacks, order: Order) {
    const options: Creator = {
      tag: 'table',
      classNames: [styles.table],
    };

    super(options);
    this.callbacks = callbacks;
    this.currentOrder = order;
    this.createView();
  }

  /**
   * Adds a single row representing a winner to the table body
   *
   * @param {FullWinnerDetails} winner - The complete data required to render a winner row.
   */
  public updateBody(winner: FullWinnerDetails): void {
    if (!this.tBody) return;

    const winnerRowOptions: Creator = {
      tag: 'tr',
      classNames: [],
    };

    const row: ElementCreator = new ElementCreator(winnerRowOptions);

    for (const value of Object.values(winner)) {
      const cellOption: Creator = {
        tag: 'td',
        classNames: [styles.tableCell],
      };

      const cell: ElementCreator = new ElementCreator(cellOption);

      if (value instanceof SVGElement) {
        cell.getElement().append(value);
      } else {
        cell.setTextContent(String(value));
      }

      row.addInnerElement(cell);
    }

    this.tBody.addInnerElement(row);
  }

  /**
   * Updates the internal state representing the current sort order.
   *
   * @param {Order} order
   */
  public updateOrder(order: Order): void {
    this.currentOrder = order;
  }

  /**
   * Initializes the table structure by creating its main parts.
   *
   * @private
   */
  private createView(): void {
    this.createHeader();
    this.createBody();
  }

  /**
   * Creates and adds the header to the table;
   *
   * @private
   */
  private createHeader(): void {
    const options: Creator = {
      tag: 'thead',
      classNames: [styles.tableHead],
    };

    const tHead: ElementCreator = new ElementCreator(options);

    this.element.addInnerElement(tHead);

    const row: ElementCreator = this.createTHeadRow();
    tHead.addInnerElement(row);
  }

  /**
   * Creates row with cells for <thead> tag.
   *
   * @private
   * @return {ElementCreator} - The row with content for tHead.
   */
  private createTHeadRow(): ElementCreator {
    const rowOptions: Creator = {
      tag: 'tr',
      classNames: [],
    };

    const row: ElementCreator = new ElementCreator(rowOptions);
    this.createHeaderCell(row);
    return row;
  }

  /**
   * Creates header cells.
   *
   * @private
   * @param {ElementCreator} rootElement - The table header row element creator to which the cells will be added.
   */
  private createHeaderCell(rootElement: ElementCreator): void {
    for (const cell of this.tHeadCells) {
      const cellOptions: Creator = {
        tag: 'th',
        classNames: [styles.tableCell],
        textContent: cell.textContent,
        callback: cell.callback,
      };

      const cellElement: ElementCreator = new ElementCreator(cellOptions);
      this.headerCells.push(cellElement);
      rootElement.addInnerElement(cellElement);
    }
  }

  /**
   * Updates the visual sort indicators on header cells in response to a click event.
   *
   * @private
   * @param {Event} event - The click event object, used to identify the target header cell.
   */
  private updateSortIndicators(event: Event): void {
    for (const cell of this.headerCells) {
      const element = cell.getElement();
      let currentText = element.textContent ?? '';

      if (currentText.endsWith(' ▲')) {
        currentText = currentText.slice(0, -2);
      } else if (currentText.endsWith(' ▼')) {
        currentText = currentText.slice(0, -2);
      }

      element.textContent = currentText;
    }

    if (event.target instanceof HTMLElement) {
      const targetText = event.target.textContent ?? '';

      const indicator = this.currentOrder === 'ASC' ? ' ▲' : ' ▼';
      event.target.textContent = `${targetText} ${indicator}`;
    }
  }

  /**
   * Creates the `<tbody>` element
   *
   * @private
   */
  private createBody(): void {
    const tBodyOptions: Creator = {
      tag: 'tbody',
      classNames: [],
    };

    this.tBody = new ElementCreator(tBodyOptions);
    this.element.addInnerElement(this.tBody);
  }
}
