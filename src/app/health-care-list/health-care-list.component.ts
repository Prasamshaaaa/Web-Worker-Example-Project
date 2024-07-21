import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HealthCareData } from '../Models/health-care-class';

@Component({
  selector: 'app-health-care-list',
  templateUrl: './health-care-list.component.html',
  styleUrls: ['./health-care-list.component.css']
})
export class HealthCareListComponent implements OnInit, OnDestroy {

  /**
   *  @summary - Dataset to hold healthcare data 
   
  */

  Dataset: HealthCareData[] = [];

  private Worker!: Worker;
  private ExcelExportWorker!: Worker;

  isModalOpen: boolean = false;
  columnName: string = '';
  columnValue: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.InitializeWorkers();
    this.LoadDataset();
  }

  ngOnDestroy(): void {
    // Clean up workers when component is destroyed
    if (this.Worker) {
      this.Worker.terminate();
    }
    if (this.ExcelExportWorker) {
      this.ExcelExportWorker.terminate();
    }
  }

  InitializeWorkers() {
    /**
     *  @summary - Initialize ExcelExportWorker for exporting data to Excel
     *  */

    this.ExcelExportWorker = new Worker(new URL('../excel-export.worker', import.meta.url));

    /** @summary Listen for messages from the ExcelExportWorker */
    this.ExcelExportWorker.onmessage = ({ data }: MessageEvent) => {
      if (data.type === 'excelExported') {
        const { excelBuffer, fileName } = data.payload;
        this.saveExcelFile(excelBuffer, fileName);
      }
    };

    this.ExcelExportWorker.onerror = (error) => {
      console.error('Error in ExcelExportWorker:', error);
    };
  }

  LoadDataset() {
    /** @summary Initialize Worker for loading data */
    this.Worker = new Worker(new URL('../health-care-list.worker', import.meta.url));

    const csvUrl = 'assets/healthcare_dataset.csv';
    this.Worker.postMessage(csvUrl); // Sending CSV URL to worker for processing

    // Listen for messages from the Worker
    this.Worker.onmessage = ({ data }: MessageEvent) => {
      if (data.type === 'csvData') {
        this.Dataset = data.payload; // Update the dataset with fetched data
      } else if (data.type === 'error') {
        console.error('Error fetching or parsing CSV:', data.payload);
      } else {
        console.warn('Unexpected message received from healthcare-list worker:', data);
      }
    };
  }

  OpenAddColumnDialog() {
    this.isModalOpen = true;
  }

  /** @summary Function to confirm and add a new column to the dataset */
  ConfirmAdd() {
    if (this.columnName && this.columnValue) {
      // Adding new column to dataset
      this.Dataset.forEach(row => {
        row[this.columnName] = this.columnValue;
      });
      // Clearing inputs and close modal
      this.columnName = '';
      this.columnValue = '';
      this.isModalOpen = false;
    }
  }


  ExportToExcel() {
    const fileName = `healthcare_data_${new Date().toLocaleDateString()}.xlsx`;
    if (this.ExcelExportWorker) {
      this.ExcelExportWorker.postMessage({ type: 'exportToExcel', dataset: this.Dataset, fileName });
    } else {
      console.error('ExcelExportWorker is not initialized.');
    }
  }


  /**
   * @summary Function to save the exported Excel file to the client's system
   * @param buffer - The buffer containing the Excel file data
   * @param fileName - The name of the file to save
   */
  private saveExcelFile(buffer: any, fileName: string) {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    const url: string = window.URL.createObjectURL(data);
    const anchor: HTMLAnchorElement = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
    anchor.remove();
  }
}
