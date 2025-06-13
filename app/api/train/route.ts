import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { z, ZodError } from "zod";

// ApiResponse genérica para mantener consistencia
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string | ZodError;
}

// Esquema de validación con Zod para la solicitud de entrenamiento
const TrainingRequestSchema = z.object({
  datasetName: z.string().min(1, "El nombre del dataset es requerido."),
  targetColumn: z.string().min(1, "La columna objetivo es requerida."),
  epochs: z.number().int().min(1).max(1000).default(100),
  learningRate: z.number().positive().default(0.01),
  batchSize: z.number().int().positive().default(32),
});

type TrainingRequest = z.infer<typeof TrainingRequestSchema>;

// Resultado del entrenamiento
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

// --- Funciones de Ayuda ---

/**
 * Carga y procesa un dataset desde un archivo CSV de forma robusta.
 * Identifica automáticamente las columnas numéricas para usarlas como características.
 * @param datasetPath - Ruta completa al archivo CSV.
 * @param targetColumn - Nombre de la columna que contiene la etiqueta.
 * @returns Un objeto con las características (features), etiquetas (targets) y cabeceras de características.
 */
async function loadAndProcessDataset(
  datasetPath: string,
  targetColumn: string
) {
  const csvContent = await fs.readFile(datasetPath, "utf-8");
  const lines = csvContent.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  if (!headers.includes(targetColumn)) {
    throw new Error(
      `La columna objetivo "${targetColumn}" no se encontró en el dataset.`
    );
  }

  const targetIndex = headers.indexOf(targetColumn);
  const originalFeatureHeaders = headers.filter((_, i) => i !== targetIndex);
  const dataRows = lines.slice(1);

  if (dataRows.length === 0) {
    throw new Error("El dataset no contiene filas de datos.");
  }

  // 1. Determinar qué columnas de características son numéricas basándose en la primera fila.
  const firstRowCols = dataRows[0].split(",").map((c) => c.trim());

  // Obtenemos los índices originales de las columnas de características
  const featureIndicesInHeaders = headers
    .map((h, i) => i)
    .filter((i) => i !== targetIndex);

  const numericFeatureSourceIndices: number[] = [];
  featureIndicesInHeaders.forEach((headerIndex, featureIndex) => {
    const value = firstRowCols[headerIndex];
    if (value != null && value.trim() !== "" && !isNaN(parseFloat(value))) {
      numericFeatureSourceIndices.push(headerIndex);
    }
  });

  if (numericFeatureSourceIndices.length === 0) {
    throw new Error(
      "No se pudo encontrar ninguna columna de características con datos numéricos. Verifica el dataset y la columna objetivo seleccionada."
    );
  }

  // 2. Crear la lista final de cabeceras de características que se usarán.
  const finalFeatureHeaders = numericFeatureSourceIndices.map(
    (i) => headers[i]
  );

  // 3. Procesar todas las filas, extrayendo únicamente los datos de las columnas numéricas identificadas.
  const features: number[][] = [];
  const targets: string[] = [];

  for (const row of dataRows) {
    const columns = row.split(",").map((c) => c.trim());
    if (columns.length !== headers.length) continue; // Ignorar filas malformadas

    const target = columns[targetIndex];
    if (!target) continue; // Ignorar filas sin un valor objetivo

    const numericFeatures = numericFeatureSourceIndices.map((i) =>
      parseFloat(columns[i])
    );

    if (numericFeatures.some(isNaN)) {
      continue; // Si alguna característica esperada no es un número (ej. está vacía), ignora la fila.
    }

    features.push(numericFeatures);
    targets.push(target);
  }

  if (features.length === 0) {
    throw new Error(
      "No se encontraron filas con datos numéricos válidos después del procesamiento."
    );
  }

  return { features, targets, featureHeaders: finalFeatureHeaders };
}

/**
 * Simula el proceso de entrenamiento de un modelo.
 * @param epochs - Número de épocas.
 * @param featureCount - Número de características.
 * @param sampleCount - Número de muestras.
 * @returns Un objeto con la precisión y pérdida finales.
 */
function simulateTraining(
  epochs: number,
  featureCount: number,
  sampleCount: number
) {
  const baseAccuracy = 0.8 + featureCount * 0.01;
  const finalAccuracy = Math.min(0.98, baseAccuracy + Math.random() * 0.1);
  const finalLoss = Math.max(0.1, 0.6 - epochs / 2000 - sampleCount / 10000);
  const simulatedTime = epochs * 15 + sampleCount * 2;
  return { finalAccuracy, finalLoss, simulatedTime };
}

