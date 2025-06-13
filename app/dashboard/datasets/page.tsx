"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Dataset, ApiResponse } from "@/types";
import { ProgressBar } from "../components/ProgressBar";

/**
 * Datasets Management Page
 * Allows users to upload CSV files and view existing datasets
 */
export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Load datasets on component mount
  const loadDatasets = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/datasets");
      const result: ApiResponse<Dataset[]> = await response.json();

      if (result.success && result.data) {
        setDatasets(result.data);
      } else {
        setMessage({
          type: "error",
          text: result.message || "Error loading datasets",
        });
      }
    } catch (_error) {
      setMessage({ type: "error", text: "Failed to load datasets" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setMessage({ type: "error", text: "Solo se permiten archivos CSV" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result: ApiResponse<{ fileName: string }> = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Archivo subido exitosamente",
        });
        await loadDatasets(); // Reload datasets list
      } else {
        setMessage({
          type: "error",
          text: result.message || "Error al subir archivo",
        });
      }
    } catch (_error) {
      setMessage({ type: "error", text: "Error de conexión al subir archivo" });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle dataset deletion
  const handleDeleteDataset = async (fileName: string) => {
    if (
      !confirm(
        `¿Estás seguro de que quieres eliminar el dataset "${fileName}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    setIsDeleting(fileName);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/datasets?fileName=${encodeURIComponent(fileName)}`,
        {
          method: "DELETE",
        }
      );

      const result: ApiResponse<{ fileName: string }> = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Dataset eliminado exitosamente",
        });
        await loadDatasets(); // Reload datasets list
      } else {
        setMessage({
          type: "error",
          text: result.message || "Error al eliminar dataset",
        });
      }
    } catch (_error) {
      setMessage({
        type: "error",
        text: "Error de conexión al eliminar dataset",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Gestión de Datasets
        </h1>
        <p className="mt-2 text-gray-600">
          Sube nuevos datasets CSV y gestiona los existentes para el análisis de
          datos médicos.
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Subir Nuevo Dataset
        </h2>

        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Arrastra un archivo CSV aquí o{" "}
                  <span className="text-blue-600 hover:text-blue-500">
                    navega para seleccionar
                  </span>
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  disabled={isUploading}
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">CSV hasta 10MB</p>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <ProgressBar
                  progress={uploadProgress}
                  color="blue"
                  className="h-2"
                />
              </div>
              <p className="mt-2 text-sm text-gray-600 text-center">
                Subiendo archivo...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === "success" ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${
                  message.type === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Datasets List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Datasets Disponibles
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Cargando datasets...</p>
          </div>
        ) : datasets.length === 0 ? (
          <div className="p-6 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              No hay datasets disponibles
            </p>
            <p className="text-xs text-gray-400">
              Sube tu primer dataset para comenzar
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {datasets.map((dataset, index) => (
              <div key={index} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {dataset.name}
                        {dataset.isBalanced && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Balanceado
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(dataset.size)} • Subido el{" "}
                        {formatDate(dataset.uploadDate)}
                      </p>
                    </div>
                  </div>{" "}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteDataset(dataset.name)}
                      disabled={isDeleting === dataset.name}
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting === dataset.name ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
                          Eliminando...
                        </>
                      ) : (
                        <>
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Eliminar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
