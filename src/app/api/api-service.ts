import type {
  CarDataFromApi,
  CarInformation,
  Engine,
  GetCarsResponse,
  GetWinnersResponse,
  WinnerInformationFromApi,
  WinnerResponse,
} from '../types/interfaces';

export default class APIService {
  private readonly baseURL: string;
  private readonly garageEndpoint: string;
  private readonly engineEndpoint: string;
  private readonly winnerEndpoint: string;

  /**
   * Creates an instance of APIService.
   *
   * @param {string} [baseURL='http://127.0.0.1:3000'] - The base URL of the server.
   */
  constructor(baseURL = 'http://127.0.0.1:3000') {
    this.baseURL = baseURL;
    this.garageEndpoint = `${this.baseURL}/garage`;
    this.engineEndpoint = `${this.baseURL}/engine`;
    this.winnerEndpoint = `${this.baseURL}/winners`;
  }

  /**
   * Gets cars from the server.
   *
   * @param {number} [page=1] - The page number to retrieve.
   * @param {number} [limit=7] - The maximum number of cars per page.
   * @return {Promise<GetCarsResponse>} A promise that resolves with the list of cars and total count.
   * @throws {Error} If the API request fails or the response format is invalid.
   */
  public async getCars(page = 1, limit = 7): Promise<GetCarsResponse> {
    const response = await fetch(
      `${this.garageEndpoint}?_page=${page.toString()}&_limit=${limit.toString()}`
    );

    if (!response.ok) {
      throw new Error(
        `API Error: ${response.status.toString()} ${response.statusText}`
      );
    }

    const data: unknown = await response.json();

    if (!this.isCarDataFromApiArray(data)) {
      throw new Error('Invalid data format received from API.');
    }

    const items = data;
    const totalCountHeader = response.headers.get('X-Total-Count');

    return {
      items,
      totalCount: Number(totalCountHeader),
    };
  }

  /**
   * Fetches car data by ID
   *
   * @param {number} id - Car ID
   * @return {Promise<CarDataFromApi>} - Promise allowed by the car data object
   */
  public async getCar(id: number): Promise<CarDataFromApi> {
    const ID = String(id);
    const response = await fetch(`${this.garageEndpoint}/${ID}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch car ${ID}: ${response.statusText}`);
    }

    const data: unknown = await response.json();

    if (!this.isCarDataFromApi(data)) {
      throw new Error(`Received invalid data format for car ${ID} from API.`);
    }

