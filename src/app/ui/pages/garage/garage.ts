import styles from './garage.module.scss';
import carsData from '../../../data/cars.json';
import * as utilities from '../../../utils/utilities';

import type {
  CarAnimationOptions,
  CarCallbacks,
  CarDataFromApi,
  CarInformation,
  Creator,
  Engine,
  GaragePanelCallbacks,
  PaginationCallbacks,
  WinnerInformationFromApi,
  WinnerResponse,
} from '../../../types/interfaces';
import GaragePanel from '../../garage-panel/garage-panel';
import Page from '../page';
import type APIService from '../../../api/api-service';
import Car from '../../car/car';
import ElementCreator from '../../../utils/element-creator';
import type Winner from '../winner/winner';
import Pagination from '../../pagination/pagination';

/**
 * Implements the main Garage screen, managing car display, creation, updates, and race controls.
 *
 * @export
 * @class Garage
 * @extends {Page}
 */
export default class Garage extends Page {
  private apiService: APIService;
  private readonly CAR_PER_PAGE: number = 7;
  private currentPage = 1;
  private cars: CarDataFromApi[] = [];
  private totalCount = 0;
  private carArea: ElementCreator | undefined;
  private currentID: number | undefined = undefined;
  private garagePanel: GaragePanel | undefined;
  private carsData: Record<string, string[]>;
  private maxPages = 1;
  private activeAnimations = new Map<number, number>();
  private carInstances = new Map<number, Car>();
  private START_STATE = 'start';
  private messageElement!: ElementCreator;
  private currentWinnerId: number | undefined = undefined;
  private winnerData: { car: CarDataFromApi; time: number } | undefined =
    undefined;
  private winnerView: Winner;
  private pagination: Pagination | undefined;
  /**
   * Creates an instance of Garage.
   * @param {APIService} api - The instance of APIService for data fetching
   *
   */
  constructor(api: APIService, winnerView: Winner) {
    const options: Creator = {
      tag: 'div',
      classNames: [styles.garage],
      attributes: {
        'data-id': 'garage',
      },
    };

    const pageName = 'Garage';

    super(pageName, options);

    this.apiService = api;
    this.winnerView = winnerView;
    this.carsData = carsData;
    this.createPageView();

    this.loadInitialData();
  }

  /**
   * Creates the content for the Garage page
   *
   * @private
   */
  private createPageView(): void {
    this.createControlPanel();
    this.createHeader();
    this.createPageText(this.currentPage);
    this.createCarsArea();
    this.createPagination();
    this.createMessage();
  }

  /**
   * Loads initial car data when the component is initialized.
   * Intentionally does not await the result here.
   *
   * @private
   */
  private loadInitialData(): void {
    void this.loadCars();
  }

  /**
   * Loads car data for a specific page from the API
   * and updates the component's state and UI.
   *
   * @private
   * @param {number} [page=this.currentPage] - The page number to load. Defaults to the component's current page value.
   * @return {Promise<void>}
   */
  private async loadCars(page: number = this.currentPage): Promise<void> {
    try {
      const { items, totalCount } = await this.apiService.getCars(
        page,
        this.CAR_PER_PAGE
      );

      this.cars = items;
      this.totalCount = totalCount;
      this.currentPage = page;
      this.maxPages = Math.ceil(this.totalCount / this.CAR_PER_PAGE);

      this.renderCars();
      this.updateHeaderFields(this.totalCount, this.currentPage);

      this.pagination?.updatePaginationState(this.currentPage, this.totalCount);
    } catch {
      throw new Error('Failed to load cars');
    }
  }

  /**
   * Creates congratulation message element and adds it to the page
   *
   * @private
   */
  private createMessage(): void {
    const messageObject: Creator = {
      tag: 'div',
      classNames: [styles.message],
      textContent: 'This is winner text',
    };

    this.messageElement = new ElementCreator(messageObject);

    this.messageElement.addEventListener('click', () => {
      this.hideMessage();
    });

    this.element.addInnerElement(this.messageElement.getElement());
  }

