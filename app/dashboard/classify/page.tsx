"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  BeakerIcon,
  ClockIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import {
  Dataset,
  DatasetSchema,
  PatientData,
  ClassificationResult,
  ApiResponse,
} from "@/types";
import { ProgressBar } from "../components/ProgressBar";
import { apiFetch } from "@/lib/api";
import { jsPDF } from "jspdf";

/**
 * Patient Classification Page
 * Dynamic form generation based on selected dataset schema
 */
export default function ClassifyPage() {
  // Cambiar datasets a models
  const [models, setModels] = useState<
    { id: number; name: string; path: string; trainedAt?: string; classifier_type?: string; auc?: number; f1_score?: number }[]
  >([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [schema, setSchema] = useState<DatasetSchema | null>(null);
  const [patientData, setPatientData] = useState<PatientData>({});
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [classificationResult, setClassificationResult] =
    useState<ClassificationResult | null>(null);

  // Cargar modelos entrenados
  const loadModels = useCallback(async () => {
    try {
      setIsLoadingModels(true);
      const result = await apiFetch("/api/models");
      if (result.success && result.data) {
        setModels(result.data);
        if (result.data.length === 0) {
          setMessage({
            type: "info",
            text: "No hay modelos entrenados disponibles. Entrena un modelo primero.",
          });
        }
      } else {
        setMessage({
          type: "error",
          text: result.message || "Error al cargar modelos",
        });
      }
    } catch (_error) {
      setMessage({
        type: "error",
        text: "Error de conexión al cargar modelos",
      });
    } finally {
      setIsLoadingModels(false);
    }
  }, []);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Cargar esquema del modelo directamente desde sus features (sin llamar /api/schema)
  const loadModelFeatures = useCallback((modelName: string) => {
    if (!modelName) {
      setSchema(null);
      setPatientData({});
      return;
    }
    try {
      setIsLoadingSchema(true);
      setMessage(null);
      const model = models.find((m) => m.name === modelName);
      if (!model || !model.features || model.features.length === 0) {
        setMessage({ type: "error", text: "El modelo no tiene features disponibles" });
        setSchema(null);
        setIsLoadingSchema(false);
        return;
      }
      const featureNames = model.features as string[];
      const sch: DatasetSchema = {
        columns: featureNames,
        datasetName: modelName,
        totalColumns: featureNames.length + 1,
      };
      setSchema(sch);
      const initialData: PatientData = {};
      featureNames.forEach((col) => {
        initialData[col] = "";
      });
      setPatientData(initialData);
      setMessage({ type: "success", text: "Esquema cargado: " + featureNames.length + " campos disponibles" });
    } catch (_error) {
      setMessage({ type: "error", text: "Error al procesar features del modelo" });
      setSchema(null);
    } finally {
      setIsLoadingSchema(false);
    }
  }, [models]);

  useEffect(() => {
    if (selectedModel) {
      loadModelFeatures(selectedModel);
    }
  }, [selectedModel, loadModelFeatures]);

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

    if (!selectedModelId || !schema) {
      setMessage({ type: "error", text: "Selecciona un modelo primero" });
      return;
    }

    // Validate required fields
    const requiredFields = schema.columns;
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

      const result = await apiFetch<ClassificationResult>("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_id: selectedModelId,
          patient_data: processedData,
        }),
      });

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
    } catch (_error) {
      setMessage({
        type: "error",
        text: "Error de conexión durante la clasificación",
      });
    } finally {
      setIsClassifying(false);
    }
  };

  // Función para generar y descargar el PDF
  const generatePDF = useCallback(() => {
    if (!classificationResult || !schema) {
      setMessage({
        type: "error",
        text: "No hay datos de clasificación disponibles para exportar",
      });
      return;
    }

    try {
      const doc = new jsPDF();

      // Título del documento
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("OncoDiag - Reporte de Clasificación", 20, 25);

      // Fecha y hora
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Fecha: ${new Date().toLocaleString("es-ES")}`, 20, 35);

      // Línea separadora
      doc.setLineWidth(0.5);
      doc.line(20, 40, 190, 40);

      let yPosition = 50;

      // Modelo utilizado
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Modelo Utilizado:", 20, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text((selectedModel || "").replace(".csv", ""), 20, yPosition + 8);
      yPosition += 20;

      // Datos del paciente
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Datos del Paciente:", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Mostrar los datos ingresados
      Object.entries(patientData).forEach(([key, value]) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${key}: ${value}`, 25, yPosition);
        yPosition += 6;
      });

      yPosition += 10;

      // Resultados de la clasificación
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Resultados de la Clasificación:", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      // Porcentaje de riesgo
      const riskPercentage =
        (classificationResult as any).riskPercentage ||
        Math.round(classificationResult.confidence * 100);
      doc.text(`Porcentaje de Riesgo: ${riskPercentage}%`, 25, yPosition);
      yPosition += 8;

      // Diagnóstico
      const diagnosis =
        (classificationResult as any).diagnosis ||
        `Probabilidad de ${classificationResult.prediction}`;
      doc.text(`Diagnóstico: ${diagnosis}`, 25, yPosition);
      yPosition += 8;

      // Nivel de riesgo
      const riskLevel = (classificationResult as any).riskLevel || "Calculado";
      doc.text(`Nivel de Riesgo: ${riskLevel}`, 25, yPosition);
      yPosition += 8;

      // Predicción principal
      doc.text(
        `Predicción Principal: ${classificationResult.prediction}`,
        25,
        yPosition
      );
      yPosition += 8;

      // Confianza
      doc.text(
        `Confianza: ${Math.round(classificationResult.confidence * 100)}%`,
        25,
        yPosition
      );
      yPosition += 15;

      // Desglose de probabilidades
      if ((classificationResult as any).allPredictions) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Desglose de Probabilidades:", 25, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        const allPredictions = (classificationResult as any).allPredictions;
        allPredictions.forEach((pred: any) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(
            `${pred.class}: ${Math.round(pred.probability * 100)}%`,
            30,
            yPosition
          );
          yPosition += 6;
        });
        yPosition += 10;
      }

      // Disclaimer médico
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Importante:", 20, yPosition);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const disclaimer =
        "Este análisis es una herramienta de apoyo diagnóstico y no reemplaza el criterio médico profesional. Los resultados deben ser interpretados por un profesional de la salud calificado junto con estudios clínicos complementarios.";

      // Dividir el texto en líneas
      const lines = doc.splitTextToSize(disclaimer, 170);
      lines.forEach((line: string) => {
        doc.text(line, 20, yPosition);
        yPosition += 5;
      });

      // Generar nombre del archivo
      const fileName = `OncoDiag_Clasificacion_${
        new Date().toISOString().split("T")[0]
      }_${new Date().toTimeString().split(" ")[0].replace(/:/g, "-")}.pdf`;

      // Descargar el PDF
      doc.save(fileName);

      setMessage({
        type: "success",
        text: "Reporte PDF generado exitosamente",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      setMessage({
        type: "error",
        text: "Error al generar el reporte PDF",
      });
    }
  }, [classificationResult, schema, patientData, selectedModel]);
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
      <div key={fieldName} className="space-y-2">
        <label
          htmlFor={fieldName}
          className="block text-sm font-semibold text-gray-800"
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
          className="block w-full px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
          required
        />
      </div>
    );
  };
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Clasificación de Pacientes
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Utiliza modelos de machine learning para realizar diagnósticos
          asistidos basados en datos del paciente.
        </p>
      </div>{" "}
      {/* Model Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BeakerIcon className="h-5 w-5 text-blue-600 mr-2" />
          Seleccionar Modelo
        </h2>
        {isLoadingModels ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Cargando modelos...</p>
          </div>
        ) : (
          <div>
            {" "}
            <label
              htmlFor="model-select"
              className="block text-sm font-semibold text-gray-800 mb-3"
            >
              Modelo de Clasificación
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedModel(val);
                const found = models.find(m => m.name === val);
                setSelectedModelId(found && found.id ? found.id : null);
              }}
              className="block w-full px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
              disabled={isClassifying}
            >
              <option value="">-- Selecciona un modelo --</option>
              {models.map((model) => (
                <option key={model.id} value={model.name}>
                  {model.name}{" "}
                  {model.trainedAt
                    ? `(Entrenado: ${new Date(
                        model.trainedAt
                      ).toLocaleString()})`
                    : ""}
                </option>
              ))}
            </select>
            {models.length === 0 && !isLoadingModels && (
              <p className="mt-2 text-sm text-gray-500">
                No hay modelos entrenados disponibles.
              </p>
            )}
          </div>
        )}
      </div>{" "}
      {/* Schema Loading */}
      {selectedModel && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
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
      )}{" "}
      {/* Patient Data Form */}
      {schema && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
            Paso 3: Datos del Paciente
          </h2>

          <form onSubmit={handleClassify} className="space-y-6">
            {" "}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {schema.columns
                .map((column) => renderInputField(column))}
            </div>{" "}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isClassifying || !schema}
                className="w-full flex justify-center items-center px-6 py-4 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      )}{" "}
      {/* Classification Results */}
      {classificationResult && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 sm:p-6">
          {" "}
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-green-600" />
            Análisis Oncológico Completado
          </h2>{" "}
          {/* Main Result Card */}
          <div className="mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-4 sm:p-8 shadow-lg">
              <div className="text-center">
                <div className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-2 sm:mb-4 text-blue-700">
                  {(classificationResult as any).riskPercentage ||
                    Math.round(classificationResult.confidence * 100)}
                  %
                </div>
                <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-2 sm:mb-4">
                  {(classificationResult as any).diagnosis ||
                    `Probabilidad de ${classificationResult.prediction}`}
                </div>{" "}
                <div
                  className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-semibold ${
                    (classificationResult as any).riskLevel === "Alto"
                      ? "bg-red-100 text-red-800 border border-red-300"
                      : (classificationResult as any).riskLevel === "Medio"
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                      : "bg-green-100 text-green-800 border border-green-300"
                  }`}
                >
                  Riesgo{" "}
                  {(classificationResult as any).riskLevel || "Calculado"}
                </div>
              </div>
            </div>
          </div>{" "}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Risk Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Desglose de Probabilidades
              </h3>
              <div className="space-y-3">
                {(
                  (classificationResult as any).allPredictions || [
                    {
                      class: classificationResult.prediction,
                      probability: classificationResult.confidence,
                    },
                    {
                      class: "Otros",
                      probability: 1 - classificationResult.confidence,
                    },
                  ]
                ).map((pred: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {pred.class}
                    </span>{" "}
                    <div className="flex items-center space-x-2">
                      <div className="w-24">
                        {" "}
                        <ProgressBar
                          progress={Math.round(pred.probability * 100)}
                          color={index === 0 ? "blue" : "red"}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-12 text-right">
                        {Math.round(pred.probability * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>{" "}
            {/* Analysis Details */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Detalles del Análisis
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">Procesado:</span>
                  <span className="ml-1 font-medium">
                    {new Date(classificationResult.timestamp).toLocaleString(
                      "es-ES"
                    )}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <BeakerIcon className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">Modelo:</span>
                  <span className="ml-1 font-medium">
                    {(
                      (classificationResult as any).modelInfo
                        ?.targetCondition ||
                      classificationResult.datasetUsed ||
                      selectedModel ||
                      ""
                    ).toString().replace(".csv", "")}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">
                    Características analizadas:
                  </span>
                  <span className="ml-1 font-medium">
                    {(classificationResult as any).modelInfo?.features || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Medical Disclaimer */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Importante:</p>
                <p>
                  Este análisis es una herramienta de apoyo diagnóstico y no
                  reemplaza el criterio médico profesional. Los resultados deben
                  ser interpretados por un profesional de la salud calificado
                  junto con estudios clínicos complementarios.
                </p>
              </div>
            </div>
          </div>
          {/* Export PDF Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={generatePDF}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Exportar Reporte PDF
            </button>
          </div>
        </div>
      )}{" "}
      {/* Technical Information */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
          Información Técnica
        </h2>

        <div className="prose prose-sm text-gray-600">
          <p className="text-sm sm:text-base">
            El sistema de clasificación utiliza:
          </p>
          <ul className="mt-2 space-y-1 text-sm sm:text-base">
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
