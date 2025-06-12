"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ChartBarSquareIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  BeakerIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  Dataset,
  DatasetSchema,
  PatientData,
  ClassificationResult,
  ApiResponse,
} from "@/types";

/**
 * Patient Classification Page
 * Dynamic form generation based on selected dataset schema
 */
export default function ClassifyPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [schema, setSchema] = useState<DatasetSchema | null>(null);
  const [patientData, setPatientData] = useState<PatientData>({});
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(true);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [classificationResult, setClassificationResult] =
    useState<ClassificationResult | null>(null);

  // Load available datasets
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
    } catch (error) {
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

  // Load schema when dataset is selected
  const loadSchema = useCallback(async (datasetName: string) => {
    if (!datasetName) {
      setSchema(null);
      setPatientData({});
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

        // Initialize patient data with empty values
        const initialData: PatientData = {};
        result.data.columns.slice(0, -1).forEach((column) => {
          initialData[column] = "";
        });
        setPatientData(initialData);

        setMessage({
          type: "success",
          text: `Esquema cargado: ${
            result.data.totalColumns - 1
          } campos disponibles`,
        });
      } else {
        setMessage({
          type: "error",
          text: result.message || "Error al cargar esquema",
        });
        setSchema(null);
      }
    } catch (error) {
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
    }
  }, [selectedDataset, loadSchema]);

  // Handle input changes
  const handleInputChange = (fieldName: string, value: string) => {
    setPatientData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Handle form submission
  const handleClassify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDataset || !schema) {
      setMessage({ type: "error", text: "Selecciona un dataset primero" });
      return;
    }

    // Validate required fields
    const requiredFields = schema.columns.slice(0, -1);
    const missingFields = requiredFields.filter(
      (field) =>
        !patientData[field] || patientData[field].toString().trim() === ""
    );

    if (missingFields.length > 0) {
      setMessage({
        type: "error",
        text: `Completa todos los campos: ${missingFields.join(", ")}`,
      });
      return;
    }

    setIsClassifying(true);
    setMessage(null);
    setClassificationResult(null);

    try {
      // Convert string values to appropriate types
      const processedData: PatientData = {};
      Object.keys(patientData).forEach((key) => {
        const value = patientData[key].toString().trim();

        // Try to convert to number if possible
        const numValue = Number(value);
        if (!isNaN(numValue) && value !== "") {
          processedData[key] = numValue;
        } else {
          processedData[key] = value;
        }
      });

      const response = await fetch("/api/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          datasetName: selectedDataset,
          patientData: processedData,
        }),
      });

      const result: ApiResponse<ClassificationResult> = await response.json();

      if (result.success && result.data) {
        setClassificationResult(result.data);
        setMessage({
          type: "success",
          text: "Clasificación completada exitosamente",
        });
      } else {
        setMessage({
          type: "error",
          text: result.message || "Error en la clasificación",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error de conexión durante la clasificación",
      });
    } finally {
      setIsClassifying(false);
    }
  };
  // Render input field based on field name heuristics
  const renderInputField = (fieldName: string) => {
    const lowerFieldName = fieldName.toLowerCase();
    const rawValue = patientData[fieldName];
    const value =
      rawValue !== undefined && rawValue !== null ? String(rawValue) : "";

    // Determine input type based on field name
    let inputType = "text";
    let placeholder = `Ingresa ${fieldName}`;

    if (lowerFieldName.includes("age") || lowerFieldName.includes("edad")) {
      inputType = "number";
      placeholder = "Edad (años)";
    } else if (
      lowerFieldName.includes("size") ||
      lowerFieldName.includes("tamaño")
    ) {
      inputType = "number";
      placeholder = "Tamaño (cm)";
    } else if (
      lowerFieldName.includes("weight") ||
      lowerFieldName.includes("peso")
    ) {
      inputType = "number";
      placeholder = "Peso (kg)";
    } else if (
      lowerFieldName.includes("height") ||
      lowerFieldName.includes("altura")
    ) {
      inputType = "number";
      placeholder = "Altura (cm)";
    } else if (
      lowerFieldName.includes("grade") ||
      lowerFieldName.includes("grado")
    ) {
      inputType = "number";
      placeholder = "Grado (1-4)";
    } else if (
      lowerFieldName.includes("stage") ||
      lowerFieldName.includes("estadio")
    ) {
      inputType = "number";
      placeholder = "Estadio (1-4)";
    }

    return (
      <div key={fieldName}>
        <label
          htmlFor={fieldName}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {fieldName}
        </label>
        <input
          type={inputType}
          id={fieldName}
          name={fieldName}
          value={value}
          onChange={(e) => handleInputChange(fieldName, e.target.value)}
          placeholder={placeholder}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Clasificación de Pacientes
        </h1>
        <p className="mt-2 text-gray-600">
          Utiliza modelos de machine learning para realizar diagnósticos
          asistidos basados en datos del paciente.
        </p>
      </div>

      {/* Model Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Paso 1: Selección del Modelo
        </h2>

        {isLoadingDatasets ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">
              Cargando modelos disponibles...
            </p>
          </div>
        ) : (
          <div>
            <label
              htmlFor="model-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Seleccionar Dataset/Modelo
            </label>
            <select
              id="model-select"
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isClassifying}
            >
              <option value="">-- Selecciona un modelo --</option>
              {datasets.map((dataset) => (
                <option key={dataset.name} value={dataset.name}>
                  {dataset.name}{" "}
                  {dataset.isBalanced ? "(Balanceado)" : "(Original)"}
                </option>
              ))}
            </select>
            {datasets.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                No hay modelos disponibles. Sube un dataset primero.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Schema Loading */}
      {selectedDataset && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Paso 2: Carga del Esquema
          </h2>

          {isLoadingSchema ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">
                Cargando esquema del modelo...
              </p>
            </div>
          ) : schema ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    Esquema Cargado
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    Modelo: <strong>{schema.datasetName}</strong> • Campos:{" "}
                    <strong>{schema.totalColumns - 1}</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Selecciona un modelo para cargar su esquema automáticamente.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Patient Data Form */}
      {schema && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Paso 3: Datos del Paciente
          </h2>

          <form onSubmit={handleClassify} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schema.columns
                .slice(0, -1)
                .map((column) => renderInputField(column))}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isClassifying || !schema}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClassifying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Procesando Clasificación...
                  </>
                ) : (
                  <>
                    <BeakerIcon className="h-5 w-5 mr-2" />
                    Realizar Clasificación
                  </>
                )}
              </button>
            </div>
          </form>
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

      {/* Classification Results */}
      {classificationResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Resultados de la Clasificación
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prediction Result */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="text-center">
                <UserIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Predicción
                </h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {classificationResult.prediction}
                </div>
                <div className="text-sm text-gray-600">
                  Confianza:{" "}
                  <span className="font-medium">
                    {(classificationResult.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Información del Análisis
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>
                      Procesado:{" "}
                      {new Date(classificationResult.timestamp).toLocaleString(
                        "es-ES"
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Modelo utilizado:</span>{" "}
                    {classificationResult.datasetUsed}
                  </div>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Nivel de Confianza
                </h4>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      classificationResult.confidence > 0.8
                        ? "bg-green-500"
                        : classificationResult.confidence > 0.6
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${classificationResult.confidence * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {classificationResult.confidence > 0.8
                    ? "Alta confianza"
                    : classificationResult.confidence > 0.6
                    ? "Confianza moderada"
                    : "Baja confianza - Se recomienda revisión adicional"}
                </p>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <InformationCircleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Aviso Importante
                </h4>
                <p className="mt-1 text-sm text-yellow-700">
                  Este resultado es generado por un sistema de inteligencia
                  artificial y debe ser considerado como una herramienta de
                  apoyo diagnóstico. Siempre consulte con un profesional médico
                  para obtener un diagnóstico definitivo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technical Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Información Técnica
        </h2>

        <div className="prose prose-sm text-gray-600">
          <p>El sistema de clasificación utiliza:</p>
          <ul className="mt-2 space-y-1">
            <li>
              • <strong>TensorFlow.js</strong> para el procesamiento de machine
              learning
            </li>
            <li>
              • <strong>Formularios dinámicos</strong> que se adaptan al esquema
              del dataset seleccionado
            </li>
            <li>
              • <strong>Validación automática</strong> de tipos de datos y
              campos requeridos
            </li>
            <li>
              • <strong>Métricas de confianza</strong> para evaluar la calidad
              de las predicciones
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