/**
 * Guarda los artefactos del modelo (metadata y un archivo de modelo simulado).
 * @param modelName - Nombre base para el modelo.
 * @param metadata - Metadatos del entrenamiento para guardar.
 * @param modelInfo - Información del modelo simulado para guardar.
 * @returns La ruta al directorio del modelo.
 */
async function saveModelArtifacts(
  modelName: string,
  metadata: object,
  modelInfo: object
) {
  const modelsDir = path.join(process.cwd(), "models");
  const modelDir = path.join(modelsDir, modelName.replace(".csv", ""));

  await fs.mkdir(modelDir, { recursive: true });

  const metadataPath = path.join(modelDir, "metadata.json");
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

  const modelInfoPath = path.join(modelDir, "model.json");
  await fs.writeFile(modelInfoPath, JSON.stringify(modelInfo, null, 2));

  return modelDir;
}

/**
 * POST /api/train
 * Entrena un modelo de machine learning (simulado).
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TrainingResult>>> {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const trainParams = TrainingRequestSchema.parse(body);
    const { datasetName, targetColumn, epochs } = trainParams;

    const datasetPath = path.join(process.cwd(), "datasets", datasetName);
    try {
      await fs.access(datasetPath);
    } catch {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: `El dataset "${datasetName}" no fue encontrado.`,
          error: "Dataset not found",
        },
        { status: 404 }
      );
    }

    console.log(`Iniciando entrenamiento para el dataset: ${datasetName}`);

    const { features, targets, featureHeaders } = await loadAndProcessDataset(
      datasetPath,
      targetColumn
    );
    const uniqueClasses = [...new Set(targets)].sort();

    if (uniqueClasses.length < 2) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message:
            "El dataset debe tener al menos 2 clases diferentes para entrenar.",
          error: "Insufficient classes",
        },
        { status: 400 }
      );
    }

    console.log(
      `Procesadas ${features.length} muestras válidas con ${featureHeaders.length} características.`
    );
    console.log(
      `Clases encontradas (${uniqueClasses.length}): ${uniqueClasses.join(
        ", "
      )}`
    );

    console.log(`Entrenando modelo por ${epochs} épocas...`);
    const { finalAccuracy, finalLoss, simulatedTime } = simulateTraining(
      epochs,
      featureHeaders.length,
      features.length
    );
    await new Promise((resolve) => setTimeout(resolve, simulatedTime));
    console.log(
      `Entrenamiento simulado completado. Precisión: ${(
        finalAccuracy * 100
      ).toFixed(1)}%`
    );

    const featureStats = featureHeaders.reduce((acc, name, i) => {
      const values = features.map((f) => f[i]);
      acc[name] = { min: Math.min(...values), max: Math.max(...values) };
      return acc;
    }, {} as Record<string, { min: number; max: number }>);
    const metadata = {
      trainParams,
      trainingConfig: trainParams, // Para compatibilidad con tipos y backend
      featureColumns: featureHeaders,
      classes: uniqueClasses,
      architecture: {
        inputShape: featureHeaders.length,
        hiddenLayers: [64, 32], // Arquitectura simulada estándar
        outputShape: uniqueClasses.length,
      },
      preprocessing: { scaler: "minmax", featureStats },
      timestamp: new Date().toISOString(),
    };

    const modelInfo = {
      trained: true,
      accuracy: finalAccuracy,
      loss: finalLoss,
      classes: uniqueClasses,
      features: featureHeaders,
      weights: Array(featureHeaders.length)
        .fill(0)
        .map(() =>
          Array(uniqueClasses.length)
            .fill(0)
            .map(() => Math.random() - 0.5)
        ),
      timestamp: new Date().toISOString(),
    };

    const modelDir = await saveModelArtifacts(datasetName, metadata, modelInfo);

    const endTime = Date.now();
    const result: TrainingResult = {
      modelPath: modelDir,
      finalAccuracy,
      finalLoss,
      totalEpochs: epochs,
      trainingTimeMs: endTime - startTime,
      datasetInfo: {
        totalSamples: features.length,
        features: featureHeaders,
        classes: uniqueClasses,
      },
    };

    return NextResponse.json<ApiResponse<TrainingResult>>({
      success: true,
      message: `Modelo entrenado exitosamente con una precisión de ${(
        finalAccuracy * 100
      ).toFixed(1)}%.`,
      data: result,
    });
  } catch (error) {
    console.error("Error durante el entrenamiento:", error);

    if (error instanceof ZodError) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Datos de solicitud inválidos.",
          error: error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Ocurrió un error desconocido.",
        error: "Training failed",
      },
      { status: 500 }
    );
  }
}
