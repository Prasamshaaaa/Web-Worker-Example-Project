import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HealthCareData } from '../Models/health-care-class';

@Component({
  selector: 'app-health-care-list',
  templateUrl: './health-care-list.component.html',
  styleUrls: ['./health-care-list.component.css']
})
export class HealthCareListComponent implements OnInit {
  Dataset: HealthCareData[] = []; // Original dataset

  private Worker!: Worker;
  private ExcelExportWorker!: Worker;

  isModalOpen: boolean = false;
  columnName: string = '';
  columnValue: string = '';
  newColumn: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.InitializeWorkers();
    this.LoadDataset();
  }

  InitializeWorkers() {
    // Initialize the worker for other operations if needed

    // Initialize the Excel export worker
    this.ExcelExportWorker = new Worker(new URL('../excel-export.worker', import.meta.url));

    this.ExcelExportWorker.onmessage = ({ data }: MessageEvent) => {
      if (data.type === 'excelExported') {
        const { excelBuffer, fileName } = data.payload;
        this.saveExcelFile(excelBuffer, fileName);
      }
    };
  }

  LoadDataset() {
    this.http.get('assets/healthcare_dataset.csv', { responseType: 'text' }).subscribe(
      data => {
        const rows = data.split('\n');
        const headers = rows[0].split(',').map(header => header.trim());
        this.Dataset = rows.slice(1).map(row => {
          const values = row.split(',').map(value => value.trim());
          const rowData: HealthCareData = {
            Name: '',
            Age: 0,
            Gender: '',
            'Blood Type': '',
            'Medical Condition': '',
            'Date of Admission': '',
            Doctor: '',
            Hospital: '',
            'Insurance Provider': '',
            'Billing Amount': 0,
            'Room Number': '',
            'Admission Type': '',
            'Discharge Date': '',
            Medication: '',
            'Test Results': ''
          };
          headers.forEach((header, index) => {
            rowData[header] = values[index];
          });
          return rowData;
        });
      },
      error => {
        console.error('Error loading CSV:', error);
      }
    );
  }


  OpenAddColumnDialog() {
    this.isModalOpen = true;
  }

  ConfirmAdd() {
    if (this.columnName && this.columnValue) {
      // Adding new column to dataset
      this.Dataset.forEach(row => {
        row[this.columnName] = this.columnValue;
      });
      // Sending message to the Excel export worker
      this.ExcelExportWorker.postMessage({ type: 'exportToExcel', dataset: this.Dataset });
      // Clearing inputs and close modal
      this.columnName = '';
      this.columnValue = '';
      this.isModalOpen = false;
    }
  }

  ExportToExcel() {
    const fileName = `healthcare_data_${new Date().toLocaleDateString()}.xlsx`;
    this.ExcelExportWorker.postMessage({ type: 'exportToExcel', dataset: this.Dataset, fileName });
  }

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
