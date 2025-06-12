/**
 * Application constants and configuration
 */

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [".csv"],
  ALLOWED_MIME_TYPES: ["text/csv", "application/csv"],
} as const;

// Dataset configuration
export const DATASET = {
  BALANCED_SUFFIX: "_balanced",
  MIN_COLUMNS: 2,
  MIN_ROWS: 2, // Headers + at least 1 data row
} as const;

// API endpoints
export const API_ENDPOINTS = {
  DATASETS: "/api/datasets",
  UPLOAD: "/api/upload",
  BALANCE: "/api/balance",
  SCHEMA: "/api/schema",
  CLASSIFY: "/api/classify",
} as const;

// UI constants
export const UI = {
  REDIRECT_DELAY: 2000, // ms
  ANIMATION_DURATION: 300, // ms
  DEBOUNCE_DELAY: 500, // ms
} as const;

// Machine Learning constants
export const ML = {
  MIN_CONFIDENCE_THRESHOLD: 0.5,
  HIGH_CONFIDENCE_THRESHOLD: 0.8,
  MEDIUM_CONFIDENCE_THRESHOLD: 0.6,
} as const;

// Directory paths
export const PATHS = {
  DATASETS: "./datasets",
  UPLOADS: "./uploads",
  TEMP: "./temp",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: "El archivo es demasiado grande. Máximo 10MB.",
  INVALID_FILE_TYPE: "Solo se permiten archivos CSV.",
  EMPTY_FILE: "El archivo está vacío.",
  INVALID_CSV_FORMAT: "Formato CSV inválido.",
  INSUFFICIENT_COLUMNS: "El CSV debe contener al menos 2 columnas.",
  INSUFFICIENT_ROWS: "El CSV debe contener al menos una fila de datos.",
  MISSING_HEADERS: "Faltan headers en el CSV.",
  DUPLICATE_HEADERS: "El CSV contiene headers duplicados.",
  DATASET_NOT_FOUND: "Dataset no encontrado.",
  CLASSIFICATION_FAILED: "Error en la clasificación.",
  MISSING_PATIENT_DATA: "Faltan datos del paciente.",
  INVALID_PATIENT_DATA: "Datos del paciente inválidos.",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: "Archivo subido exitosamente.",
  DATASET_BALANCED: "Dataset balanceado exitosamente.",
  CLASSIFICATION_COMPLETED: "Clasificación completada exitosamente.",
  SCHEMA_LOADED: "Esquema cargado exitosamente.",
} as const;

// Application metadata
export const APP_METADATA = {
  NAME: "OncoDiag",
  DESCRIPTION: "Plataforma de Diagnóstico Asistido de Cáncer",
  VERSION: "1.0.0",
  AUTHOR: "Equipo de Desarrollo",
} as const;

// Navigation items
export const NAVIGATION = [
  {
    name: "Gestión de Datasets",
    href: "/dashboard/datasets",
    description: "Subir y visualizar datasets",
  },
  {
    name: "Balanceo de Datos",
    href: "/dashboard/balance",
    description: "Aplicar algoritmo SMOTE",
  },
  {
    name: "Clasificación",
    href: "/dashboard/classify",
    description: "Clasificar pacientes",
  },
] as const;

// Medical disclaimer
export const MEDICAL_DISCLAIMER =
  "IMPORTANTE: Esta aplicación es una herramienta de apoyo diagnóstico y no debe usarse como único criterio para diagnósticos médicos. Siempre consulte con profesionales médicos cualificados para obtener diagnósticos definitivos.";

// Form validation rules
export const VALIDATION = {
  REQUIRED_FIELD: "Este campo es requerido.",
  INVALID_NUMBER: "Debe ser un número válido.",
  INVALID_EMAIL: "Debe ser un email válido.",
  MIN_LENGTH: (min: number) => `Debe tener al menos ${min} caracteres.`,
  MAX_LENGTH: (max: number) => `No puede exceder ${max} caracteres.`,
  POSITIVE_NUMBER: "Debe ser un número positivo.",
} as const;
