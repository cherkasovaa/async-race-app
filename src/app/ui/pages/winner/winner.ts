import styles from './winner.module.scss';
import carSvgString from '../../../../assets/images/car.svg?raw';

import type {
  CarDataFromApi,
  Creator,
  FilterCallbacks,
  FullWinnerDetails,
  PaginationCallbacks,
  WinnerInformationFromApi,
} from '../../../types/interfaces';
import Table from '../../table/table';
import Page from '../page';
import type APIService from '../../../api/api-service';
import Pagination from '../../pagination/pagination';

type Sort = 'id' | 'wins' | 'time';
export type Order = 'ASC' | 'DESC';
export default class Winner extends Page {
  private apiService: APIService;
  private table: Table | undefined;
  private currentPage = 1;
  private WINNERS_PER_PAGE = 10;
  private totalCount = 0;
  private winners: WinnerInformationFromApi[] = [];
  private maxPages = 1;
  private currentSort: Sort = 'id';
  private currentOrder: Order = 'ASC';
  private pagination: Pagination | undefined;

  /**
   * Creates an instance of Winner.
   * @param {APIService} api - The instance of APIService for data fetching
   */
  constructor(api: APIService) {
    const options: Creator = {
      tag: 'div',
      classNames: [styles.winner],
      attributes: {
        'data-id': 'winners',
      },
    };
    const pageName = 'Winners';

    super(pageName, options);

    this.apiService = api;
    this.createPageView();

    this.loadInitialData();
  }

  /**
   * Public method to trigger reloading and updating the winners table.
   *
   */
  public updateTable(): void {
    void this.loadWinners(this.currentPage);
  }

  /**
   * Loads initial winner data when the component is initialized.
   * Intentionally does not await the result here.
   *
   * @private
   */
  private loadInitialData(): void {
    void this.loadWinners();
  }

  /**
   * Loads winner data for a specific page from the API
   * and updates the component's state and UI.
   *
   * @private
   * @param {number} [page=this.currentPage] - The page number to load. Defaults to the component's current page value.
   * @return {Promise<void>} A promise that resolves when loading and rendering is complete.
   * @throws {Error} If fetching winners fails. Individual car fetch errors are logged internally.
   */
  private async loadWinners(
    page: number = this.currentPage,
    sort = this.currentSort,
    order = this.currentOrder
  ): Promise<void> {
    try {
      const { items, totalCount } = await this.apiService.getWinners(
        page,
        this.WINNERS_PER_PAGE,
        sort,
        order
      );

      this.winners = items;
      this.totalCount = totalCount;
      this.currentPage = page;
      this.maxPages = Math.ceil(this.totalCount / this.WINNERS_PER_PAGE);

      void this.updateTableBody();
      this.updateHeaderFields(this.totalCount, this.currentPage);
      this.pagination?.updatePaginationState(this.currentPage, this.totalCount);
    } catch {
      throw new Error('Failed to load cars');
    }
  }

  /**
   * Initializes the page structure.
   *
   * @private
   */
  private createPageView(): void {
    this.createHeader();
    this.createPageText(this.currentPage);
    this.createPagination();
    this.renderTable();
  }

  /**
   * Creates an instance of the winners Table
   *
   * @private
   */
  private renderTable(): void {
    const callbacks: FilterCallbacks = {
      onFilterWins: () => {
        this.handleSortChange('wins');
      },
      onFilterTime: () => {
        this.handleSortChange('time');
      },
    };
    this.table = new Table(callbacks, this.currentOrder);

    this.element.addInnerElement(this.table.getHTMLElement());
  }

  /**
   * Sorts table by `wins` and `time`
   *
   * @private
   * @param {Sort} sortByField - The text of the sort field
   */
  private handleSortChange(sortByField: Sort): void {
    if (this.currentSort === sortByField) {
      this.currentOrder = this.currentOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.currentSort = sortByField;
      this.currentOrder = sortByField === 'time' ? 'ASC' : 'DESC';
    }

    this.table?.updateOrder(this.currentOrder);

    void this.loadWinners(this.currentPage);
  }

  /**
   * Clears and repopulates the table body with winner data for the current page.
   *
   * @private
   * @return {Promise<void>}
   */
  private async updateTableBody(): Promise<void> {
    this.clearTableBody();

    const winnerIds: number[] = this.winners.map(
      (winner: WinnerInformationFromApi) => winner.id
    );
    const carPromises: Promise<CarDataFromApi>[] = winnerIds.map((id) =>
      this.apiService.getCar(id)
    );
    const carResults: PromiseSettledResult<CarDataFromApi>[] =
      await Promise.allSettled(carPromises);
    const carDataMap = new Map<number, CarDataFromApi>();

    for (const [index, result] of carResults.entries()) {
      if (result.status === 'fulfilled') {
        carDataMap.set(winnerIds[index], result.value);
      }
    }

    let count = (this.currentPage - 1) * this.WINNERS_PER_PAGE + 1;

    for (const winner of this.winners) {
      const carData = carDataMap.get(winner.id);

      if (carData) {
        try {
          const carImage = this.renderImage(
            String(carSvgString),
            carData.color
          );
          const fullDetails: FullWinnerDetails = {
            count: count++,
            car: carImage,
            name: carData.name,
            wins: winner.wins,
            time: winner.time,
          };
          this.table?.updateBody(fullDetails);
        } catch {
          count++;
        }
      }
    }
  }

  /**
   * Removes all children from table body.
   *
   * @private
   */
  private clearTableBody(): void {
    while (this.table?.tBody?.getElement().firstElementChild) {
      this.table.tBody.getElement().firstElementChild?.remove();
    }
  }

  /**
   * Creates an SVG element from a raw SVG string.
   *
   * @private
   * @param {string} svgString - The raw SVG string content
   * @param {string} [color=this.DEFAULT_COLOR] - The color to apply via `style.color`.
   * @return {SVGElement} - The created and configured SVG element
   * @throws {Error} If the SVG string is empty or the root `<svg>` element cannot be found after parsing.
   */
  private renderImage(svgString: string, color: string): SVGElement {
    const container: HTMLDivElement = document.createElement('div');
    container.innerHTML = svgString;

    const svgElement: SVGElement | null = container.querySelector('svg');

    if (svgElement === null) {
      throw new Error('Could not find SVG element within the provided string');
    }

    svgElement.style.color = color;

    return svgElement;
  }

  /**
   * Creates pagination controls container with 'Prev' and 'Next' buttons.
   *
   * @private
   */
  private createPagination(): void {
    const callbacks: PaginationCallbacks = {
      goToPrevPage: this.goToPrevPage.bind(this),
      goToNextPage: this.goToNextPage.bind(this),
    };
    this.pagination = new Pagination(callbacks);

    this.element.addInnerElement(this.pagination.getHTMLElement());
  }

  /**
   * Navigates to the next page of winners if not already on the last page.
   *
   * @private
   */
  private goToNextPage(): void {
    if (this.currentPage >= this.maxPages) {
      return;
    }

    this.currentPage += 1;

    void this.loadWinners();
  }

  /**
   * Navigates to the previous page of winners if not already on the first page.
   *
   * @private
   */
  private goToPrevPage(): void {
    if (this.currentPage <= 1) {
      return;
    }
    this.currentPage -= 1;

    void this.loadWinners();
  }
}
