import { HealthCareData } from "./Models/health-care-class";

addEventListener('message', ({ data }) => {
  if (typeof data === 'string') {
    /**
   * @summary Handle CSV data fetching and parsing
   * @param data - URL of the CSV file to be fetched and parsed
   */
    FetchCsvData(data)
      .then(parsedData => postMessage({ type: 'csvData', payload: parsedData }))
      .catch(error => postMessage({ type: 'error', payload: 'Failed to fetch or parse CSV' }));
  } else if (data.dataset && data.columnName && data.columnValue !== undefined) {
    // Handle adding new column to dataset
    const updatedDataset = AddNewColumn(data.dataset, data.columnName, data.columnValue);
    postMessage({ type: 'updatedDataset', payload: updatedDataset });
  }
});


/**
 * @summary Fetch and parse CSV data from a given URL
 * @param csvUrl - URL of the CSV file to be fetched
 * @returns Promise<HealthCareData[]> - Parsed healthcare data from the CSV file
 *  This function performs an HTTP request to fetch CSV data from the provided URL.
 * It then processes the CSV data to convert it into an array of HealthCareData objects.
 * If the request or processing fails, it throws an error.
 * If successful, it returns the parsed healthcare data as a promise, which can be used by the calling function to handle the data.
 */
function FetchCsvData(csvUrl: string): Promise<HealthCareData[]> {
  return fetch(csvUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch CSV');
      }
      return response.text();
    })
    .then(csvData => {
      const rows = csvData.split('\n');
      const headers = rows[0].split(',').map(header => header.trim());

      return rows.slice(1).map(row => {
        const values = row.split(',').map(value => value.trim());
        const rowData: HealthCareData = {
          Name: "",
          Age: 0,
          Gender: "",
          "Blood Type": "",
          "Medical Condition": "",
          "Date of Admission": "",
          Doctor: "",
          Hospital: "",
          "Insurance Provider": "",
          "Billing Amount": 0,
          "Room Number": "",
          "Admission Type": "",
          "Discharge Date": "",
          Medication: "",
          "Test Results": ""
        };
        headers.forEach((header, index) => {
          rowData[header] = values[index];
        });
        return rowData;
      });
    });
}

/**
 * @summary Adds a new column with a specified value to each row in the dataset.
 * @param {HealthCareData[]} dataset - The array of healthcare data objects to which the new column will be added.
 * @param {string} columnName - The name of the new column to add.
 * @param {any} columnValue - The value to set for the new column in each row.
 * @returns {HealthCareData[]} - A new array of healthcare data objects with the added column in each row.
 */
function AddNewColumn(dataset: HealthCareData[], columnName: string, columnValue: any): HealthCareData[] {
  return dataset.map(row => {
    const newRow = { ...row }; // Clone the original row
    newRow[columnName] = columnValue;
    return newRow;
  });
}
