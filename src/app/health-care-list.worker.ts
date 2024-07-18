import { HealthCareData } from "./Models/health-care-class";

addEventListener('message', ({ data }) => {
  if (typeof data === 'string') {

    const csvData = data;
    const rows = csvData.split('\n');
    const headers = rows[0].split(',').map((header: string) => header.trim());

    const result = rows.slice(1).map((row: string) => {
      const values = row.split(',').map((value: string) => value.trim());
      const obj = headers.reduce((acc: { [key: string]: string }, header: string, index: number) => {
        acc[header] = values[index];
        return acc;
      }, {});
      return obj;
    });

    postMessage({ result, headers });
  }
  else if (data.dataset && data.columnName && data.columnValue) {
    console.log('Adding column:', data.columnName, 'with value:', data.columnValue); // Log column addition

    // Adding a new column
    const updatedDataset = data.dataset.map((row: HealthCareData) => {
      row[data.columnName] = data.columnValue; // Add the new column with the specified value
      return row;
    });

    postMessage({ result: updatedDataset });
  }
});

