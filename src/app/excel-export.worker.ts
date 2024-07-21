/// <reference lib="webworker" />
import * as XLSX from 'xlsx';

addEventListener('message', ({ data }) => {
    switch (data.type) {
        case 'exportToExcel': {
            /**
            * @summary Handle exporting dataset to Excel
            * @param {Object} data - The data sent from the main thread
            * @param {any[]} data.dataset - The dataset to export to Excel
            * @param {string} data.fileName - The name of the Excel file to be generated
            */
            const { dataset, fileName } = data;
            const excelBuffer = exportToExcel(dataset);
            postMessage({ type: 'excelExported', payload: { excelBuffer, fileName } });
            break;
        }
        default:
            console.error('Unknown message type received in Excel export worker:', data);
    }
});

/**
 * @summary Export dataset to an Excel file buffer
 * @param {any[]} dataset - The dataset to export
 * @returns {any} - The buffer containing the Excel file data
 */
function exportToExcel(dataset: any[]): any {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataset);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Healthcare Data');
    return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
}