  /**
   * Shows the winner message container with the provided text
   *
   * @private
   * @param {string} message - The message text to display
   */
  private showMessage(message: string): void {
    this.messageElement.setTextContent(message);

    this.messageElement.getElement().style.display = 'flex';
  }

  /**
   * Hides the winner message container
   *
   * @private
   */
  private hideMessage(): void {
    this.messageElement.setTextContent('');
    this.messageElement.getElement().style.display = 'none';
  }

  /**
   * Resets the winner ID and winner data object to undefined
   *
   * @private
   */
  private resetWinnerData(): void {
    this.currentWinnerId = undefined;
    this.winnerData = undefined;
  }

  /**
   * Creates the main container element where individual car components will be rendered.
   *
   * @private
   */
  private createCarsArea(): void {
    if (this.carArea) return;

    const areaOptions: Creator = {
      tag: 'div',
      classNames: [styles.garageCarArea],
    };

    this.carArea = new ElementCreator(areaOptions);
    this.element.addInnerElement(this.carArea.getElement());
  }

  /**
   * Creates pagination controls container with 'Prev' and 'Next' buttons.
   *
   * @private
   */
  private createPagination(): void {
    const callbacks: PaginationCallbacks = {
      goToPrevPage: () => {
        this.goToPrevPage();
      },
      goToNextPage: () => {
        this.goToNextPage();
      },
    };
    this.pagination = new Pagination(callbacks);

    this.element.addInnerElement(this.pagination.getHTMLElement());
  }

  /**
   * Navigates to the next page of cars if not already on the last page.
   *
   * @private
   */
  private goToNextPage(): void {
    this.handleReset();

    if (this.currentPage >= this.maxPages) {
      return;
    }

    this.currentPage += 1;

    void this.loadCars();
  }

  /**
   * Navigates to the previous page of cars if not already on the first page.
   *
   * @private
   */
  private goToPrevPage(): void {
    this.handleReset();

    if (this.currentPage <= 1) {
      return;
    }
    this.currentPage -= 1;

    void this.loadCars();
  }

  /**
   * Renders the current list of cars into the car area container
   *
   * @private
   */
  private renderCars(): void {
    this.carInstances.clear();

    while (this.carArea?.getElement().firstElementChild) {
      this.carArea.getElement().firstElementChild?.remove();
    }

    const callbacks: CarCallbacks = {
      onSelect: this.handleSelectCar.bind(this),
      onDelete: this.handleDeleteCar.bind(this),
      onStart: this.handleStartCar.bind(this),
      onStop: this.handleStopCar.bind(this),
    };

    for (const car of this.cars) {
      const carElement: Car = new Car(car, callbacks);
      if (this.carArea === undefined) {
        this.createCarsArea();
      } else {
        this.carInstances.set(car.id, carElement);
        this.carArea.addInnerElement(carElement.getHTMLElement());
      }
    }
  }

  /**
   * Creates the main control panel containing forms and action buttons.
   *
   */
  private createControlPanel(): void {
    const panelCallbacks: GaragePanelCallbacks = {
      onCreate: this.handleCreateCar.bind(this),
      onUpdate: this.handleUpdateCar.bind(this),
      onRace: this.handleRace.bind(this),
      onReset: this.handleReset.bind(this),
      onGenerate: this.handleGenerateCars.bind(this),
    };

    this.garagePanel = new GaragePanel(panelCallbacks);

    this.element.addInnerElement(this.garagePanel.getHTMLElement());
  }

  /**
   * Handles creating a new car. Sends the created car information to the Server API
   *
   * @private
   * @param {CarInformation} carInformation - An object with car information
   * @throws {Error} Throws an error if the HTTP request failed
   */
  private async handleCreateCar(carInformation: CarInformation): Promise<void> {
    try {
      await this.apiService.createCar(carInformation);
      await this.loadCars(this.currentPage);
    } catch {
      throw new Error('Failed to create car');
    }
  }

  /**
   * Handles updating an existing car. Sends the updated car information to the Server API.
   *
   * @private
   * @param {CarInformation} carInformation - An object with car information
   */
  private async handleUpdateCar(carInformation: CarInformation): Promise<void> {
    try {
      if (!this.currentID) {
        return;
      }

      if (this.garagePanel) {
        this.garagePanel.disabledUpdatePanel();
      }

      await this.apiService.updateCar(this.currentID, carInformation);
      await this.loadCars(this.currentPage);
    } catch {
      throw new Error('Failed to create car');
    }
  }

