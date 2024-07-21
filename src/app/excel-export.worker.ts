import * as XLSX from 'xlsx';
import { HealthCareData } from './Models/health-care-class';

// Global variable to hold dataset
let Dataset: HealthCareData[] = [];

/**
 * @summary - Handles messages received from the main thread.
 * @param {MessageEvent} event - The message event containing data sent to the worker.
 */
addEventListener('message', ({ data }: MessageEvent) => {
    if (data.type === 'exportToExcel') {
        // Handles the request to export the dataset to an Excel file.
        const { dataset, fileName } = data;

        if (!dataset || dataset.length === 0) {
            console.error('No dataset provided or dataset is empty.');
            return;
        }

        // Convert dataset to Excel worksheet
        const worksheet = XLSX.utils.json_to_sheet(dataset);
        // Create a new workbook
        const workbook = XLSX.utils.book_new();
        // Append worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        // Write workbook to an array buffer
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        // Sending the Excel file buffer and file name back to the main thread
        postMessage({ type: 'excelExported', payload: { excelBuffer, fileName } });
    } else if (data.type === 'loadDataset') {
        // Handling the request to load the dataset.
        Dataset = data.dataset; // Storing the dataset in the global variable
    }
});
