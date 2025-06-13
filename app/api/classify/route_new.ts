import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import * as _tf from "@tensorflow/tfjs";
import { ApiResponse, ClassificationResult, ModelMetadata } from "@/types";

/**
 * POST /api/classify
 * Performs real patient classification using trained TensorFlow.js models
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ClassificationResult>>> {
  try {
    const { datasetName, patientData } = await request.json();

    if (!datasetName || !patientData) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required data",
          message: "Please provide dataset name and patient data",
        },
        { status: 400 }
      );
    }

    // Get model directory path
    const modelsDir = path.join(process.cwd(), "models");
    const modelName = datasetName.replace(".csv", "");
    const modelDir = path.join(modelsDir, modelName);
    const modelJsonPath = path.join(modelDir, "model.json");
    const metadataPath = path.join(modelDir, "metadata.json");

    // Verify model exists
    try {
      await fs.access(modelDir);
      await fs.access(modelJsonPath);
      await fs.access(metadataPath);
    } catch (_error) {
      return NextResponse.json(
        {
          success: false,
          error: "Model not found",
          message: `No trained model found for dataset "${datasetName}". Please train a model first using the Training page.`,
        },
        { status: 404 }
      );
    }

    console.log(`Loading model from: ${modelDir}`);

    // Load model metadata
    let metadata: ModelMetadata;
    try {
      const metadataContent = await fs.readFile(metadataPath, "utf-8");
      metadata = JSON.parse(metadataContent);
    } catch (_error) {
      return NextResponse.json(
        {
          success: false,
          error: "Metadata loading failed",
          message: "Failed to load model metadata",
        },
        { status: 500 }
      );
    }

    // Validate that patient data has all required features
    const missingFeatures = metadata.featureColumns.filter(
      (feature) =>
        !(feature in patientData) ||
        patientData[feature] === undefined ||
        patientData[feature] === null ||
        patientData[feature] === ""
    );

    if (missingFeatures.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing patient data fields",
          message: `Missing required fields: ${missingFeatures.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Load the trained model
    let _model: _tf.LayersModel;
    try {
      const modelUrl = `file://${modelJsonPath}`;
      _model = await _tf.loadLayersModel(modelUrl);
      console.log("Model loaded successfully");
    } catch (error) {
      console.error("Error loading model:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Model loading failed",
          message:
            "Failed to load the trained model. The model file may be corrupted.",
        },
        { status: 500 }
      );
    }

    // Preprocess patient data
    try {
      // Extract and order features according to training order
      const rawFeatures = metadata.featureColumns.map((feature) => {
        const value = patientData[feature];
        const numValue =
          typeof value === "string" ? parseFloat(value) : Number(value);

        if (isNaN(numValue)) {
          throw new Error(
            `Invalid numeric value for feature "${feature}": ${value}`
          );
        }

        return numValue;
      });

      // Apply the same preprocessing as during training
      let processedFeatures: number[];

      if (metadata.preprocessing.scaler === "minmax") {
        // Apply min-max normalization using stored statistics
        processedFeatures = rawFeatures.map((value, i) => {
          const featureName = metadata.featureColumns[i];
          const stats = metadata.preprocessing.featureStats?.[featureName];

          if (stats) {
            const { min, max } = stats;
            return max > min ? (value - min) / (max - min) : 0;
          }
          return value; // Fallback if no stats available
        });
      } else {
        // Standard scaling (if implemented)
        processedFeatures = rawFeatures; // Simplified for now
      }

      console.log("Patient data preprocessed:", {
        original: rawFeatures,
        processed: processedFeatures,
      });

      // Create tensor for prediction
      const inputTensor = _tf.tensor2d([processedFeatures]);

      // Make prediction
      const prediction = _model.predict(inputTensor) as _tf.Tensor;
      const predictionData = await prediction.data();

      // Get predicted class and confidence
      const predictedClassIndex = Array.from(predictionData).indexOf(
        Math.max(...predictionData)
      );
      const predictedClass = metadata.classes[predictedClassIndex];
      const confidence = predictionData[predictedClassIndex];

      // Get top predictions for additional insight
      const allPredictions = Array.from(predictionData)
        .map((prob, index) => ({
          class: metadata.classes[index],
          probability: prob,
        }))
        .sort((a, b) => b.probability - a.probability);

      console.log(
        `Prediction: ${predictedClass} with confidence: ${confidence}`
      );
      console.log("All predictions:", allPredictions);

      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();
      _model.dispose();

      // Create classification result
      const result: ClassificationResult = {
        prediction: predictedClass,
        confidence: confidence,
        timestamp: new Date().toISOString(),
        datasetUsed: datasetName,
        patientData,
        modelInfo: {
          trainedAt: metadata.timestamp,
          accuracy: `Model trained with ${metadata.trainingConfig.epochs} epochs`,
          features: metadata.featureColumns.length,
          classes: metadata.classes.length,
          architecture: `${
            metadata.architecture.inputShape
          } → ${metadata.architecture.hiddenLayers.join(" → ")} → ${
            metadata.architecture.outputShape
          }`,
          allPredictions: allPredictions.slice(0, 3), // Top 3 predictions
        },
      };

      console.log(`Classification completed for dataset: ${datasetName}`);

      return NextResponse.json({
        success: true,
        data: result,
        message: `Classification completed successfully using trained model "${modelName}"`,
      });
    } catch (error) {
      console.error("Error during prediction:", error);

      // Clean up model if loaded
      if (_model) {
        try {
          _model.dispose();
        } catch (disposeError) {
          console.warn("Error disposing model:", disposeError);
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: "Prediction failed",
          message:
            error instanceof Error
              ? error.message
              : "Error during model prediction",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error during classification:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Classification failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
