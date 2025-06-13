"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  BoltIcon,
  FolderIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { ProgressBar } from "../components/ProgressBar";

// Asumiendo que estos tipos existen en un archivo "@/types"
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string | object;
}

export interface Dataset {
  name: string;
  size: number;
  lastModified: string;
}

export interface DatasetSchema {
  datasetName: string;
  totalRows: number;
  totalColumns: number;
  columns: string[];
}

// --- Interfaces específicas de esta página ---

interface TrainingConfig {
  datasetName: string;
  targetColumn: string;
  epochs: number;
  learningRate: number;
  batchSize: number;
}

interface TrainingResult {
  modelPath: string;
  finalAccuracy: number;
  finalLoss: number;
  totalEpochs: number;
  trainingTimeMs: number;
  datasetInfo: {
    totalSamples: number;
    features: string[];
    classes: string[];
  };
}

/**
 * Página de Entrenamiento de Modelos
 * Permite a los usuarios entrenar modelos de ML (simulado) con sus datasets.
 */
export default function TrainPage() {
  // --- Estados del Componente ---
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [schema, setSchema] = useState<DatasetSchema | null>(null);
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    datasetName: "",
    targetColumn: "",
    epochs: 50,
    learningRate: 0.001,
    batchSize: 32,
  });

  // Estados de carga y UI
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(true);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(
    null
  );

  const [simulatedProgress, setSimulatedProgress] = useState(0);

  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // --- Carga de Datos ---

  const loadDatasets = useCallback(async () => {
    try {
      setIsLoadingDatasets(true);
      const response = await fetch("/api/datasets");
      const result: ApiResponse<Dataset[]> = await response.json();

      if (result.success && result.data) {
        setDatasets(result.data);
        if (result.data.length === 0) {
          setMessage({
            type: "info",
            text: "No hay datasets disponibles. Sube un dataset primero.",
          });
        }
      } else {
        setMessage({
          type: "error",
          text: result.message || "Error al cargar datasets",
        });
      }
    } catch (_error) {
      setMessage({
        type: "error",
        text: "Error de conexión al cargar datasets",
      });
    } finally {
      setIsLoadingDatasets(false);
    }
  }, []);

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);

  const loadSchema = useCallback(async (datasetName: string) => {
    if (!datasetName) {
      setSchema(null);
      setTrainingConfig((prev) => ({
        ...prev,
        datasetName: "",
        targetColumn: "",
      }));
      return;
    }

    try {
      setIsLoadingSchema(true);
      setMessage(null);
      const response = await fetch(
        `/api/schema/${encodeURIComponent(datasetName)}`
      );
      const result: ApiResponse<DatasetSchema> = await response.json();

      if (result.success && result.data) {
        setSchema(result.data);
        setTrainingConfig((prev) => ({
          ...prev,
          datasetName,
          targetColumn:
            result.data?.columns[result.data.columns.length - 1] || "",
        }));
      } else {
        setMessage({
          type: "error",
          text: result.message || "Error al cargar esquema",
        });
        setSchema(null);
      }
    } catch (_error) {
      setMessage({
        type: "error",
        text: "Error de conexión al cargar esquema",
      });
      setSchema(null);
    } finally {
      setIsLoadingSchema(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDataset) {
      loadSchema(selectedDataset);
    } else {
      setSchema(null);
    }
  }, [selectedDataset, loadSchema]);

  // --- Simulación de Progreso ---
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTraining) {
      setSimulatedProgress(0);
      interval = setInterval(() => {
        setSimulatedProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval!);
            return 95;
          }
          return prev + 5;
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTraining]);

  // --- Manejadores de Eventos ---

  const handleConfigChange = (
    field: keyof TrainingConfig,
    value: string | number
  ) => {
    setTrainingConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleStartTraining = async () => {
    if (!selectedDataset || !trainingConfig.targetColumn) {
      setMessage({
        type: "error",
        text: "Por favor, selecciona un dataset y una columna objetivo.",
      });
      return;
    }

    setIsTraining(true);
    setTrainingResult(null);
    setMessage(null);

    try {
      const response = await fetch("/api/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trainingConfig),
      });

      const result: ApiResponse<TrainingResult> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Ocurrió un error en el servidor.");
      }

      setTrainingResult(result.data!);
      setMessage({ type: "success", text: result.message });
      setSimulatedProgress(100);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Error de conexión durante el entrenamiento.",
      });
      setSimulatedProgress(0);
    } finally {
      setIsTraining(false);
    }
  };
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Entrenar Modelo
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Configura y ejecuta un proceso de entrenamiento para generar un nuevo
          modelo de machine learning.
        </p>
      </div>
      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon
              className="h-5 w-5 text-blue-400"
              aria-hidden="true"
            />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Acerca del Entrenamiento de Modelos
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Este proceso utiliza una simulación de entrenamiento en el
                backend. Los datos se validan, y se genera un modelo simulado
                junto con sus métricas.
              </p>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Dataset Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FolderIcon className="h-5 w-5 text-blue-600 mr-2" />
          Selección del Dataset
        </h2>
        {isLoadingDatasets ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Cargando datasets...</p>
          </div>
        ) : (
          <div>
            {" "}
            <label
              htmlFor="dataset-select"
              className="block text-sm font-medium text-gray-800 mb-2"
            >
              Seleccionar Dataset para Entrenamiento
            </label>{" "}
            <select
              id="dataset-select"
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
              disabled={isTraining}
            >
              <option value="">-- Selecciona un dataset --</option>
              {datasets.map((dataset) => (
                <option key={dataset.name} value={dataset.name}>
                  {dataset.name} ({(dataset.size / 1024).toFixed(1)} KB)
                </option>
              ))}
            </select>
            {datasets.length === 0 && !isLoadingDatasets && (
              <p className="mt-2 text-sm text-gray-500">
                No hay datasets disponibles.
              </p>
            )}
          </div>
        )}
      </div>{" "}
      {/* Model Configuration */}
      {selectedDataset && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
            Paso 2: Configuración del Modelo
          </h2>
          {isLoadingSchema ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Cargando esquema...</p>
            </div>
          ) : schema ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Target Column Selection */}
                <div>
                  {" "}
                  <label
                    htmlFor="target-column"
                    className="block text-sm font-medium text-gray-800 mb-2"
                  >
                    Columna Objetivo (a predecir)
                  </label>{" "}
                  <select
                    id="target-column"
                    value={trainingConfig.targetColumn}
                    onChange={(e) =>
                      handleConfigChange("targetColumn", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
                    disabled={isTraining}
                  >
                    {schema.columns.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hyperparameters */}
                <div>
                  {" "}
                  <label
                    htmlFor="epochs"
                    className="block text-sm font-medium text-gray-800 mb-2"
                  >
                    Número de Épocas
                  </label>{" "}
                  <input
                    type="number"
                    id="epochs"
                    min="10"
                    max="500"
                    value={trainingConfig.epochs}
                    onChange={(e) =>
                      handleConfigChange("epochs", parseInt(e.target.value))
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
                    disabled={isTraining}
                  />
                </div>
                <div>
                  {" "}
                  <label
                    htmlFor="learning-rate"
                    className="block text-sm font-medium text-gray-800 mb-2"
                  >
                    Tasa de Aprendizaje
                  </label>{" "}
                  <select
                    id="learning-rate"
                    value={trainingConfig.learningRate}
                    onChange={(e) =>
                      handleConfigChange(
                        "learningRate",
                        parseFloat(e.target.value)
                      )
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
                    disabled={isTraining}
                  >
                    <option value={0.1}>0.1 (Alta)</option>
                    <option value={0.01}>0.01 (Media)</option>
                    <option value={0.001}>0.001 (Baja)</option>
                    <option value={0.0001}>0.0001 (Muy Baja)</option>
                  </select>
                </div>
                <div>
                  {" "}
                  <label
                    htmlFor="batch-size"
                    className="block text-sm font-medium text-gray-800 mb-2"
                  >
                    Tamaño del Lote
                  </label>{" "}
                  <select
                    id="batch-size"
                    value={trainingConfig.batchSize}
                    onChange={(e) =>
                      handleConfigChange("batchSize", parseInt(e.target.value))
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
                    disabled={isTraining}
                  >
                    <option value={16}>16</option>
                    <option value={32}>32</option>
                    <option value={64}>64</option>
                    <option value={128}>128</option>
                  </select>
                </div>
              </div>{" "}
              {/* Training Action */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleStartTraining}
                  disabled={isTraining || !trainingConfig.targetColumn}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-4 sm:px-6 py-3 border border-transparent text-sm sm:text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTraining ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Entrenando Modelo...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-5 w-5 mr-2" />
                      Iniciar Entrenamiento
                    </>
                  )}
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}
      {/* Training Progress */}
      {isTraining && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Progreso del Entrenamiento
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Entrenando en el servidor...</span>
                <span>{simulatedProgress}%</span>
              </div>
              <ProgressBar progress={simulatedProgress} color="green" />
              <p className="text-xs text-gray-500 mt-2">
                Esto puede tardar unos segundos. La interfaz se actualizará al
                finalizar.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Training Results */}
      {trainingResult && !isTraining && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Resultados del Entrenamiento
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-3">
                  Métricas Finales
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Precisión Final:</span>
                    <span className="font-bold text-green-800">
                      {(trainingResult.finalAccuracy * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Pérdida Final:</span>
                    <span className="font-bold text-green-800">
                      {trainingResult.finalLoss.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">
                      Tiempo de Entrenamiento:
                    </span>
                    <span className="font-bold text-green-800">
                      {(trainingResult.trainingTimeMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">
                  Información del Dataset
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total de Muestras:</span>
                    <span className="font-bold text-blue-800">
                      {trainingResult.datasetInfo.totalSamples}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Características:</span>
                    <span className="font-bold text-blue-800">
                      {trainingResult.datasetInfo.features.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Clases:</span>
                    <span className="font-bold text-blue-800">
                      {trainingResult.datasetInfo.classes.length}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Modelo Guardado
                </h4>
                <p className="text-xs text-gray-600 break-all">
                  {trainingResult.modelPath}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Message Display */}
      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200"
              : message.type === "error"
              ? "bg-red-50 border border-red-200"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === "success" ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              ) : message.type === "error" ? (
                <XCircleIcon className="h-5 w-5 text-red-400" />
              ) : (
                <InformationCircleIcon className="h-5 w-5 text-blue-400" />
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${
                  message.type === "success"
                    ? "text-green-800"
                    : message.type === "error"
                    ? "text-red-800"
                    : "text-blue-800"
                }`}
              >
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
