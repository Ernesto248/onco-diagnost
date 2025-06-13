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
    } catch (_error) {
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

/**
 * DELETE /api/datasets
 * Deletes a specific dataset file
 */
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ fileName: string }>>> {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("fileName");

    if (!fileName) {
      return NextResponse.json(
        {
          success: false,
          error: "File name required",
          message: "Por favor proporciona el nombre del archivo a eliminar",
        },
        { status: 400 }
      );
    }

    const datasetsDir = path.join(process.cwd(), "datasets");
    const filePath = path.join(datasetsDir, fileName);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (_error) {
      return NextResponse.json(
        {
          success: false,
          error: "File not found",
          message: `El archivo "${fileName}" no fue encontrado`,
        },
        { status: 404 }
      );
    }

    // Validate file is in datasets directory (security check)
    const resolvedPath = path.resolve(filePath);
    const resolvedDatasetsDir = path.resolve(datasetsDir);

    if (!resolvedPath.startsWith(resolvedDatasetsDir)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file path",
          message: "Ruta de archivo inválida",
        },
        { status: 400 }
      );
    }

    // Delete the file
    await fs.unlink(filePath);

    console.log(`Dataset deleted successfully: ${fileName}`);

    return NextResponse.json({
      success: true,
      data: { fileName },
      message: `Dataset "${fileName}" eliminado exitosamente`,
    });
  } catch (error) {
    console.error("Error deleting dataset:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Delete failed",
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al eliminar el archivo",
      },
      { status: 500 }
    );
  }
}
