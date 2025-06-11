import APIService from './api/api-service';
import Header from './ui/header/header';
import Main from './ui/main/main';
import Garage from './ui/pages/garage/garage';
import Winner from './ui/pages/winner/winner';

/**
 * The main application class. Initializes and renders core UI components.
 *
 * @export
 * @class App
 */
export default class App {
  public apiService: APIService;
  private root: HTMLElement;

  constructor() {
    this.root = document.body;
    this.apiService = new APIService();

    this.init();
  }

  /**
   * Initializes the application view.
   * Creates instances of Garage and Winner views and the main UI structure.
   *
   * @private
   */
  private init(): void {
    const winnerView: Winner = new Winner(this.apiService);
    const garageView: Garage = new Garage(this.apiService, winnerView);

    this.createView(garageView, winnerView);
  }

  /**
   * Creates and appends the Header and Main components to the document body.
   *
   * @private
   * @param {Garage} garageView - The instance of Garage class
   * @param {Winner} winnerView - The instance of Winner class
   */
  private createView(garageView: Garage, winnerView: Winner): void {
    const main: Main = new Main();
    const header: Header = new Header(main, garageView, winnerView);

    main.setContent(garageView);

    this.root.append(header.getHTMLElement(), main.getHTMLElement());
  }
}
