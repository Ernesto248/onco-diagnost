"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";
import { Dataset, ApiResponse, BalanceResult } from "@/types";

/**
 * Data Balancing Page
 * Allows users to apply SMOTE-like balancing to datasets
 */
export default function BalancePage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBalancing, setIsBalancing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [balanceResult, setBalanceResult] = useState<BalanceResult | null>(
    null
  );

  // Load available datasets
  const loadDatasets = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/datasets");
      const result: ApiResponse<Dataset[]> = await response.json();

      if (result.success && result.data) {
        // Filter out already balanced datasets for the selection
        const originalDatasets = result.data.filter(
          (dataset) => !dataset.isBalanced
        );
        setDatasets(originalDatasets);

        if (originalDatasets.length === 0) {
          setMessage({
            type: "info",
            text: "No hay datasets originales disponibles. Sube un dataset primero.",
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
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);

  // Handle balance operation
  const handleBalance = async () => {
    if (!selectedDataset) {
      setMessage({ type: "error", text: "Por favor selecciona un dataset" });
      return;
    }

    setIsBalancing(true);
    setMessage(null);
    setBalanceResult(null);

    try {
      const response = await fetch("/api/balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ datasetName: selectedDataset }),
      });

      const result: ApiResponse<BalanceResult> = await response.json();

      if (result.success && result.data) {
        setBalanceResult(result.data);
        setMessage({
          type: "success",
          text: result.message || "Dataset balanceado exitosamente",
        });
        // Reload datasets to show the new balanced dataset
        await loadDatasets();
      } else {
        setMessage({
          type: "error",
          text: result.message || "Error al balancear dataset",
        });
      }
    } catch (_error) {
      setMessage({
        type: "error",
        text: "Error de conexión al balancear dataset",
      });
    } finally {
      setIsBalancing(false);
    }
  };
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Balanceo de Datos
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Aplica el algoritmo SMOTE para balancear datasets con clases
          desbalanceadas.
        </p>
      </div>
      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Acerca del Algoritmo SMOTE
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                SMOTE (Synthetic Minority Oversampling Technique) genera
                muestras sintéticas de la clase minoritaria para balancear el
                dataset. Esto mejora el rendimiento de los modelos de machine
                learning en datos médicos desbalanceados.
              </p>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Balance Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <ScaleIcon className="h-5 w-5 text-blue-600 mr-2" />
          Configuración de Balanceo
        </h2>

        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Cargando datasets...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {" "}
            {/* Dataset Selection */}
            <div className="space-y-3">
              <label
                htmlFor="dataset-select"
                className="block text-sm font-semibold text-gray-800"
              >
                Dataset Original
              </label>
              <select
                id="dataset-select"
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="block w-full px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
                disabled={isBalancing}
              >
                <option value="">-- Selecciona un dataset --</option>
                {datasets.map((dataset) => (
                  <option key={dataset.name} value={dataset.name}>
                    {dataset.name} ({(dataset.size / 1024).toFixed(1)} KB)
                  </option>
                ))}
              </select>
              {datasets.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  No hay datasets originales disponibles.
                </p>
              )}
            </div>{" "}
            {/* Balance Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
              <div>
                <p className="text-sm text-gray-600">
                  {selectedDataset
                    ? `Dataset seleccionado: ${selectedDataset}`
                    : "Selecciona un dataset para continuar"}
                </p>
              </div>
              <button
                onClick={handleBalance}
                disabled={!selectedDataset || isBalancing}
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBalancing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Aplicar Balanceo
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
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
      {/* Balance Results */}
      {balanceResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Resultados del Balanceo
          </h2>{" "}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              {" "}
              <h3 className="text-sm font-medium text-gray-800 mb-2">
                Dataset Original
              </h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Archivo:</span>{" "}
                  {balanceResult.originalFile}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Filas:</span>{" "}
                  {balanceResult.originalRows.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              {" "}
              <h3 className="text-sm font-medium text-gray-800 mb-2">
                Dataset Balanceado
              </h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Archivo:</span>{" "}
                  {balanceResult.balancedFile}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Filas:</span>{" "}
                  {balanceResult.balancedRows.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 font-medium">
                  +
                  {(
                    balanceResult.balancedRows - balanceResult.originalRows
                  ).toLocaleString()}{" "}
                  filas sintéticas
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Operación:</span>{" "}
              {balanceResult.operation}
            </p>
          </div>
        </div>
      )}
      {/* Algorithm Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Información del Algoritmo
        </h2>

        <div className="prose prose-sm text-gray-600">
          <p>El algoritmo SMOTE implementado en esta plataforma:</p>
          <ul className="mt-2 space-y-1">
            <li>
              • Identifica automáticamente la clase minoritaria en el dataset
            </li>
            <li>
              • Genera muestras sintéticas utilizando interpolación entre
              muestras existentes
            </li>
            <li>
              • Balancea las clases para mejorar el rendimiento del modelo
            </li>
            <li>
              • Preserva las características estadísticas de los datos
              originales
            </li>
          </ul>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> El dataset balanceado se guardará con el
              sufijo &quot;_balanced&quot; y estará disponible para su uso en la
              sección de clasificación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
