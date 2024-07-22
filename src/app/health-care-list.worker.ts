import { HealthCareData } from "./Models/health-care-class";

let Dataset: HealthCareData[] = []; // Array to store healthcare data loaded from CSV
let ItemsPerPage: number = 50; // Number of items to show per page
let CurrentPage: number = 1; // Current page number for pagination
const ChunkSize = 1000; // Number of rows to load per chunk
let isDataLoaded = false; // Flag to check if all data is loaded
let totalItems = 0; // Track total number of items in the dataset

interface ColumnDetails {
  columnName: string;
  columnValue: any;
}

let columnToAdd: ColumnDetails | null = null; // Object to store column details if a column needs to be added

addEventListener('message', ({ data }: MessageEvent) => {
  console.log('Worker received:', data);

  switch (data.type) {
    case 'loadDataset':
      loadDataset(data.url, data.chunkSize, data.chunkIndex);
      break;
    case 'addColumn':
      addColumn(data.columnName, data.columnValue);
      break;
    case 'paginate':
      paginate(data.itemsPerPage, data.page);
      break;
    default:
      console.error('Unknown message type:', data.type);
  }
});

/**
 * @summary Load a chunk of the dataset from a CSV file.
 * @param csvUrl - URL of the CSV file.
 * @param chunkSize - Number of rows to load per chunk.
 * @param chunkIndex - Index of the chunk to load.
 * @returns Promise<void>
 */
async function loadDataset(csvUrl: string, chunkSize: number, chunkIndex: number): Promise<void> {
  try {
    let { chunk, totalItems: chunkTotal } = await fetchCsvData(csvUrl, chunkSize, chunkIndex);

    if (columnToAdd) {
      const modifiedChunk = addNewColumn(chunk, columnToAdd.columnName, columnToAdd.columnValue);
      chunk = modifiedChunk;
    }

    Dataset = [...Dataset, ...chunk]; // Append the new chunk to the existing dataset
    totalItems = chunkTotal; // Update totalItems with the total number of items from the chunk

    console.log('Dataset after chunk loading:', Dataset);

    // If this is the last chunk, update the flag
    if (Dataset.length >= totalItems) {
      isDataLoaded = true;
    }

    postMessage({ type: 'csvData', payload: { chunk, totalItems: totalItems } });
  } catch (error) {
    console.error('Error fetching or parsing CSV:', error);
    postMessage({ type: 'error', payload: 'Failed to fetch or parse CSV' });
  }
}

/**
 * @summary Add a new column to the dataset.
 * @param columnName - Name of the new column.
 * @param columnValue - Value to assign to the new column.
 */
function addColumn(columnName: string, columnValue: any): void {
  columnToAdd = { columnName, columnValue };

  console.log('Dataset before adding column:', Dataset);
  Dataset = addNewColumn(Dataset, columnName, columnValue);
  console.log('Dataset after adding column:', Dataset);

  if (isDataLoaded) {
    postMessage({ type: 'updatedDataset', payload: { chunk: getPaginatedData(), totalItems: Dataset.length } });
  } else {
    postMessage({ type: 'pendingDataset', payload: 'Column will be added to future chunks.' });
  }
}

/**
 * @summary Paginate the dataset.
 * @param itemsPerPage - Number of items to show per page.
 * @param page - Page number to show.
 */
function paginate(itemsPerPage: number, page: number): void {
  ItemsPerPage = itemsPerPage || ItemsPerPage;
  CurrentPage = page || CurrentPage;
  console.log('Paginated dataset:', getPaginatedData());
  postMessage({ type: 'csvData', payload: getPaginatedData() }); // Send paginated data back to the main thread
}

/**
 * @summary Fetch a chunk of CSV data.
 * @param csvUrl - URL of the CSV file.
 * @param chunkSize - Number of rows to load per chunk.
 * @param chunkIndex - Index of the chunk to load.
 * @returns Object containing the chunk of data and total number of items.
 */
async function fetchCsvData(csvUrl: string, chunkSize: number, chunkIndex: number): Promise<{ chunk: HealthCareData[], totalItems: number }> {
  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch CSV');
  }
  const csvData = await response.text(); // Get response text
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
}

/**
 * @summary Add a new column to each row in the dataset.
 * @param dataset - Array of healthcare data.
 * @param columnName - Name of the new column.
 * @param columnValue - Value to assign to the new column.
 * @returns Modified dataset with the new column added.
 */
function addNewColumn(dataset: HealthCareData[], columnName: string, columnValue: any): HealthCareData[] {
  return dataset.map(row => {
    const newRow = { ...row };
    newRow[columnName] = columnValue;
    return newRow;
  });
}

/**
 * @summary Get the paginated data based on the current page and items per page.
 * @returns Array of healthcare data for the current page.
 */
function getPaginatedData(): HealthCareData[] {
  const startIndex = (CurrentPage - 1) * ItemsPerPage;
  const endIndex = startIndex + ItemsPerPage;
  return Dataset.slice(startIndex, endIndex);
}
