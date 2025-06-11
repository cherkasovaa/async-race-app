export interface Creator {
  tag: string;
  classNames: string[];
  textContent?: string;
  attributes?: Record<string, string>;
  callback?: (event: Event) => void;
}

export interface InteractiveElementOptions {
  text: string;
  classNames: string[];
  attributes?: Record<string, string>;
  callback: (event: Event) => void;
}

export interface CarInformation {
  name: string;
  color: string;
}

export interface GeneratorOptions {
  buttonText: string;
  onSubmit: (data: CarInformation) => Promise<void>;
}

export interface GaragePanelCallbacks {
  onCreate: (data: CarInformation) => Promise<void>;
  onUpdate: (data: CarInformation) => Promise<void>;
  onRace: () => Promise<void>;
  onReset: () => void;
  onGenerate: () => Promise<void>;
}

export interface CarDataFromApi extends CarInformation {
  id: number;
}

export interface GetCarsResponse {
  items: CarDataFromApi[];
  totalCount: number;
}

export interface WinnerInformationFromApi extends WinnerResponse {
  id: number;
}

export interface WinnerResponse {
  wins: number;
  time: number;
}

export interface FullWinnerDetails {
  count: number;
  car: SVGElement;
  name: string;
  wins: number;
  time: number;
}

export interface GetWinnersResponse {
  items: WinnerInformationFromApi[];
  totalCount: number;
}

export interface CarCallbacks {
  onSelect: (data: CarDataFromApi) => void;
  onDelete: (id: number) => Promise<void>;
  onStart: (id: number) => Promise<void>;
  onStop: (id: number) => Promise<void>;
}

export interface Engine {
  velocity: number;
  distance: number;
}

export interface CarAnimationOptions {
  carId: number;
  car: SVGElement;
  duration: number;
  distance: number;
  onFinish?: (carId: number, timeElapsed: number) => void;
}

export interface FilterCallbacks {
  onFilterWins: () => void;
  onFilterTime: () => void;
}

export interface Cell {
  textContent: string;
  callback: (event: Event) => void;
}

export interface PaginationCallbacks {
  goToPrevPage: () => void;
  goToNextPage: () => void;
}