  /**
   * Initiates the race for all cars currently displayed on the page.
   *
   * @private
   */
  private async handleRace(): Promise<void> {
    const carIds = [...this.carInstances.keys()];

    if (carIds.length === 0) {
      throw new Error('No cars on the page to start race.');
    }

    this.resetWinnerData();
    this.hideMessage();
    this.garagePanel?.disabledRaceButton();

    const preparationPromises: Promise<CarAnimationOptions>[] = carIds.map(
      (carId: number) => {
        this.stopExistingAnimation(carId);

        this.carInstances.get(carId)?.handleButtonState(this.START_STATE);

        return this.getReadyForRace(carId);
      }
    );

    const results = await Promise.allSettled(preparationPromises);
    const carsReadyToAnimate: CarAnimationOptions[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const optionsWithCallback = {
          ...result.value,
          onFinish: this.handleCarFinish.bind(this),
        };
        carsReadyToAnimate.push(optionsWithCallback);
      }
    }

    const carsThatStartedAnimation: number[] =
      this.initiateAnimations(carsReadyToAnimate);

    for (const carId of carsThatStartedAnimation) {
      void this.checkDriveStatus(carId);
    }
  }

  /**
   * Starts the animation loop for all cars that were successfully prepared.
   *
   * @private
   * @param {CarAnimationOptions[]} carsReadyToAnimate - Array of animation options for cars
   * @return {number[]} An array of car IDs for which animation was successfully started
   */
  private initiateAnimations(
    carsReadyToAnimate: CarAnimationOptions[]
  ): number[] {
    const carsThatStartedAnimation: number[] = [];

    for (const carForAnimate of carsReadyToAnimate) {
      const carId = carForAnimate.carId;

      const animationId = this.animationCar(carForAnimate);

      if (animationId) {
        this.activeAnimations.set(carId, animationId);
        carsThatStartedAnimation.push(carId);
      }
    }

    return carsThatStartedAnimation;
  }

  /**
   * Resets the state (e.g., position) of all cars on the page to their starting points.
   *
   * @private
   */
  private handleReset(): void {
    this.hideMessage();
    this.resetWinnerData();
    this.garagePanel?.enabledRaceButton();

    for (const carId of this.carInstances.keys()) {
      void this.handleStopCar(carId);
    }
  }

  /**
   * Handles the generation of 100 random cars
   * by sending multiple create requests to the API.
   *
   * @private
   */
  private async handleGenerateCars(): Promise<void> {
    try {
      const count = 100;
      await Promise.allSettled(
        Array.from({ length: count }).map(() =>
          this.apiService.createCar({
            name: utilities.getRandomCarName(this.carsData),
            color: utilities.getRandomHexColor(),
          })
        )
      );
      await this.loadCars();
    } catch {
      throw new Error(`Failed to create 100 cars.`);
    }
  }

  /**
   * Handles selecting a car. Updating garage panel
   * and sets car data (name and color) to Generator.
   *
   * @private
   * @param {CarDataFromApi} data - An object with car information
   */
  private handleSelectCar(data: CarDataFromApi): void {
    if (this.garagePanel) {
      this.garagePanel.setCarInformation(data);
    }
    this.currentID = data.id;
  }

  /**
   * Handles deleting a car by its ID
   *
   * @private
   * @param {number} id - The ID of the car to delete.
   * @return {Promise<void>}
   */
  private async handleDeleteCar(id: number): Promise<void> {
    try {
      await this.apiService.deleteCar(id);
      await this.loadCars(this.currentPage);
      this.winnerView.updateTable();

      this.currentID = undefined;

      if (this.garagePanel) {
        this.garagePanel.disabledUpdatePanel();
      }
    } catch {
      throw new Error(`Failed to delete car by ID: ${String(id)}`);
    }
  }

  /**
   * Stops any currently running animation for the given car ID.
   *
   * @private
   * @param {number} cardId - The ID of the car whose animation should be stopped.
   */
  private stopExistingAnimation(cardId: number): void {
    if (this.activeAnimations.has(cardId)) {
      const existingAnimationID = this.activeAnimations.get(cardId);

      if (existingAnimationID) {
        cancelAnimationFrame(existingAnimationID);
        this.activeAnimations.delete(existingAnimationID);
      }
    }
  }

  /**
   * Calls the startEngine API and returns velocity and distance.
   *
   * @private
   * @param {number} cardId - The ID of the car.
   * @return {Promise<Engine>}
   */
  private async fetchingEngineParameters(cardId: number): Promise<Engine> {
    const engineObject = await this.apiService.startEngine(cardId);
    const { velocity, distance } = engineObject;

    return {
      velocity,
      distance,
    };
  }

  /**
   * Calculates the required animation duration and pixel distance.
   *
   * @private
   * @param {Engine} engineParameters - Parameters from the engine API
   * @param {Car} carInstance - The instance of the `Car` class for which to calculate details.
   * @return {{ duration: number; distanceX: number }}
   */
  private calculateAnimationDetails(
    engineParameters: Engine,
    carInstance: Car
  ): { duration: number; distanceX: number } {
    const { velocity, distance } = engineParameters;

    const flag = carInstance.flagImageElement;
    const car = carInstance.carImageElement;

    const duration = distance / velocity;

    const flagRect = flag.getBoundingClientRect();
    const carRect = car.getBoundingClientRect();

    const distanceX = flagRect.right - carRect.left;

    return { duration, distanceX };
  }

  /**
   * Checks the drive status via API and handles car breakdown.
   *
   * @private
   * @param {number} carId - The ID of the car.
   * @return {Promise<void>}
   */
  private async checkDriveStatus(carId: number): Promise<void> {
    const drive = await this.apiService.driveEngine(carId);

    if (!drive.success) {
      const failedAnimationId = this.activeAnimations.get(carId);

      if (failedAnimationId) {
        cancelAnimationFrame(failedAnimationId);

        this.activeAnimations.delete(carId);
      }
    }
  }

  /**
   * Cleans up animation state for a car.
   * @param carId - The ID of the car.
   */
  private cleanupAnimation(carId: number): void {
    const animationId = this.activeAnimations.get(carId);

    if (animationId) {
      cancelAnimationFrame(animationId);
      this.activeAnimations.delete(carId);
    }
  }

  /**
   * Gets engine parameters and calculate animation details for a single car.
   *
   * @private
   * @param {number} carId - The ID of the car to prepare.
   * @return {(Promise<CarAnimationOptions>)}
   */
  private async getReadyForRace(carId: number): Promise<CarAnimationOptions> {
    const carInstance: Car | undefined = this.carInstances.get(carId);

    if (carInstance === undefined) {
      throw new Error(`CarInstance ID ${String(carId)} does not exist`);
    }

    try {
      this.stopExistingAnimation(carId);

      const engineParameters: Engine =
        await this.fetchingEngineParameters(carId);

      const { duration, distanceX } = this.calculateAnimationDetails(
        engineParameters,
        carInstance
      );

      return {
        carId,
        car: carInstance.carImageElement,
        duration,
        distance: distanceX,
      };
    } catch {
      throw new Error(`Failed to prepare car ${String(carId)} for race`);
    }
  }

  /**
   * Handles the complete process of starting a specific car's movement.
   *
   * @private
   * @param {number} id - The unique ID of the car to start
   * @return {Promise<void>}
   */
  private async handleStartCar(id: number): Promise<void> {
    const carInstance: Car | undefined = this.carInstances.get(id);

    if (carInstance === undefined) {
      throw new Error(`CarInstance ID ${String(id)} does not exist`);
    }

    try {
      const options: CarAnimationOptions = await this.getReadyForRace(id);

      const animationId = this.animationCar(options);

      if (animationId) {
        this.activeAnimations.set(id, animationId);
      } else {
        await this.apiService.stopEngine(id);
        return;
      }

      carInstance.handleButtonState(this.START_STATE);

      await this.checkDriveStatus(id);
    } catch {
      this.cleanupAnimation(id);
      carInstance.handleButtonState();
    }
  }

  /**
   * Initiates and manages the `requestAnimationFrame` loop for animating a car's movement.
   *
   * @private
   * @param {CarAnimationOptions} options - An object containing the necessary parameters (
   * carId, car, duration and distance)
   * @return {(number | undefined)} - The initial animation frame ID requested
   */
  private animationCar(options: CarAnimationOptions): number | undefined {
    const { carId, car, duration, distance, onFinish } = options;

    let startTime: number | null;

    const step = (timestamp: number): void => {
      startTime ??= timestamp;

      const timeElapsed = timestamp - startTime;
      const progress = timeElapsed / duration;

      const deltaX = progress * distance;
      car.style.transform = `translateX(${String(deltaX)}px)`;

      if (progress < 1) {
        if (this.activeAnimations.has(carId)) {
          const nextFrameId = requestAnimationFrame(step);
          this.activeAnimations.set(carId, nextFrameId);
        }
      } else {
        this.activeAnimations.delete(carId);

        if (onFinish) {
          onFinish(carId, timeElapsed);
        }
      }
    };

    const initialFrameId = requestAnimationFrame(step);

    return initialFrameId;
  }

  /**
   * Handles the event when a car finishes its animation.
   *
   * @private
   * @param {number} carId - The ID of the car that finished.
   * @param {number} timeElapsed - The actual time (in ms) the animation took.
   */
  private handleCarFinish(carId: number, timeElapsed: number): void {
    if (this.currentWinnerId !== undefined) {
      return;
    }

    this.currentWinnerId = carId;
    const winnerCarData = this.cars.find((car) => car.id === carId);

    if (!winnerCarData) {
      throw new Error(`Winner car data not found for ID: ${String(carId)}`);
    }

    const timeSec = Number((timeElapsed / 1000).toFixed(2));
    this.winnerData = { car: winnerCarData, time: timeSec };

    this.showMessage(`${winnerCarData.name} wins in ${String(timeSec)}s`);

    void this.sendOrUpdateWinnerData(carId, timeSec);
  }

  /**
   * Gets existing winner data and creates/updates it on the server.
   *
   * @private
   * @param {number} carId - The ID of the winning car.
   * @param {number} timeSec - The winning time in seconds (rounded).
   * @throws {Error} Throws an error if the API requests fail unexpectedly.
   */
  private async sendOrUpdateWinnerData(
    carId: number,
    timeSec: number
  ): Promise<void> {
    try {
      let existingWinner: WinnerInformationFromApi | undefined = undefined;

      existingWinner = await this.apiService.getWinner(carId);

      if (existingWinner) {
        const updatedData: WinnerResponse = {
          wins: existingWinner.wins + 1,
          time: Math.min(existingWinner.time, timeSec),
        };

        await this.apiService.updateWinner(carId, updatedData);
      } else {
        const newWinnerData: WinnerInformationFromApi = {
          wins: 1,
          time: timeSec,
          id: carId,
        };

        await this.apiService.createWinner(newWinnerData);
      }

      this.winnerView.updateTable();
    } catch {
      throw new Error(`Failed to process winner data`);
    }
  }

  /**
   * Stops a specific car's animation, resets its visual position to the start,
   * and informs the API to stop the car's engine.
   *
   * @private
   * @param {number} id - The unique ID of the car to stop
   * @return {Promise<void>}
   */
  private async handleStopCar(id: number): Promise<void> {
    this.cleanupAnimation(id);

    const carInstance: Car | undefined = this.carInstances.get(id);

    if (carInstance === undefined) {
      throw new Error(`CarInstance ID ${String(id)} does not exist`);
    }

    carInstance.handleButtonState();

    try {
      const car: SVGElement | undefined =
        this.carInstances.get(id)?.carImageElement;

      if (car === undefined) {
        throw new Error('Error to get car img');
      }
      car.style.transform = `translateX(0px)`;

      await this.apiService.stopEngine(id);
    } catch {
      throw new Error(`Error stopping engine via API for car ${String(id)}`);
    }
  }
}
