export class HealthCareData {
    Name!: string;
    Age!: number;
    Gender!: string;
    'Blood Type'!: string;
    'Medical Condition'!: string;
    'Date of Admission'!: string;
    Doctor!: string;
    Hospital!: string;
    'Insurance Provider'!: string;
    'Billing Amount'!: number; // Corrected type to number
    'Room Number'!: string;
    'Admission Type'!: string;
    'Discharge Date'!: string;
    Medication!: string;
    'Test Results'!: string;
    [key: string]: string | number; // Index signature allowing other properties to be string or number
}
