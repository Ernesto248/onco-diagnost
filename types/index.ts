/**
 * Types and interfaces for OncoDiag application
 */

// Interface for patient data - dynamic structure for form inputs
export interface PatientData {
  [key: string]: string | number | boolean;
}

// Interface for classification results
export interface ClassificationResult {
  prediction: string;
  confidence: number;
  timestamp: string;
  datasetUsed: string;
  patientData: PatientData;
}

// Interface for dataset information
export interface Dataset {
  name: string;
  path: string;
  size: number;
  uploadDate: string;
  isBalanced: boolean;
}

// Interface for dataset schema (column information)
export interface DatasetSchema {
  columns: string[];
  datasetName: string;
  totalColumns: number;
}

// Interface for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Interface for upload progress
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Interface for balance operation result
export interface BalanceResult {
  originalFile: string;
  balancedFile: string;
  originalRows: number;
  balancedRows: number;
  operation: string;
}
