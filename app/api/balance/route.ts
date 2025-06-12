import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { ApiResponse, BalanceResult } from "@/types";

/**
 * POST /api/balance
 * Applies SMOTE-like balancing algorithm to the specified dataset
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<BalanceResult>>> {
  try {
    const { datasetName } = await request.json();

    if (!datasetName) {
      return NextResponse.json(
        {
          success: false,
          error: "Dataset name required",
          message: "Please provide a dataset name",
        },
        { status: 400 }
      );
    }

    const datasetsDir = path.join(process.cwd(), "datasets");
    const originalFilePath = path.join(datasetsDir, datasetName);

    // Check if original file exists
    try {
      await fs.access(originalFilePath);
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

    // Read the original CSV file
    const content = await fs.readFile(originalFilePath, "utf-8");
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

    const headers = lines[0];
    const dataRows = lines.slice(1);

    // SMOTE Simulation: Assume the last column is the target class
    // Find the minority class and duplicate some records to balance the dataset
    const parsedData = dataRows.map((row) => {
      const columns = row.split(",");
      return {
        data: columns.slice(0, -1),
        label: columns[columns.length - 1].trim(),
      };
    });

    // Count class distribution
    const classCount: { [key: string]: number } = {};
    parsedData.forEach((row) => {
      classCount[row.label] = (classCount[row.label] || 0) + 1;
    });

    // Find majority class count
    const maxCount = Math.max(...Object.values(classCount));

    // Create balanced dataset by duplicating minority class samples
    const balancedData: typeof parsedData = [...parsedData];

    Object.keys(classCount).forEach((className) => {
      const currentCount = classCount[className];
      const needToAdd = maxCount - currentCount;

      if (needToAdd > 0) {
        // Get samples from this class
        const classSamples = parsedData.filter(
          (row) => row.label === className
        );

        // Add synthetic samples (simple duplication with slight variation)
        for (let i = 0; i < needToAdd; i++) {
          const randomSample =
            classSamples[Math.floor(Math.random() * classSamples.length)];

          // Create a slight variation (SMOTE simulation)
          const syntheticSample = {
            data: randomSample.data.map((value) => {
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                // Add small random noise for numerical values
                const noise = (Math.random() - 0.5) * 0.1 * numValue;
                return (numValue + noise).toFixed(4);
              }
              return value; // Keep non-numeric values as is
            }),
            label: randomSample.label,
          };

          balancedData.push(syntheticSample);
        }
      }
    });

    // Convert back to CSV format
    const balancedRows = balancedData.map((row) =>
      [...row.data, row.label].join(",")
    );
    const balancedContent = [headers, ...balancedRows].join("\n");

    // Generate balanced file name
    const baseName = path.basename(datasetName, ".csv");
    const balancedFileName = `${baseName}_balanced.csv`;
    const balancedFilePath = path.join(datasetsDir, balancedFileName);

    // Save the balanced dataset
    await fs.writeFile(balancedFilePath, balancedContent);

    const result: BalanceResult = {
      originalFile: datasetName,
      balancedFile: balancedFileName,
      originalRows: dataRows.length,
      balancedRows: balancedData.length,
      operation: "SMOTE-like balancing applied",
    };

    console.log(
      `Dataset balanced successfully: ${datasetName} -> ${balancedFileName}`
    );
    console.log(
      `Original rows: ${result.originalRows}, Balanced rows: ${result.balancedRows}`
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: `Dataset balanced successfully. Original: ${result.originalRows} rows, Balanced: ${result.balancedRows} rows`,
    });
  } catch (error) {
    console.error("Error balancing dataset:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Balancing failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
