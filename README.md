# Async Race

![Static Badge](https://img.shields.io/badge/status-completed-success)
![Static Badge](https://img.shields.io/badge/version-1.0.0-blue)

**Async Race** is a responsive single-page application (SPA) developed as part of the [RSSchool](https://rs.school/) curriculum in April 2025. The project simulates a racing competition between cars from the user's collection.

The main goal of the project is to demonstrate working with asynchronous requests, managing animations based on server responses, and creating an interactive user interface without using third-party frameworks or libraries. The user interface and animations work correctly across different devices with screen widths starting from 320px.

**The application allows to:**

- Manage the list of cars in the 'Garage' screen (create, update, delete).
- Control the movement of individual cars (start and stop their engines).
- Start a race for all cars on the current 'Garage' page.
- View the winners' table with race results and data sorting.
- Generate a collection of random cars with a single button click.

## Table of Contents

- [Async Race](#async-race)
  - [Table of Contents](#table-of-contents)
  - [Demo](#demo)
  - [Launch and installation](#launch-and-installation)
    - [Starting the server](#starting-the-server)
    - [Accessing the application](#accessing-the-application)
  - [Project goals](#project-goals)
  - [Technologies](#technologies)
  - [Functionality](#functionality)
    - [General](#general)
    - [Garage](#garage)
    - [Winners](#winners)

## Demo

**Live Demo:** [Open the website](https://cherkasovaa.github.io/async-race-app/)

## Launch and installation

> [!WARNING]
> For the application to function fully, **a local server needs to be running**, which provides the API for managing cars and races.

### Starting the server

1.  **Requirements:** ensure you have [Node.js](https://nodejs.org/) (version 14.x or higher) installed.
2.  **Clone the server repository:**
    ```bash
    git clone https://github.com/mikhama/async-race-api.git
    ```
3.  **Enter to the server directory:**
    ```bash
    cd async-race-api
    ```
4.  **Install the server dependencies:**
    ```bash
    npm install
    ```
5.  **Start the server:**
    ```bash
    npm start
    ```
    The server will be available at `http://127.0.0.1:3000`. Leave it running in a separate terminal.

### Accessing the application

- **Local Development:** to run in development mode (after cloning the private repository and installing dependencies), use the command `npm run dev`. The application will interact with the locally running server.

## Project goals

- **Creating SPA:** develop a fully-fledged single-page application (SPA) with multiple screens ("Garage" and "Winners").
- **Working with asynchronicity** deepen understanding and practice using the `fetch` API, Promises, and `async/await` for interacting with the server's REST API.
- **DOM manipulation and rendering:** dynamically generate and update the entire user interface using TypeScript and standard DOM APIs.
- **Implementing animations:** create smooth and responsive animations of car movement using `requestAnimationFrame`, synchronized with server responses (engine start/stop, driving mode).
- **Adhering to strict standards** write clean, maintainable code in TypeScript.
- **Modular architecture:** build the application with a clear separation of concerns between modules.

## Technologies

- TypeScript
- SCSS (Sass)
- CSS Modules
- Webpack
- Fetch API

The application is written using a modular architecture achieved through object-oriented programming (OOP).

## Functionality

### General

- **Two views:** "Garage" for managing cars and "Winners" for viewing winner statistics.
- **State persistence:** page numbers and data in input fields are preserved when switching between screens.
- **Information display:** each view displays its name, the current page number, and the total count of records in the database (cars or winners).

### Garage

- **Car management (CRUD):**
  - Create new cars specifying a name and color.
  - Update the name and color of existing cars.
  - Delete cars from the garage (this also removes the car from the winners list).
  - Display the list of cars with their image in the selected color, name, and control buttons (Select, Remove, Start, Stop).
- **Color selection:** interactive palette for selecting the car's color.
- **Pagination:** display the list of cars across pages.
- **Car generation:** Button to automatically generate 100 random cars (random two-part names and random colors).
- **Engine control:**
  - 'A'(Start) / 'B'(Stop) buttons for each car.
  - Car movement animation upon successful engine start.
  - Animation stops if the engine breaks down (500 error from the API).
  - Return the car to the starting position when 'B' is pressed.
  - Disabling/Enabling of 'A'/'B' buttons depending on the car's current state.
- **Race:**
  - 'Race' button to start the race for all cars on the current page.
  - 'Reset' button to return all cars to their starting positions and reset the race state.
  - Display a message with the winner's name and time after the race finishes.

### Winners

- **Winners table:** displays a list of cars that have won a race at least once.
- **Data in the table:** row number, car image, name, number of wins, best time.
- **Statistics update:** if the same car wins again, its win count increases, and the best time is updated only if the new time is less than the previous one.
- **Pagination:** displays the list of winners across pages.
- **Sorting:** ability to sort the table by the number of wins and by the best time (ascending and descending).
