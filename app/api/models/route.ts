import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface ModelInfo {
  name: string;
  path: string;
  trainedAt?: string;
}

export async function GET() {
  const modelsDir = path.join(process.cwd(), "models");
  let models: ModelInfo[] = [];
  try {
    const dirs = await fs.readdir(modelsDir, { withFileTypes: true });
    for (const dirent of dirs) {
      if (dirent.isDirectory()) {
        const modelPath = path.join(modelsDir, dirent.name);
        const modelJson = path.join(modelPath, "model.json");
        const metadataJson = path.join(modelPath, "metadata.json");
        try {
          await fs.access(modelJson);
          await fs.access(metadataJson);
          // Leer fecha de entrenamiento si existe
          let trainedAt: string | undefined = undefined;
          try {
            const metadata = JSON.parse(
              await fs.readFile(metadataJson, "utf-8")
            );
            trainedAt = metadata.timestamp || undefined;
          } catch {}
          models.push({ name: dirent.name, path: modelPath, trainedAt });
        } catch {}
      }
    }
    return NextResponse.json({
      success: true,
      data: models,
      message: models.length
        ? "Modelos entrenados encontrados."
        : "No hay modelos entrenados disponibles.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: [],
        message: "Error al listar modelos entrenados.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
