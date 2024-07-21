# MyProject

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.11.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Table of Contents

- Overview
- Features
- Installation
- Usage
- Code Snippets
  - HealthCareListComponent
  - HealthCareList Worker
  - ExcelExport Worker

## Overview

This project is built using Angular and utilizes web workers to handle CPU-intensive tasks such as fetching and parsing CSV data, adding new columns to datasets, and exporting data to Excel files.

## Features

- Fetch and parse healthcare data from CSV files.
- Add new columns to the dataset.
- Export data to Excel files.
- Efficient background processing using web workers.


## Installation

### Prerequisites

- Node.js and npm installed.
- Angular CLI installed globally.

### Steps

1. Clone the repository:
   
    git clone https://github.com/Prasamshaaaa/Web-Worker-Example-Project.git
   

2. Install dependencies:

    npm install


3. Serve the application:
    ng serve

4. Open your browser and navigate to 'http://localhost:4200'.
   


 ## Usage

### CSV Data Fetching and Parsing

The worker responsible for fetching and parsing CSV data is defined in the file `src/app/health-care-list.worker.ts`.

### Adding New Columns

Columns can be added to the dataset using the HealthCareListComponent.

### Exporting to Excel

Data can be exported to Excel using the `excel-export.worker.ts`.
