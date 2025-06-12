# OncoDiag - Configuración de Desarrollo

## Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME=OncoDiag
NEXT_PUBLIC_APP_VERSION=1.0.0

# Configuración de archivos
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.csv
DATASETS_DIR=./datasets

# Configuración de TensorFlow.js
TF_BACKEND=cpu
TF_LOG_LEVEL=WARN

# URLs de desarrollo
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Scripts de Desarrollo

### Comandos Disponibles

```bash
# Desarrollo
pnpm dev                    # Servidor de desarrollo
pnpm build                  # Build de producción
pnpm start                  # Servidor de producción
pnpm lint                   # Linting
pnpm type-check            # Verificación de tipos

# Utilidades de desarrollo
node scripts/dev-utils.js create-sample-data    # Crear datos de muestra
node scripts/dev-utils.js clean-datasets        # Limpiar datasets
node scripts/dev-utils.js check-health          # Verificar salud
```

### Testing

```bash
# Pruebas manuales de API
curl http://localhost:3000/api/datasets
curl http://localhost:3000/api/schema/breast_cancer.csv
curl -X POST http://localhost:3000/api/balance -H "Content-Type: application/json" -d '{"datasetName":"breast_cancer.csv"}'
```

## Estructura de Datos

### Formato de Dataset CSV

```csv
age,tumor_size,grade,stage,lymph_nodes,diagnosis
45,2.1,2,1,0,benign
52,3.5,3,2,1,malignant
```

**Requisitos:**

- Primera fila: encabezados
- Última columna: clase objetivo (diagnosis)
- Valores numéricos para características
- Mínimo 2 columnas, 2 filas

### Respuestas de API

```typescript
// GET /api/datasets
interface DatasetsResponse {
  success: boolean;
  data: Dataset[];
  message?: string;
}

// GET /api/schema/[name]
interface SchemaResponse {
  success: boolean;
  data: {
    columns: string[];
    datasetName: string;
    totalColumns: number;
  };
}

// POST /api/classify
interface ClassifyResponse {
  success: boolean;
  data: {
    prediction: string;
    confidence: number;
    timestamp: string;
    datasetUsed: string;
  };
}
```

## Configuración de TensorFlow.js

### Para Desarrollo (Cliente)

```typescript
import * as tf from "@tensorflow/tfjs";

// Configurar backend
await tf.ready();
console.log("TensorFlow.js backend:", tf.getBackend());
```

### Para Producción (Servidor)

```typescript
import "@tensorflow/tfjs-node";
import * as tf from "@tensorflow/tfjs";

// Modelo personalizado
const model = tf.sequential({
  layers: [
    tf.layers.dense({ inputShape: [features], units: 64, activation: "relu" }),
    tf.layers.dense({ units: 32, activation: "relu" }),
    tf.layers.dense({ units: 1, activation: "sigmoid" }),
  ],
});
```

## Deployment

### Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Variables de Entorno de Producción

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://oncodiag.example.com
TF_BACKEND=cpu
MAX_FILE_SIZE=10485760
```

## Monitoreo y Logs

### Logging

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data);
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, data);
  },
};
```

### Métricas

```typescript
// Ejemplo de métricas básicas
const metrics = {
  datasetsUploaded: 0,
  classificationsPerformed: 0,
  averageConfidence: 0,
  errorRate: 0,
};
```

## Seguridad

### Validación de Archivos

```typescript
// Validar tipo MIME
const validMimeTypes = ["text/csv", "application/csv"];
if (!validMimeTypes.includes(file.type)) {
  throw new Error("Tipo de archivo no válido");
}

// Validar contenido CSV
const csvPattern = /^[\w\s,.-]+$/;
if (!csvPattern.test(content)) {
  throw new Error("Contenido CSV inválido");
}
```

### Rate Limiting

```typescript
// middleware/rateLimit.ts
import { NextRequest } from "next/server";

const requests = new Map();

export function rateLimit(req: NextRequest) {
  const ip = req.ip || "unknown";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutos
  const maxRequests = 100;

  const requestLog = requests.get(ip) || [];
  const recentRequests = requestLog.filter(
    (time: number) => now - time < windowMs
  );

  if (recentRequests.length >= maxRequests) {
    throw new Error("Rate limit exceeded");
  }

  recentRequests.push(now);
  requests.set(ip, recentRequests);
}
```

## Troubleshooting Avanzado

### Problemas de Memoria

```typescript
// Optimizar procesamiento de archivos grandes
const processLargeCSV = async (filePath: string) => {
  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: stream });

  for await (const line of rl) {
    // Procesar línea por línea
    processLine(line);
  }
};
```

### Debug de TensorFlow.js

```typescript
// Habilitar logs detallados
tf.env().set("DEBUG", true);

// Verificar memoria GPU
console.log("Memoria GPU:", tf.memory());

// Profiling
const profile = await tf.profile(() => {
  return model.predict(inputTensor);
});
```

### Verificación de Integridad

```bash
# Verificar archivos de sistema
ls -la datasets/
du -sh datasets/*

# Logs de aplicación
tail -f .next/trace
```
