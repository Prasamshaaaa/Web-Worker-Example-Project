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


 
HealthCare Data Management Application
This project is a healthcare data management application built using Angular and TypeScript. It allows users to load, manipulate, and export healthcare data from a CSV file. The application includes features like adding new columns, paginating data, and exporting the dataset to an Excel file.

## Table of Contents
      Features
      Technologies
      Setup and Installation
      Usage
      Project Structure
      License


## Features
      1. Load Dataset: Load large datasets from a CSV file in chunks.
      2. Add Columns: Add new columns to the dataset dynamically.
      3. Pagination: Navigate through the dataset using pagination controls.
      4. Export to Excel: Export the current chunk of the dataset to an Excel file.      
      
## Technologies
    Angular
    TypeScript
    Web Workers
    HTML
    CSS

    
# Setup and Installation
Follow these steps to set up and run the project locally.

## Prerequisites
   1. Node.js (v12 or higher)
   2. Angular CLI (v10 or higher)


## Technologies
Angular
TypeScript
Web Workers
HTML
CSS

## Installation 
1. Clone the repository:
     git clone https://github.com/Prasamshaaaa/Web-Worker-Example-Project.git
2. Install dependencies:
     npm install
3. Start the development server:
   ng serve
4. Open your browser and navigate to http://localhost:4200.

# Usage
## Loading Dataset
The dataset is automatically loaded from a CSV file located at assets/healthcare_dataset.csv.
Data is loaded in chunks of 1000 rows by default.
## Adding a Column
Click on the "Add Column" button to open the modal dialog.
Enter the column name and value, then click "Add" to add the new column to the dataset.
## Pagination
Use the "Previous" and "Next" buttons to navigate through the pages of the dataset.
## Exporting to Excel
Click on the "Export to Excel" button to download the current chunk of data as an Excel file.
   
