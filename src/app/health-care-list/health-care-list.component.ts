import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HealthCareData } from '../Models/health-care-class';

@Component({
  selector: 'app-health-care-list',
  templateUrl: './health-care-list.component.html',
  styleUrls: ['./health-care-list.component.css']
})
export class HealthCareListComponent implements OnInit, OnDestroy {

  Dataset: HealthCareData[] = []; // Array to store the entire dataset
  PaginatedDataset: HealthCareData[] = []; // Array to store the dataset for the current page
  TotalPages: number = 1; // Total number of pages for pagination

  private Worker!: Worker; // Worker for handling CSV operations
  private ExcelExportWorker!: Worker; // Worker for handling Excel export

  isModalOpen: boolean = false; // Flag to control modal visibility for adding a column
  columnName: string = ''; // Name of the column to be added
  columnValue: string = ''; // Value for the new column

  Page: number = 1; // Current page number
  ItemsPerPage: number = 50; // Number of items per page
  ChunkSize: number = 1000; // Number of rows per chunk
  CurrentChunk: HealthCareData[] = []; // Current chunk of data
  ChunkIndex: number = 0; // Index of the current chunk
  TotalItems: number = 0; // Total number of items in the dataset

  private isRequestPending: boolean = false; // Flag to prevent multiple simultaneous requests
  private FullDataset: HealthCareData[] = []; // Array to store the complete dataset
  private allDataLoaded: boolean = false; // Flag to check if all data is loaded

  /**
   * @summary - Initializes the component, sets up workers, and loads the dataset.
   */
  ngOnInit(): void {
    this.InitializeWorkers(); // Initialize workers for handling tasks
    this.LoadDataset(); // Load the dataset from the server
  }

  /**
   * @summary - Cleans up resources when the component is destroyed.
   */
  ngOnDestroy(): void {
    if (this.Worker) {
      this.Worker.terminate(); // Terminate the health care worker
    }
    if (this.ExcelExportWorker) {
      this.ExcelExportWorker.terminate(); // Terminate the Excel export worker
    }
  }

  /**
   * Initializes web workers for handling CSV data and Excel export operations.
   */
  InitializeWorkers() {
    // Initialize Excel export worker
    this.ExcelExportWorker = new Worker(new URL('../excel-export.worker', import.meta.url));
    this.ExcelExportWorker.onmessage = ({ data }: MessageEvent) => {
      if (data.type === 'excelExported') {
        const { excelBuffer, fileName } = data.payload;
        this.SaveExcelFile(excelBuffer, fileName); // Save the exported Excel file
      }
    };
    this.ExcelExportWorker.onerror = (error) => {
      console.error('Error in ExcelExportWorker:', error); // Handle errors in the Excel export worker
    };

    // Initialize health care data worker
    this.Worker = new Worker(new URL('../health-care-list.worker', import.meta.url));
    this.Worker.onmessage = ({ data }: MessageEvent) => {
      console.log('Received data from worker:', data);

      if (data.type === 'csvData') {
        this.CurrentChunk = data.payload.chunk; // Update current chunk
        this.TotalItems = data.payload.totalItems; // Update total items count
        console.log('Dataset loaded:', this.CurrentChunk); // Debugging

        this.UpdateTotalPages(); // Update total pages for pagination
        this.UpdatePaginatedData(); // Update data for the current page
      } else if (data.type === 'updatedDataset') {
        this.Dataset = data.payload; // Update dataset with new column
        console.log('Dataset after column addition:', this.Dataset); // Debugging

        this.UpdateTotalPages();
        this.UpdatePaginatedData();
      } else if (data.type === 'error') {
        console.error('Error fetching or parsing CSV:', data.payload); // Handle errors
      }

      this.isRequestPending = false; // Reset request pending flag
    };

    this.Worker.onerror = (error) => {
      console.error('Error in Worker:', error); // Handle errors in the worker
      this.isRequestPending = false; // Reset request pending flag
    };
  }

