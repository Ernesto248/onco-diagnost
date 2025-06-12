import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { ApiResponse, Dataset } from "@/types";

/**
 * GET /api/datasets
 * Returns a list of all available datasets in the datasets directory
 */
export async function GET(): Promise<NextResponse<ApiResponse<Dataset[]>>> {
  try {
    const datasetsDir = path.join(process.cwd(), "datasets");

    // Ensure datasets directory exists
    try {
      await fs.access(datasetsDir);
    } catch (error) {
      // Create directory if it doesn't exist
      await fs.mkdir(datasetsDir, { recursive: true });
      return NextResponse.json({
        success: true,
        data: [],
        message: "Datasets directory created. No datasets found.",
      });
    }

    // Read all files in the datasets directory
    const files = await fs.readdir(datasetsDir);

    // Filter only CSV files and get their stats
    const datasets: Dataset[] = [];

    for (const file of files) {
      if (path.extname(file).toLowerCase() === ".csv") {
        const filePath = path.join(datasetsDir, file);
        const stats = await fs.stat(filePath);

        datasets.push({
          name: file,
          path: filePath,
          size: stats.size,
          uploadDate: stats.birthtime.toISOString(),
          isBalanced: file.includes("_balanced"),
        });
      }
    }

    // Sort datasets by upload date (newest first)
    datasets.sort(
      (a, b) =>
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );

    return NextResponse.json({
      success: true,
      data: datasets,
      message: `Found ${datasets.length} dataset(s)`,
    });
  } catch (error) {
    console.error("Error reading datasets directory:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to read datasets directory",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
