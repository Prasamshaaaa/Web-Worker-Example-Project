/// <reference lib="webworker" />
import * as XLSX from 'xlsx';

addEventListener('message', ({ data }) => {
    switch (data.type) {
        case 'exportToExcel': {
            const { dataset, fileName } = data;
            const excelBuffer = exportToExcel(dataset);
            postMessage({ type: 'excelExported', payload: { excelBuffer, fileName } });
            break;
        }
        default:
            console.error('Unknown message type received in Excel export worker:', data);
    }
});

function exportToExcel(dataset: any[]): any {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataset);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Healthcare Data');
    return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
}
