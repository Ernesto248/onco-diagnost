#!/usr/bin/env node

/**
 * Development utilities for OncoDiag
 *
 * Usage:
 *   node scripts/dev-utils.js create-sample-data
 *   node scripts/dev-utils.js clean-datasets
 *   node scripts/dev-utils.js check-health
 */

const fs = require("fs");
const path = require("path");

const DATASETS_DIR = path.join(__dirname, "../datasets");

// Sample datasets for testing
const SAMPLE_DATASETS = {
  "breast_cancer.csv": `age,tumor_size,grade,stage,lymph_nodes,diagnosis
45,2.1,2,1,0,benign
52,3.5,3,2,1,malignant
38,1.8,1,1,0,benign
61,4.2,4,3,3,malignant
29,1.2,1,1,0,benign
68,5.1,4,4,5,malignant
43,2.8,2,2,1,benign
55,3.9,3,3,2,malignant
41,2.3,2,1,0,benign
59,4.7,4,3,4,malignant
37,1.6,1,1,0,benign
66,5.3,4,4,6,malignant
48,2.9,3,2,1,malignant
33,1.4,1,1,0,benign
71,6.1,4,4,7,malignant`,

  "lung_cancer.csv": `age,smoking_years,tumor_diameter,stage,histology,diagnosis
67,45,3.2,2,adenocarcinoma,malignant
54,30,2.1,1,squamous,malignant
72,50,4.5,3,adenocarcinoma,malignant
45,0,1.8,1,benign,benign
59,35,3.8,2,squamous,malignant
38,0,1.2,1,benign,benign
63,40,4.1,3,adenocarcinoma,malignant
41,15,2.3,1,benign,benign
69,48,5.2,4,squamous,malignant
52,25,2.8,2,adenocarcinoma,malignant
36,0,1.5,1,benign,benign
74,55,6.1,4,squamous,malignant`,

  "prostate_cancer.csv": `age,psa_level,gleason_score,stage,volume,diagnosis
65,8.5,7,2,35,malignant
58,4.2,6,1,28,benign
72,15.3,8,3,45,malignant
51,2.1,5,1,22,benign
68,12.7,7,2,38,malignant
45,1.8,4,1,20,benign
74,22.4,9,4,52,malignant
55,3.6,5,1,25,benign
69,16.8,8,3,41,malignant
48,2.9,5,1,24,benign
71,19.2,8,3,47,malignant
42,1.5,4,1,18,benign`,
};

function createSampleData() {
  console.log("🔧 Creando datos de muestra...");

  // Ensure datasets directory exists
  if (!fs.existsSync(DATASETS_DIR)) {
    fs.mkdirSync(DATASETS_DIR, { recursive: true });
    console.log("📁 Directorio datasets creado");
  }

  // Create sample CSV files
  Object.entries(SAMPLE_DATASETS).forEach(([filename, content]) => {
    const filepath = path.join(DATASETS_DIR, filename);
    fs.writeFileSync(filepath, content);
    console.log(`✅ Creado: ${filename}`);
  });

  console.log("✨ Datos de muestra creados exitosamente!");
  console.log(`📍 Ubicación: ${DATASETS_DIR}`);
}

function cleanDatasets() {
  console.log("🧹 Limpiando directorio de datasets...");

  if (fs.existsSync(DATASETS_DIR)) {
    const files = fs.readdirSync(DATASETS_DIR);
    files.forEach((file) => {
      if (file.endsWith(".csv")) {
        fs.unlinkSync(path.join(DATASETS_DIR, file));
        console.log(`🗑️  Eliminado: ${file}`);
      }
    });
  }

  console.log("✨ Directorio limpio!");
}

function checkHealth() {
  console.log("🏥 Verificando salud de la aplicación...");

  const checks = [
    {
      name: "Directorio datasets",
      check: () => fs.existsSync(DATASETS_DIR),
      fix: () => fs.mkdirSync(DATASETS_DIR, { recursive: true }),
    },
    {
      name: "Archivo types/index.ts",
      check: () => fs.existsSync(path.join(__dirname, "../types/index.ts")),
    },
    {
      name: "APIs principales",
      check: () => {
        const apiRoutes = [
          "app/api/datasets/route.ts",
          "app/api/upload/route.ts",
          "app/api/balance/route.ts",
          "app/api/classify/route.ts",
        ];
        return apiRoutes.every((route) =>
          fs.existsSync(path.join(__dirname, "..", route))
        );
      },
    },
    {
      name: "Páginas del dashboard",
      check: () => {
        const pages = [
          "app/dashboard/datasets/page.tsx",
          "app/dashboard/balance/page.tsx",
          "app/dashboard/classify/page.tsx",
        ];
        return pages.every((page) =>
          fs.existsSync(path.join(__dirname, "..", page))
        );
      },
    },
  ];

  let allHealthy = true;

  checks.forEach(({ name, check, fix }) => {
    const isHealthy = check();
    const status = isHealthy ? "✅" : "❌";
    console.log(`${status} ${name}`);

    if (!isHealthy) {
      allHealthy = false;
      if (fix) {
        console.log(`🔧 Intentando reparar ${name}...`);
        try {
          fix();
          console.log(`✅ ${name} reparado`);
        } catch (error) {
          console.log(`❌ No se pudo reparar ${name}: ${error.message}`);
        }
      }
    }
  });

  if (allHealthy) {
    console.log("🎉 ¡Aplicación saludable!");
  } else {
    console.log("⚠️  Se encontraron algunos problemas");
  }
}

// Main execution
const command = process.argv[2];

switch (command) {
  case "create-sample-data":
    createSampleData();
    break;
  case "clean-datasets":
    cleanDatasets();
    break;
  case "check-health":
    checkHealth();
    break;
  default:
    console.log("🚀 Utilidades de desarrollo de OncoDiag");
    console.log("");
    console.log("Comandos disponibles:");
    console.log("  create-sample-data  - Crear datasets de muestra");
    console.log("  clean-datasets      - Limpiar directorio de datasets");
    console.log("  check-health        - Verificar salud de la aplicación");
    console.log("");
    console.log("Uso: node scripts/dev-utils.js <comando>");
}