    return data;
  }

  /**
   * Updates car data by ID
   *
   * @param {number} id - Car ID
   * @param {CarInformation} options - New car data
   * @return {Promise<void>}
   */
  public async updateCar(id: number, options: CarInformation): Promise<void> {
    const ID = String(id);
    const response = await fetch(`${this.garageEndpoint}/${ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Failed to update car: ${response.statusText}`);
    }
  }

  /**
   * Creates a new car by sending a POST request
   *
   * @param {CarInformation} car - Object with the information about the car
   * @throws {Error} Throws an error if the HTTP request failed
   */
  public async createCar(car: CarInformation): Promise<void> {
    const response = await fetch(this.garageEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(car),
    });

    if (!response.ok) {
      throw new Error(`Failed to create car: ${response.statusText}`);
    }
  }

  /**
   * Deletes car data from the server by its ID
   *
   * @param {number} id - The ID of the car to delete
   * @return {Promise<void>} A promise that resolves on successful deletion.
   * @throws {Error} If the deletion fails.
   */
  public async deleteCar(id: number): Promise<void> {
    const ID = String(id);

    const garageResponse = await fetch(`${this.garageEndpoint}/${ID}`, {
      method: 'DELETE',
    });

    if (!garageResponse.ok) {
      throw new Error(
        `Failed to delete car ${ID}: ${garageResponse.statusText}`
      );
    }

    const winnersResponse = await fetch(`${this.winnerEndpoint}/${ID}`, {
      method: 'DELETE',
    });

    if (!winnersResponse.ok) {
      throw new Error(
        `Failed to delete car ${ID} from winners: ${garageResponse.statusText}`
      );
    }
  }

  /**
   * Gets car engine data from the server by its ID
   *
   * @param {number} id - The ID of the car to race
   * @return {Promise<Engine>} A promise that resolves on successful deletion.
   * @throws {Error} If the gets data failed.
   */
  public async startEngine(id: number): Promise<Engine> {
    const ID = String(id);

    const response = await fetch(
      `${this.engineEndpoint}?id=${ID}&status=started`,
      {
        method: 'PATCH',
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to start engine of specified car ${ID}: ${response.statusText}`
      );
    }

    const data: unknown = await response.json();

    if (!this.isEngineDataFromApi(data)) {
      throw new Error(
        `Received invalid data format for engine ${ID} from API.`
      );
    }

    return data;
  }

  /**
   * Sets car engine data to the server by its ID
   *
   * @param {number} id - The ID of the car to stopped
   * @return {Promise<Engine>} A promise that resolves on successful deletion.
   * @throws {Error} If the gets data failed.
   */
  public async stopEngine(id: number): Promise<Engine> {
    const ID = String(id);

    const response = await fetch(
      `${this.engineEndpoint}?id=${ID}&status=stopped`,
      {
        method: 'PATCH',
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to start engine of specified car ${ID}: ${response.statusText}`
      );
    }

    const data: unknown = await response.json();

    if (!this.isEngineDataFromApi(data)) {
      throw new Error(
        `Received invalid data format for engine ${ID} from API.`
      );
    }

    return data;
  }

  /**
   * Sets car engine data to the server by its ID
   *
   * @param {number} id - The ID of the car to stopped
   * @return {Promise<unknown>} A promise that resolves on successful deletion or bad request.
   * @throws {Error} If the gets data failed.
   */
  public async driveEngine(id: number): Promise<{ success: boolean }> {
    const ID = String(id);

    const response = await fetch(
      `${this.engineEndpoint}?id=${ID}&status=drive`,
      {
        method: 'PATCH',
      }
    );

    if (!response.ok) {
      return { success: false };
    }

    const data: unknown = await response.json();

    if (!this.isSuccessObject(data)) {
      throw new Error(`Received invalid data format for ${ID} from API.`);
    }
    return data;
  }

  /**
   * Gets winners from the server.
   *
   * @param {number} [page=1] - The page number to retrieve.
   * @param {number} [limit=10] - The maximum number of winners per page.
   * @return {Promise<GetWinnersResponse>} A promise that resolves with the list of winners and total count.
   * @throws {Error} If the API request fails or the response format is invalid.
   */
  public async getWinners(
    page = 1,
    limit = 10,
    sort: 'id' | 'wins' | 'time' = 'id',
    order: 'ASC' | 'DESC' = 'ASC'
  ): Promise<GetWinnersResponse> {
    const sortParameters = `&_sort=${sort}&_order=${order}`;

    const response = await fetch(
      `${this.winnerEndpoint}?_page=${page.toString()}&_limit=${limit.toString()}${sortParameters}`
    );

    if (!response.ok) {
      throw new Error(
        `API Error: ${response.status.toString()} ${response.statusText}`
      );
    }

    const data: unknown = await response.json();

    if (!this.isWinnerDataFromApiArray(data)) {
      throw new Error('Invalid data format received from API.');
    }

    const items = data;
    const totalCountHeader = response.headers.get('X-Total-Count');

    return {
      items,
      totalCount: Number(totalCountHeader),
    };
  }

  /**
   * Fetches car data by ID
   *
   * @param {number} id - Car ID
   * @return {Promise<WinnerInformationFromApi>} - Promise allowed by the car data object
   */
  // public async getWinner(id: number): Promise<unknown | null> {
  public async getWinner(
    id: number
  ): Promise<WinnerInformationFromApi | undefined> {
    const ID = String(id);
    const response = await fetch(`${this.winnerEndpoint}/${ID}`, {
      method: 'GET',
    });

    if (response.status === 404) {
      return undefined;
    }

    const data: unknown = await response.json();

    if (!this.isWinnerDataFromApi(data)) {
      throw new Error(`Received invalid data format for car ${ID} from API.`);
    }

    return data;
  }

  /**
   * Creates a winner by sending a POST request
   *
   * @param {WinnerInformationFromApi} winner - Object with the information about the winner
   * @throws {Error} Throws an error if the HTTP request failed
   */
  public async createWinner(winner: WinnerInformationFromApi): Promise<void> {
    const response = await fetch(this.winnerEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(winner),
    });

    if (!response.ok) {
      throw new Error(`Failed to create winner: ${response.statusText}`);
    }
  }

  /**
   * Deletes winner data from the server by its ID
   *
   * @param {number} id - The ID of the car to delete
   * @return {Promise<void>} A promise that resolves on successful deletion.
   * @throws {Error} If the deletion fails.
   */
  public async deleteWinner(id: number): Promise<void> {
    const ID = String(id);

    const response = await fetch(`${this.winnerEndpoint}/${ID}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete winner ${ID}: ${response.statusText}`);
    }
  }

  /**
   * Updates winner data by ID
   *
   * @param {number} id - Car ID
   * @param {WinnerInformationFromApi} options - New winner data
   * @return {Promise<void>}
   */
  public async updateWinner(
    id: number,
    options: WinnerResponse
  ): Promise<void> {
    const ID = String(id);
    const response = await fetch(`${this.winnerEndpoint}/${ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Failed to update winner: ${response.statusText}`);
    }
  }

  /**
   * Checks if the data received is a valid array of CarDataFromApi objects.
   * Acts as a Type Guard.
   *
   * @private
   * @param {unknown} array - The data to check
   * @return {array is CarDataFromApi[]} True if data is a valid CarDataFromApi array, false otherwise.
   */
  private isCarDataFromApiArray(array: unknown): array is CarDataFromApi[] {
    return (
      Array.isArray(array) &&
      array.every((element: CarDataFromApi) => this.isCarDataFromApi(element))
    );
  }

  /**
   * Checks if the data received is a valid array of WinnerInformationFromApi objects.
   * Acts as a Type Guard.
   *
   * @private
   * @param {unknown} array - The data to check
   * @return {array is WinnerInformationFromApi[]} True if data is a valid WinnerInformationFromApi array, false otherwise.
   */
  private isWinnerDataFromApiArray(
    array: unknown
  ): array is WinnerInformationFromApi[] {
    return (
      Array.isArray(array) &&
      array.every((element: CarDataFromApi) =>
        this.isWinnerDataFromApi(element)
      )
    );
  }

  /**
   * Checks if object from server response is CarDataFromApi object with valid data.
   * Type guard helper method
   *
   * @private
   * @param {unknown} data - An object for checks
   * @return {data is CarDataFromApi} True if object is CarDataFromApi object, false otherwise
   */
  private isCarDataFromApi(data: unknown): data is CarDataFromApi {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    return 'id' in data && 'name' in data && 'color' in data;
  }

  /**
   * Checks if object from server response is CarDataFromApi object with valid data.
   * Type guard helper method
   *
   * @private
   * @param {unknown} data - An object for checks
   * @return {data is WinnerInformationFromApi} True if object is CarDataFromApi object, false otherwise
   */
  private isWinnerDataFromApi(data: unknown): data is WinnerInformationFromApi {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    return 'id' in data && 'wins' in data && 'time' in data;
  }

  /**
   * Checks if object from server response is Engine object with valid data.
   * Type guard helper method
   *
   * @private
   * @param {unknown} data - An object for checks
   * @return {data is Engine} True if object is Engine object, false otherwise
   */
  private isEngineDataFromApi(data: unknown): data is Engine {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    return 'velocity' in data && 'distance' in data;
  }

  /**
   * Checks if object from server response is Engine object with valid data.
   * Type guard helper method
   *
   * @private
   * @param {unknown} data - An object for checks
   * @return {data is { success: boolean }} True if object is Engine object, false otherwise
   */
  private isSuccessObject(data: unknown): data is { success: boolean } {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    return 'success' in data;
  }
}