  /**
   * @summary - Sends a request to the worker to load the dataset from the CSV file.
   */
  LoadDataset() {
    const csvUrl = 'assets/healthcare_dataset.csv'; // URL of the CSV file
    this.Worker.postMessage({
      type: 'loadDataset',
      url: csvUrl,
      chunkSize: this.ChunkSize,
      chunkIndex: this.ChunkIndex
    });
  }

  /**
   * @summary - Opens the dialog for adding a new column to the dataset.
   */
  OpenAddColumnDialog() {
    this.isModalOpen = true; // Set modal visibility to true
  }

  /**
   * @summary - Confirms and adds a new column to the dataset.
   */
  ConfirmAdd() {
    console.log('Dataset before adding column:', this.Dataset); // Debugging

    if (this.columnName && this.columnValue) {
      if (this.Dataset.length === 0) {
        console.error('Dataset is empty. Cannot add column.'); // Handle empty dataset case
        return;
      }
      this.Worker.postMessage({
        type: 'addColumn',
        Dataset: JSON.parse(JSON.stringify(this.Dataset)), // Deep copy of dataset to avoid mutation
        columnName: this.columnName,
        columnValue: this.columnValue
      });
      this.columnName = ''; // Reset column name
      this.columnValue = ''; // Reset column value
      this.isModalOpen = false; // Close modal
    }
  }

  /**
   * @summary - Exports the current chunk of data to an Excel file.
   */
  ExportToExcel() {
    const fileName = `healthcare_data_${new Date().toLocaleDateString()}.xlsx`; // Generate file name
    if (this.ExcelExportWorker) {
      console.log('Dataset before export:', this.Dataset); // Debugging
      if (this.CurrentChunk.length === 0) {
        console.error('Dataset is empty. Cannot export to Excel.'); // Handle empty dataset case
        return;
      }

      this.ExcelExportWorker.postMessage({ type: 'exportToExcel', dataset: this.CurrentChunk, fileName });
    } else {
      console.error('ExcelExportWorker is not initialized.'); // Handle case where worker is not initialized
    }
  }

  /**
   * @summary - Saves the exported Excel file to the user's device.
   * @param {any} buffer - The file buffer.
   * @param {string} fileName - The name of the file.
   */
  private SaveExcelFile(buffer: any, fileName: string) {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    const url: string = window.URL.createObjectURL(data); // Create URL for the Blob
    const anchor: HTMLAnchorElement = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName; // Set file name for download
    anchor.click(); // Trigger download
    window.URL.revokeObjectURL(url); // Clean up URL object
    anchor.remove(); // Remove anchor element
  }

  /**
   *  @summary - Changes the current page and loads the appropriate dataset chunk.
   * @param {number} newPage - The new page number.
   */
  ChangePage(newPage: number) {
    if (newPage > 0 && newPage <= this.TotalPages && !this.isRequestPending) {
      const requiredChunkIndex = Math.floor((newPage - 1) * this.ItemsPerPage / this.ChunkSize);

      if (requiredChunkIndex !== this.ChunkIndex) {
        this.ChunkIndex = requiredChunkIndex; // Update chunk index
        this.Page = newPage; // Update page number
        this.LoadDataset(); // Load new dataset chunk
      } else {
        this.Page = newPage; // Update page number
        this.UpdatePaginatedData(); // Update paginated data
      }
    }
  }

  /**
   *  @summary - Updates the total number of pages based on the total number of items and items per page.
   */
  private UpdateTotalPages() {
    this.TotalPages = Math.ceil(this.TotalItems / this.ItemsPerPage); // Calculate total pages
  }

  /**
   * @summary - Updates the data for the current page based on pagination settings.
   */
  UpdatePaginatedData() {
    if (!this.isRequestPending) {
      this.isRequestPending = true; // Set request pending flag
      const startIndex = (this.Page - 1) * this.ItemsPerPage % this.ChunkSize; // Calculate start index for pagination
      const endIndex = startIndex + this.ItemsPerPage; // Calculate end index for pagination
      this.PaginatedDataset = this.CurrentChunk.slice(startIndex, endIndex); // Get paginated data
      this.isRequestPending = false; // Reset request pending flag
    }
  }

}
