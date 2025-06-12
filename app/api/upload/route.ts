import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { ApiResponse } from "@/types";

/**
 * POST /api/upload
 * Handles CSV file upload with validation
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ fileName: string }>>> {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
          message: "Please select a file to upload",
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type",
          message: "Only CSV files are allowed",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "File too large",
          message: "File size must be less than 10MB",
        },
        { status: 400 }
      );
    }

    // Ensure datasets directory exists
    const datasetsDir = path.join(process.cwd(), "datasets");
    try {
      await fs.access(datasetsDir);
    } catch (error) {
      await fs.mkdir(datasetsDir, { recursive: true });
    }

    // Generate unique filename if file already exists
    let fileName = file.name;
    let filePath = path.join(datasetsDir, fileName);
    let counter = 1;

    while (true) {
      try {
        await fs.access(filePath);
        // File exists, generate new name
        const baseName = path.basename(fileName, ".csv");
        fileName = `${baseName}_${counter}.csv`;
        filePath = path.join(datasetsDir, fileName);
        counter++;
      } catch (error) {
        // File doesn't exist, we can use this name
        break;
      }
    }

    // Read file content and validate it's a proper CSV
    const arrayBuffer = await file.arrayBuffer();
    const content = new TextDecoder().decode(arrayBuffer);

    // Basic CSV validation - check if it has headers and at least one row of data
    const lines = content.trim().split("\n");
    if (lines.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid CSV format",
          message: "CSV file must contain headers and at least one row of data",
        },
        { status: 400 }
      );
    }

    // Check if first line looks like headers (no pure numbers)
    const headers = lines[0].split(",");
    if (headers.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid CSV format",
          message: "CSV file must contain at least 2 columns",
        },
        { status: 400 }
      );
    }

    // Save the file
    await fs.writeFile(filePath, content);

    console.log(`File uploaded successfully: ${fileName}`);

    return NextResponse.json({
      success: true,
      data: { fileName },
      message: `File "${fileName}" uploaded successfully`,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Upload failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
