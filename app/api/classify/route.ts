import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { ApiResponse, ClassificationResult, PatientData } from "@/types";

/**
 * POST /api/classify
 * Performs patient classification using TensorFlow.js (simulated)
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

    const datasetsDir = path.join(process.cwd(), "datasets");
    const datasetPath = path.join(datasetsDir, datasetName);

    // Verify dataset exists
    try {
      await fs.access(datasetPath);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Dataset not found",
          message: `Dataset "${datasetName}" not found`,
        },
        { status: 404 }
      );
    }

    // Read dataset to understand the structure and classes
    const content = await fs.readFile(datasetPath, "utf-8");
    const lines = content.trim().split("\n");

    if (lines.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid dataset",
          message: "Dataset must contain headers and at least one row of data",
        },
        { status: 400 }
      );
    }

    const headers = lines[0].split(",").map((h) => h.trim());
    const dataRows = lines.slice(1);

    // Validate that patient data matches the dataset schema
    const patientKeys = Object.keys(patientData);
    const missingFields = headers
      .slice(0, -1)
      .filter((header) => !patientKeys.includes(header));

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing patient data fields",
          message: `Missing fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Extract possible classes from the dataset (last column is assumed to be the target)
    const classes = new Set<string>();
    dataRows.forEach((row) => {
      const columns = row.split(",");
      if (columns.length === headers.length) {
        classes.add(columns[columns.length - 1].trim());
      }
    });

    const classArray = Array.from(classes);

    if (classArray.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No classes found",
          message: "Unable to determine classes from the dataset",
        },
        { status: 400 }
      );
    }

    // TENSORFLOW.JS SIMULATION
    // In a real implementation, you would:
    // 1. Load a pre-trained model or train one on the dataset
    // 2. Preprocess the patient data
    // 3. Make a prediction using the model
    // 4. Return the result with confidence scores

    // For simulation purposes, we'll create a dummy classification
    const prediction = await simulateClassification(
      patientData,
      classArray,
      headers.slice(0, -1)
    );

    const result: ClassificationResult = {
      prediction: prediction.class,
      confidence: prediction.confidence,
      timestamp: new Date().toISOString(),
      datasetUsed: datasetName,
      patientData,
    };

    console.log(`Classification completed for dataset: ${datasetName}`);
    console.log(
      `Prediction: ${result.prediction} (${(result.confidence * 100).toFixed(
        2
      )}% confidence)`
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: `Classification completed successfully`,
    });
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

/**
 * Simulates a TensorFlow.js classification
 * In production, this would be replaced with actual model inference
 */
async function simulateClassification(
  patientData: PatientData,
  classes: string[],
  features: string[]
): Promise<{ class: string; confidence: number }> {
  // Simulate model loading delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simple heuristic-based classification for demonstration
  // In reality, this would use a trained neural network

  let score = 0;
  let featureCount = 0;

  // Calculate a simple score based on numerical features
  for (const feature of features) {
    const value = patientData[feature];
    if (
      typeof value === "number" ||
      (typeof value === "string" && !isNaN(Number(value)))
    ) {
      const numValue = Number(value);

      // Simple scoring logic (this would be replaced by actual model)
      if (feature.toLowerCase().includes("age") && numValue > 50) score += 0.3;
      if (feature.toLowerCase().includes("size") && numValue > 2) score += 0.2;
      if (feature.toLowerCase().includes("grade") && numValue > 2) score += 0.4;
      if (feature.toLowerCase().includes("stage") && numValue > 1) score += 0.5;

      featureCount++;
    }
  }

  // Normalize score and add some randomness for realism
  score = Math.min(score + Math.random() * 0.3, 1);

  // Determine prediction based on score
  let prediction: string;
  let confidence: number;

  if (classes.includes("malignant") && classes.includes("benign")) {
    prediction = score > 0.5 ? "malignant" : "benign";
    confidence =
      score > 0.5 ? 0.7 + Math.random() * 0.25 : 0.6 + Math.random() * 0.3;
  } else if (classes.some((c) => c.toLowerCase().includes("positive"))) {
    prediction =
      classes.find((c) =>
        c.toLowerCase().includes(score > 0.5 ? "positive" : "negative")
      ) || classes[0];
    confidence = 0.65 + Math.random() * 0.3;
  } else {
    // Random classification for unknown class structure
    prediction = classes[Math.floor(Math.random() * classes.length)];
    confidence = 0.6 + Math.random() * 0.35;
  }

  return {
    class: prediction,
    confidence: Math.min(confidence, 0.95), // Cap confidence at 95%
  };
}
