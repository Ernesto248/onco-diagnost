# Guía de Uso - OncoDiag

## 🚀 Inicio Rápido

### 1. Instalación y Configuración

```bash
# Instalar dependencias
pnpm install

# Aprobar build scripts de TensorFlow.js
pnpm approve-builds

# Iniciar servidor de desarrollo
pnpm dev
```

### 2. Acceso a la Aplicación

- **URL Local**: http://localhost:3000 (o puerto disponible)
- **Redirección Automática**: La página principal redirige al dashboard

## 📋 Funcionalidades Principales

### 1. Gestión de Datasets (`/dashboard/datasets`)

#### Subir Datasets

- **Formato**: Solo archivos CSV
- **Tamaño máximo**: 10MB
- **Requisitos**:
  - Debe contener encabezados
  - Mínimo 2 columnas
  - Al menos 1 fila de datos

#### Visualizar Datasets

- Lista todos los datasets disponibles
- Muestra información básica (nombre, tamaño, fecha)
- Identifica datasets balanceados vs originales

### 2. Balanceo de Datos (`/dashboard/balance`)

#### Proceso de Balanceo

1. Seleccionar dataset original
2. Aplicar algoritmo SMOTE simulado
3. Generar dataset balanceado con sufijo `_balanced`

#### Algoritmo SMOTE Implementado

- Identifica automáticamente la clase minoritaria
- Genera muestras sintéticas mediante interpolación
- Preserva características estadísticas originales
- Añade ruido controlado para variabilidad

### 3. Clasificación de Pacientes (`/dashboard/classify`)

#### Flujo de Clasificación

1. **Selección del Modelo**: Elegir dataset (original o balanceado)
2. **Carga del Esquema**: Obtención automática de columnas
3. **Formulario Dinámico**: Campos generados automáticamente
4. **Predicción**: Clasificación con TensorFlow.js simulado

#### Tipos de Campos Reconocidos

- `age/edad` → Campo numérico para edad
- `size/tamaño` → Campo numérico para tamaño
- `grade/grado` → Campo numérico para grado (1-4)
- `stage/estadio` → Campo numérico para estadio (1-4)
- Otros campos → Texto libre

## 🔧 Estructura del Proyecto

### Directorios Principales

```
app/
├── api/                    # API Routes
│   ├── datasets/          # GET datasets
│   ├── upload/            # POST upload CSV
│   ├── balance/           # POST balance dataset
│   ├── schema/[name]/     # GET dataset schema
│   └── classify/          # POST classify patient
├── dashboard/             # Dashboard pages
│   ├── datasets/          # Dataset management
│   ├── balance/           # Data balancing
│   └── classify/          # Patient classification
types/                     # TypeScript interfaces
lib/                       # Utilities and constants
datasets/                  # Uploaded CSV files
scripts/                   # Development utilities
```

### Archivos Clave

- `types/index.ts` - Interfaces TypeScript
- `lib/constants.ts` - Configuración de la aplicación
- `lib/utils.ts` - Funciones de utilidad
- `scripts/dev-utils.js` - Herramientas de desarrollo

## 🧪 Datos de Muestra

### Datasets Incluidos

1. **breast_cancer.csv** - Cáncer de mama
2. **lung_cancer.csv** - Cáncer de pulmón
3. **prostate_cancer.csv** - Cáncer de próstata
4. **sample_cancer_data.csv** - Datos generales

### Crear Más Datos de Muestra

```bash
node scripts/dev-utils.js create-sample-data
```

### Verificar Salud del Sistema

```bash
node scripts/dev-utils.js check-health
```

## 🌐 APIs Disponibles

### GET `/api/datasets`

- **Descripción**: Lista todos los datasets disponibles
- **Respuesta**: Array de objetos Dataset
- **Ejemplo**:

```json
{
  "success": true,
  "data": [
    {
      "name": "breast_cancer.csv",
      "size": 1024,
      "uploadDate": "2025-06-12T10:30:00Z",
      "isBalanced": false
    }
  ]
}
```

### POST `/api/upload`

- **Descripción**: Sube un archivo CSV
- **Formato**: multipart/form-data
- **Campo**: `file` (archivo CSV)
- **Validaciones**: Tipo, tamaño, formato

### POST `/api/balance`

- **Descripción**: Aplica balanceo SMOTE
- **Body**: `{ "datasetName": "archivo.csv" }`
- **Genera**: Archivo con sufijo `_balanced`

### GET `/api/schema/[datasetName]`

- **Descripción**: Obtiene esquema de un dataset
- **Parámetro**: Nombre del dataset
- **Respuesta**: Columnas y metadatos

### POST `/api/classify`

- **Descripción**: Clasifica datos de paciente
- **Body**:

```json
{
  "datasetName": "modelo.csv",
  "patientData": {
    "age": 45,
    "tumor_size": 2.1,
    "grade": 2
  }
}
```

## 🎯 Casos de Uso

### Caso 1: Nuevo Dataset

1. Subir CSV en `/dashboard/datasets`
2. Balancear en `/dashboard/balance`
3. Usar para clasificación en `/dashboard/classify`

### Caso 2: Clasificación de Paciente

1. Seleccionar modelo en `/dashboard/classify`
2. Llenar formulario con datos del paciente
3. Obtener predicción con nivel de confianza

### Caso 3: Análisis de Datos

1. Comparar rendimiento entre datasets originales y balanceados
2. Evaluar confianza de las predicciones
3. Analizar distribución de clases

## ⚠️ Consideraciones Importantes

### Limitaciones Actuales

- **TensorFlow.js**: Implementación simulada para demostración
- **Algoritmo SMOTE**: Versión simplificada
- **Validación**: Básica, expandible según necesidades

### Uso en Producción

- Implementar modelo real de TensorFlow.js
- Añadir validación médica robusta
- Incorporar autenticación y autorización
- Implementar logging y monitoreo

### Seguridad

- Validar todos los inputs
- Sanitizar datos de archivos
- Implementar rate limiting
- Usar HTTPS en producción

## 🔍 Troubleshooting

### Problemas Comunes

1. **TensorFlow.js no se instala**

   - Verificar configuración en package.json
   - Usar `pnpm approve-builds`

2. **Dataset no aparece**

   - Verificar formato CSV
   - Comprobar tamaño del archivo
   - Revisar permisos del directorio

3. **Formulario no se genera**
   - Verificar que el dataset existe
   - Comprobar formato de encabezados
   - Revisar logs de la consola

### Comandos Útiles

```bash
# Limpiar datasets
node scripts/dev-utils.js clean-datasets

# Reiniciar servidor
pnpm dev

# Verificar tipos
pnpm type-check
```

## 📚 Recursos Adicionales

- [Next.js Documentation](https://nextjs.org/docs)
- [TensorFlow.js Guide](https://www.tensorflow.org/js)
- [SMOTE Algorithm](https://en.wikipedia.org/wiki/SMOTE)
- [Medical AI Ethics](https://www.who.int/publications/i/item/9789240029200)

---

**Nota**: Esta aplicación está diseñada para fines educativos y de demostración. Para uso médico real, se requiere validación clínica y regulatoria apropiada.
