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
  modelInfo?: {
    trainedAt: string;
    accuracy: string;
    features: number;
    classes: number;
    architecture: string;
    allPredictions?: Array<{
      class: string;
      probability: number;
    }>;
  };
}

// Interface for dataset information
export interface Dataset {
  id: number;
  name: string;
  path: string;
  size: number;
  uploadDate: string;
  isBalanced: boolean;
  rows?: number;
  features?: number;
  minority_class?: string;
  minority_count?: number;
  majority_count?: number;
  imbalance_ratio?: number;
  created_at?: string;
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

// Interface for training configuration
export interface TrainingConfig {
  datasetName: string;
  targetColumn: string;
  epochs: number;
  learningRate: number;
  batchSize: number;
  validationSplit?: number;
}

// Interface for training progress
export interface TrainingProgress {
  epoch: number;
  totalEpochs: number;
  loss: number;
  accuracy?: number;
  valLoss?: number;
  valAccuracy?: number;
  status: "training" | "completed" | "error";
  message?: string;
}

// Interface for training result
export interface TrainingResult {
  modelPath: string;
  modelMetadata: ModelMetadata;
  finalMetrics: {
    loss: number;
    accuracy?: number;
    valLoss?: number;
    valAccuracy?: number;
  };
  trainingTime: number;
  timestamp: string;
}

// Interface for model metadata
export interface ModelMetadata {
  datasetName: string;
  targetColumn: string;
  featureColumns: string[];
  classes: string[];
  architecture: {
    inputShape: number;
    hiddenLayers: number[];
    outputShape: number;
  };
  preprocessing: {
    scaler: "minmax" | "standard";
    encoders: Record<string, string[]>;
    featureStats?: Record<
      string,
      {
        min: number;
        max: number;
        mean?: number;
        std?: number;
      }
    >;
  };
  trainingConfig: TrainingConfig;
  timestamp: string;
}

// Interface for trained model info
export interface TrainedModel {
  id: number;
  name: string;
  metadata: ModelMetadata;
  createdAt: string;
  size: number;
  classifier_type?: string;
  balanced_by?: string;
  auc?: number;
  f1_score?: number;
  features?: string[];
  classes?: string[];
}
