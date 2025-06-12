/**
 * Utility functions for OncoDiag application
 */

import { Dataset } from "@/types";

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format date to localized string
 */
export function formatDate(
  dateString: string,
  locale: string = "es-ES"
): string {
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Validate CSV file
 */
export function validateCSVFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  // Check file extension
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return { isValid: false, error: "Solo se permiten archivos CSV" };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: "El archivo debe ser menor a 10MB" };
  }

  // Check if file is empty
  if (file.size === 0) {
    return { isValid: false, error: "El archivo está vacío" };
  }

  return { isValid: true };
}

/**
 * Parse CSV content to validate structure
 */
export function validateCSVContent(content: string): {
  isValid: boolean;
  error?: string;
} {
  const lines = content.trim().split("\n");

  if (lines.length < 2) {
    return {
      isValid: false,
      error: "El CSV debe contener al menos headers y una fila de datos",
    };
  }

  const headers = lines[0].split(",");

  if (headers.length < 2) {
    return {
      isValid: false,
      error: "El CSV debe contener al menos 2 columnas",
    };
  }

  // Check for empty headers
  if (headers.some((header) => header.trim() === "")) {
    return {
      isValid: false,
      error: "Todos los headers deben tener nombres válidos",
    };
  }

  return { isValid: true };
}

/**
 * Generate unique filename to avoid conflicts
 */
export function generateUniqueFilename(
  originalName: string,
  existingFiles: string[]
): string {
  const baseName = originalName.replace(".csv", "");
  let fileName = originalName;
  let counter = 1;

  while (existingFiles.includes(fileName)) {
    fileName = `${baseName}_${counter}.csv`;
    counter++;
  }

  return fileName;
}

/**
 * Determine input type based on field name heuristics
 */
export function getInputTypeForField(fieldName: string): {
  type: string;
  placeholder: string;
} {
  const lowerFieldName = fieldName.toLowerCase();

  if (lowerFieldName.includes("age") || lowerFieldName.includes("edad")) {
    return { type: "number", placeholder: "Edad (años)" };
  }

  if (lowerFieldName.includes("size") || lowerFieldName.includes("tamaño")) {
    return { type: "number", placeholder: "Tamaño (cm)" };
  }

  if (lowerFieldName.includes("weight") || lowerFieldName.includes("peso")) {
    return { type: "number", placeholder: "Peso (kg)" };
  }

  if (lowerFieldName.includes("height") || lowerFieldName.includes("altura")) {
    return { type: "number", placeholder: "Altura (cm)" };
  }

  if (lowerFieldName.includes("grade") || lowerFieldName.includes("grado")) {
    return { type: "number", placeholder: "Grado (1-4)" };
  }

  if (lowerFieldName.includes("stage") || lowerFieldName.includes("estadio")) {
    return { type: "number", placeholder: "Estadio (1-4)" };
  }

  if (
    lowerFieldName.includes("temperature") ||
    lowerFieldName.includes("temp")
  ) {
    return { type: "number", placeholder: "Temperatura (°C)" };
  }

  if (
    lowerFieldName.includes("pressure") ||
    lowerFieldName.includes("presion")
  ) {
    return { type: "number", placeholder: "Presión (mmHg)" };
  }

  return { type: "text", placeholder: `Ingresa ${fieldName}` };
}

/**
 * Convert form data to appropriate types
 */
export function processFormData(data: { [key: string]: string }): {
  [key: string]: string | number;
} {
  const processed: { [key: string]: string | number } = {};

  Object.keys(data).forEach((key) => {
    const value = data[key].toString().trim();

    // Try to convert to number if possible
    const numValue = Number(value);
    if (!isNaN(numValue) && value !== "") {
      processed[key] = numValue;
    } else {
      processed[key] = value;
    }
  });

  return processed;
}

/**
 * Get confidence level description
 */
export function getConfidenceDescription(confidence: number): {
  level: "high" | "medium" | "low";
  description: string;
  color: string;
} {
  if (confidence > 0.8) {
    return {
      level: "high",
      description: "Alta confianza",
      color: "text-green-600",
    };
  } else if (confidence > 0.6) {
    return {
      level: "medium",
      description: "Confianza moderada",
      color: "text-yellow-600",
    };
  } else {
    return {
      level: "low",
      description: "Baja confianza - Se recomienda revisión adicional",
      color: "text-red-600",
    };
  }
}

/**
 * Filter datasets by type
 */
export function filterDatasets(
  datasets: Dataset[],
  type: "original" | "balanced" | "all" = "all"
): Dataset[] {
  switch (type) {
    case "original":
      return datasets.filter((dataset) => !dataset.isBalanced);
    case "balanced":
      return datasets.filter((dataset) => dataset.isBalanced);
    case "all":
    default:
      return datasets;
  }
}

/**
 * Sort datasets by different criteria
 */
export function sortDatasets(
  datasets: Dataset[],
  sortBy: "name" | "date" | "size" = "date",
  order: "asc" | "desc" = "desc"
): Dataset[] {
  return [...datasets].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "date":
        comparison =
          new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        break;
      case "size":
        comparison = a.size - b.size;
        break;
    }

    return order === "asc" ? comparison : -comparison;
  });
}
