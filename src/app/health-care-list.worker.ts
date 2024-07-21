import { HealthCareData } from "./Models/health-care-class";

let Dataset: HealthCareData[] = []; // Array to store healthcare data loaded from CSV
let ItemsPerPage: number = 50; // Number of items to show per page
let CurrentPage: number = 1; // Current page number for pagination
const ChunkSize = 1000; // Number of rows to load per chunk
let isDataLoaded = false; // Flag to check if all data is loaded
let totalItems = 0; // Track total number of items in the dataset

addEventListener('message', ({ data }: MessageEvent) => {
  console.log('Worker received:', data);

  if (data.type === 'loadDataset') {
    /**
     * Loads a chunk of the dataset from a CSV file.
     * @param {string} data.url - The URL of the CSV file.
     * @param {number} data.chunkSize - Number of rows in each chunk.
     * @param {number} data.chunkIndex - Index of the current chunk.
     */
    FetchCsvData(data.url, data.chunkSize, data.chunkIndex)
      .then(({ chunk, totalItems: chunkTotal }) => {
        Dataset = [...Dataset, ...chunk]; // Append the new chunk to the existing dataset
        totalItems = chunkTotal; // Update totalItems with the total number of items from the chunk

        console.log('Dataset after chunk loading:', Dataset);

        // If this is the last chunk, update the flag
        if (Dataset.length >= totalItems) {
          isDataLoaded = true;
        }

        postMessage({ type: 'csvData', payload: { chunk, totalItems: totalItems } });
      })
      .catch(error => {
        console.error('Error fetching or parsing CSV:', error);
        postMessage({ type: 'error', payload: 'Failed to fetch or parse CSV' });
      });
  } else if (data.type === 'addColumn') {
    /**
     * Adds a new column to the dataset.
     * @param {string} data.columnName - The name of the new column.
     * @param {any} data.columnValue - The value to be set for the new column.
     */
    if (!isDataLoaded) {
      console.log('Dataset is not fully loaded. Cannot add column.');
      postMessage({ type: 'error', payload: 'Dataset is not fully loaded.' });
      return;
    }

    console.log('Dataset before adding column:', Dataset);
    Dataset = AddNewColumn(Dataset, data.columnName, data.columnValue);
    console.log('Dataset after adding column:', Dataset);
    postMessage({ type: 'updatedDataset', payload: { chunk: GetPaginatedData(), totalItems: Dataset.length } });
  } else if (data.type === 'paginate') {
    /**
     * Handles pagination of the dataset.
     * @param {number} data.itemsPerPage - Number of items per page.
     * @param {number} data.page - The page number to display.
     */
    ItemsPerPage = data.itemsPerPage || ItemsPerPage;
    CurrentPage = data.page || CurrentPage;
    console.log('Paginated dataset:', GetPaginatedData());
    postMessage({ type: 'csvData', payload: GetPaginatedData() }); // Send paginated data back to the main thread
  }
});

/**
 * Fetches and parses a chunk of CSV data from the server.
 * @param {string} csvUrl - The URL of the CSV file.
 * @param {number} chunkSize - Number of rows per chunk.
 * @param {number} chunkIndex - Index of the chunk to fetch.
 * @returns {Promise<{ chunk: HealthCareData[], totalItems: number }>} - A promise that resolves with the chunk of data and total number of items.
 */
function FetchCsvData(csvUrl: string, chunkSize: number, chunkIndex: number): Promise<{ chunk: HealthCareData[], totalItems: number }> {
  return fetch(csvUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch CSV');
      }
      return response.text(); // Get response text
    })
    .then(csvData => {
      const rows = csvData.split('\n'); // Split CSV data into rows
      const headers = rows[0].split(',').map(header => header.trim()); // Get headers

      const startIndex = chunkIndex * chunkSize + 1;
      const endIndex = startIndex + chunkSize;

      const chunk = rows.slice(startIndex, endIndex).map(row => {
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

      return { chunk, totalItems: rows.length - 1 };
    });
}

/**
 * Adds a new column to each row in the dataset.
 * @param {HealthCareData[]} dataset - The dataset to be updated.
 * @param {string} columnName - The name of the new column.
 * @param {any} columnValue - The value to set for the new column.
 * @returns {HealthCareData[]} - The dataset with the new column added.
 */
function AddNewColumn(dataset: HealthCareData[], columnName: string, columnValue: any): HealthCareData[] {
  return dataset.map(row => {
    const newRow = { ...row };
    newRow[columnName] = columnValue;
    return newRow;
  });
}

/**
 * Retrieves a paginated subset of the dataset.
 * @returns {HealthCareData[]} - The subset of data for the current page.
 */
function GetPaginatedData(): HealthCareData[] {
  const startIndex = (CurrentPage - 1) * ItemsPerPage;
  const endIndex = startIndex + ItemsPerPage;
  return Dataset.slice(startIndex, endIndex);
}
