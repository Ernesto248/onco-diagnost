import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { ApiResponse, DatasetSchema } from "@/types";

/**
 * GET /api/schema/[datasetName]
 * Returns the schema (column names) of the specified dataset
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ datasetName: string }> }
): Promise<NextResponse<ApiResponse<DatasetSchema>>> {
  try {
    const { datasetName } = await params;

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

    // Decode the dataset name in case it contains special characters
    const decodedDatasetName = decodeURIComponent(datasetName);

    const datasetsDir = path.join(process.cwd(), "datasets");
    const filePath = path.join(datasetsDir, decodedDatasetName);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (_error) {
      return NextResponse.json(
        {
          success: false,
          error: "Dataset not found",
          message: `Dataset "${decodedDatasetName}" not found`,
        },
        { status: 404 }
      );
    }

    // Validate file extension
    if (!decodedDatasetName.toLowerCase().endsWith(".csv")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type",
          message: "Only CSV files are supported",
        },
        { status: 400 }
      );
    }

    // Read only the first line to get headers
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.trim().split("\n");

    if (lines.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Empty dataset",
          message: "The dataset file is empty",
        },
        { status: 400 }
      );
    }

    // Parse the header line
    const headerLine = lines[0];
    const rawColumns = headerLine.split(",");

    // Clean and validate column names
    const columns = rawColumns.map((col) =>
      col.trim().replace(/^["']|["']$/g, "")
    );

    // Validate that we have actual column names
    if (columns.length === 0 || columns.every((col) => col === "")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid headers",
          message: "The dataset must contain valid column headers",
        },
        { status: 400 }
      );
    }

    // Check for duplicate column names
    const uniqueColumns = new Set(columns);
    if (uniqueColumns.size !== columns.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Duplicate column names",
          message: "The dataset contains duplicate column names",
        },
        { status: 400 }
      );
    }

    const schema: DatasetSchema = {
      columns,
      datasetName: decodedDatasetName,
      totalColumns: columns.length,
    };

    console.log(
      `Schema retrieved for ${decodedDatasetName}: ${columns.length} columns`
    );

    return NextResponse.json({
      success: true,
      data: schema,
      message: `Schema retrieved successfully for "${decodedDatasetName}"`,
    });
  } catch (error) {
    console.error("Error reading dataset schema:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to read schema",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
