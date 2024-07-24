import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HealthCareData } from '../Models/health-care-class';
import jspreadsheet from 'jspreadsheet';
import 'jspreadsheet/dist/jspreadsheet.css';
import 'jsuites/dist/jsuites.css';
import parser from "@jspreadsheet/parser";



@Component({
  selector: 'app-health-care-list',
  templateUrl: './health-care-list.component.html',
  styleUrls: ['./health-care-list.component.css']


})
export class HealthCareListComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild("spreadsheet") spreadsheet!: ElementRef; // Reference to the JSpreadsheet container
  @ViewChild("log") log!: ElementRef; // Reference to the textarea for logging data
  @ViewChild("file") file!: ElementRef;

  Worksheets!: jspreadsheet.worksheetInstance[];


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
  IsFileOpened: boolean = false;

  ngOnInit(): void {
    this.InitializeWorkers(); // Initialize workers for handling tasks
    this.LoadDataset(); // Load the dataset from the server
  }

  ngAfterViewInit(): void {
    jspreadsheet.setLicense('ZjBhZGVhOWRlYzQwYzE0NzVmY2E3NWUzMGE2YTI4YmZmZGRiOWU1MWRiZmI4ZjllMzE4M2VjMDc4YTAwZjVlMzYxNWQ0YmExZTU3YjBiNmUzNGZhZTMwMTY0NTAzYzRhMzJhYzYwZTIzMGIyYTRhMTQ2YTQ4MTY5ZGMxZWY4MDYsZXlKamJHbGxiblJKWkNJNklqTTFObUV4T1RKaU56a3hNMkl3TkdNMU5EVTNOR1F4T0dNeU9HUTBObVUyTXprMU5ESTRZV0lpTENKdVlXMWxJam9pU25Od2NtVmhaSE5vWldWMElpd2laR0YwWlNJNk1UYzBOVGsyTnpZd01Dd2laRzl0WVdsdUlqcGJJbXB6YUdWc2JDNXVaWFFpTENKamMySXVZWEJ3SWl3aWFuTndjbVZoWkhOb1pXVjBMbU52YlNJc0luVmxMbU52YlM1aWNpSXNJbU5rY0c0dWFXOGlMQ0pwYm5SeVlYTm9aV1YwY3k1amIyMGlMQ0pxYzNCeVpXRmtjMmhsWlhRdFpHVjJMV1ZrTG1SbGRtVnNiM0F1YkdsbmFIUnVhVzVuTG1admNtTmxMbU52YlNJc0luTjBZV05yWW14cGRIb3VZMjl0SWl3aWQyVmlZMjl1ZEdGcGJtVnlMbWx2SWl3aWMyaGxaWFJ6TG5ObVkyOWtaV0p2ZEM1amIyMGlMQ0p6YUdWbGRITmxkUzV6Wm1OdlpHVmliM1F1WTI5dElpd2lkMlZpSWl3aWJHOWpZV3hvYjNOMElsMHNJbkJzWVc0aU9pSXpOQ0lzSW5OamIzQmxJanBiSW5ZM0lpd2lkamdpTENKMk9TSXNJbll4TUNJc0luWXhNU0lzSW1admNtMXpJaXdpWm05eWJYVnNZU0lzSW5KbGJtUmxjaUlzSW5CaGNuTmxjaUlzSW1sdGNHOXlkR1Z5SWl3aWRtRnNhV1JoZEdsdmJuTWlMQ0pqYjIxdFpXNTBjeUlzSW5ObFlYSmphQ0lzSW1Ob1lYSjBjeUlzSW5CeWFXNTBJaXdpWW1GeUlpd2ljMmhsWlhSeklpd2ljMmhoY0dWeklpd2ljMlZ5ZG1WeUlpd2labTl5YldGMElpd2lhVzUwY21GemFHVmxkSE1pWFgwPQ==');
    jspreadsheet.setExtensions({ parser });

    // Initialize the spreadsheet after the view has been initialized
    if (!this.IsFileOpened) {
      this.InitializeSpreadsheet();
    } else {

      let spreadsheet = this.spreadsheet.nativeElement;
      // Add event to the file input
      this.file.nativeElement.onchange = function (e: any) {
        // Parse XLSX file and create a new spreadsheet
        jspreadsheet.parser({
          file: e.target.files[0],
          locale: "en-GB",
          onload: function (config: any) {
            jspreadsheet(spreadsheet, config);
          },
          onerror: function (error: any) {
            alert(error);
          }
        });
      };

    }
  }
  ngOnDestroy(): void {
    if (this.Worker) {
      this.Worker.terminate(); // Terminate the health care worker
    }
    if (this.ExcelExportWorker) {
      this.ExcelExportWorker.terminate(); // Terminate the Excel export worker
    }
  }

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
        this.Dataset = [...this.Dataset, ...this.CurrentChunk]; // Append the new chunk to the Dataset

        this.TotalItems = data.payload.totalItems; // Update total items count
        console.log('Dataset loaded:', this.CurrentChunk); // Debugging

        this.UpdateTotalPages(); // Update total pages for pagination
        this.UpdatePaginatedData(); // Update data for the current page
        this.InitializeSpreadsheet(); // Initialize the spreadsheet with paginated data

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

  LoadDataset() {
    const csvUrl = 'assets/healthcare_dataset.csv'; // URL of the CSV file
    this.Worker.postMessage({
      type: 'loadDataset',
      url: csvUrl,
      chunkSize: this.ChunkSize,
      chunkIndex: this.ChunkIndex
    });
  }



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
        this.InitializeSpreadsheet(); // Reinitialize the spreadsheet with paginated data
      }
    }
  }

  private UpdateTotalPages() {
    this.TotalPages = Math.ceil(this.TotalItems / this.ItemsPerPage); // Calculate total pages
  }

  UpdatePaginatedData() {
    if (!this.isRequestPending) {
      this.isRequestPending = true; // Set request pending flag
      const startIndex = (this.Page - 1) * this.ItemsPerPage % this.ChunkSize; // Calculate start index for pagination
      const endIndex = startIndex + this.ItemsPerPage; // Calculate end index for pagination
      this.PaginatedDataset = this.CurrentChunk.slice(startIndex, endIndex); // Get paginated data
      this.isRequestPending = false; // Reset request pending flag
    }
  }

  InitializeSpreadsheet() {
    const container = this.spreadsheet.nativeElement;


    if (container) {
      const titles = ['Name', 'Age', 'Gender', 'Blood Type', 'Medical Condition', 'Date of Admission', 'Doctor', 'Hospital', 'Insurance Provider', 'Billing Amount', 'Room Number', 'Admission Type', 'Discharge Date', 'Medication', 'Test Results'];

      // COnverting PaginatedDataset to an array of arrays for JSpreadsheet
      const data = [
        titles,
        ...this.PaginatedDataset.map(item => [
          item['Name'] || '',
          item['Age'] || '',
          item['Gender'] || '',
          item['Blood Type'] || '',
          item['Medical Condition'] || '',
          item['Date of Admission'] || '',
          item['Doctor'] || '',
          item['Hospital'] || '',
          item['Insurance Provider'] || '',
          item['Billing Amount'] || '',
          item['Room Number'] || '',
          item['Admission Type'] || '',
          item['Discharge Date'] || '',
          item['Medication'] || '',
          item['Test Results'] || ''
        ])];

      if (this.Worksheets && this.Worksheets.length > 0) {
        // Update existing worksheet data
        this.Worksheets[0].setData(data);
      } else {
        // Initialize new spreadsheet
        this.Worksheets = jspreadsheet(container, {
          tabs: true,
          toolbar: true,

          worksheets: [{
            data: data,  // Data to be populated in the spreadsheet
            minDimensions: [15, 50],
            worksheetName: 'Health Care List',
            defaultColWidth: 124, // Default column width
            columnResize: true,
            allowInsertColumn: true,
            allowManualInsertColumn: true,
            tableOverflow: true,
            tableHeight: 800,

            columns: [
              {
                type: 'text', title: 'Name', width: 100,
                render: "square"
              },
              { type: 'number', title: 'Age' },
              { type: 'text', title: 'Gender' },
              { type: 'text', title: 'Blood Type' },
              { type: 'text', title: 'Medical Condition' },
              { type: 'text', title: 'Date of Admission' },
              { type: 'text', title: 'Doctor' },
              { type: 'text', title: 'Hospital' },
              { type: 'text', title: 'Insurance Provider' },
              { type: 'number', title: 'Billing Amount' },
              { type: 'text', title: 'Room Number' },
              { type: 'text', title: 'Admission Type' },
              { type: 'text', title: 'Discharge Date' },
              { type: 'text', title: 'Medication' },
              { type: 'text', title: 'Test Results' }
            ],
          }],
        });
      }
    } else {
      console.error('Spreadsheet container is not available.'); // Handle case where container is not available
    }
  }

  addLog() {
    this.log.nativeElement.value = JSON.stringify(this.PaginatedDataset);
  }

  InsertColumn(numColumns: number = 1, position: number = -1, insertBefore: boolean = false) {
    const worksheet = this.Worksheets[0];
    if (worksheet) {
      worksheet.insertColumn(numColumns, position, insertBefore);
    }
  }
}
