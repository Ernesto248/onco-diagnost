# OncoDiagnost — Plataforma de Diagnóstico Asistido de Cáncer

Plataforma web para el diagnóstico oncológico asistido por inteligencia artificial. Permite a especialistas médicos cargar bases de datos clínicas, balancearlas con el algoritmo **SMOTE-COV** (matriz de covarianza Ledoit-Wolf), entrenar modelos reales de machine learning (**KNN, MLP, C4.5**) con **scikit-learn**, y clasificar pacientes con predicciones basadas en modelos entrenados.

Desarrollada como trabajo de tesis en la Universidad de Camagüey "Ignacio Agramonte Loynaz".

---

## Arquitectura

```
┌──────────────────────┐       HTTP/REST        ┌──────────────────────────┐
│   Next.js :3000       │ ◄──────────────────► │   FastAPI :8000           │
│   (Frontend SPA)      │       JSON            │   (Backend Python)        │
│                       │                       │                           │
│  • Tailwind CSS       │                       │  • SMOTE-COV (Ledoit-Wolf)│
│  • React 19           │                       │  • scikit-learn (KNN/MLP/ │
│  • TypeScript         │                       │    C4.5)                  │
│  • jsPDF              │                       │  • SQLite                 │
└──────────────────────┘                       └──────────┬───────────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │  SQLite + Archivos│
                                                  │  datasets/        │
                                                  │  models/ (.pkl)   │
                                                  └─────────────────┘
```

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| Backend | FastAPI (Python 3.13), Uvicorn |
| ML / Balanceo | scikit-learn, SMOTE-COV (Ledoit-Wolf), imbalanced-learn |
| Base de datos | SQLite |
| PDF | jsPDF |
| Validación | Zod (frontend), Pydantic (backend) |
| Package manager | pnpm (frontend), pip (backend) |

---

## Prerrequisitos

- **Node.js** 18+ y **pnpm**
- **Python** 3.11+ con pip
- Carpeta `Smote/` con el algoritmo `SmoteCovPy.py` (ver [Configuración de SMOTE-COV](#configuración-de-smote-cov))

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Ernesto248/onco-diagnost.git
cd onco-diagnost
```

### 2. Instalar dependencias del frontend

```bash
pnpm install
```

### 3. Instalar dependencias del backend

```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 4. Configurar SMOTE-COV

El backend espera encontrar `SmoteCovPy.py` en una carpeta `Smote/` accesible desde el sistema. Por defecto, la ruta configurada es:

```
C:\Users\mleon\code\tesis\Smote\SmoteCovPy.py
```

Para usar una ruta diferente, edita la variable `SMOTE_PATH` en:

```
backend/services/smote_cov.py  →  línea 6
```

Si no tienes acceso al archivo original, copia `SmoteCovPy.py` a la carpeta `backend/services/` y ajusta la ruta a:

```python
SMOTE_PATH = Path(__file__).parent
```

### 5. Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto (ya existe uno por defecto):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=OncoDiagnost
```

---

## Ejecución

Necesitas **dos terminales**:

### Terminal 1 — Backend FastAPI

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Debes ver:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

El flag `--reload` reinicia el servidor automáticamente al detectar cambios en el código.

### Terminal 2 — Frontend Next.js

```bash
pnpm dev
```

Debes ver:
```
▲ Next.js 15.x
- Local:        http://localhost:3000
```

---

## Flujo de Trabajo

### 1. Subir dataset (`/dashboard/datasets`)

- Login: `admin` / `admin`
- Arrastra o selecciona un archivo CSV
- El sistema valida formato, calcula IR y muestra metadata

**Formato esperado del CSV:**
- Columnas numéricas (excepto la última, que es la clase)
- Clasificación binaria (2 clases en la última columna)
- Sin filas con valores nulos

### 2. Balancear (`/dashboard/balance`)

- Selecciona un dataset original (IR > 1.5)
- El backend ejecuta **SMOTE-COV** (Ledoit-Wolf + distribución normal multivariada)
- Genera instancias sintéticas que preservan la estructura de covarianza
- Si IR ≤ 1.5, se copia el dataset sin cambios (`synthetic_added: 0`)

### 3. Entrenar modelo (`/dashboard/train`)

- Selecciona un dataset (original o balanceado)
- Elige clasificador: **KNN**, **MLP** o **C4.5**
- El backend entrena con **scikit-learn** y validación cruzada 5-fold
- Guarda el modelo como `model.pkl` + `scaler.pkl` + `metadata.json`
- Muestra métricas: AUC y F1-Score

### 4. Clasificar paciente (`/dashboard/classify`)

- Selecciona un modelo entrenado
- El formulario se genera dinámicamente con las features del modelo
- Llena los datos clínicos del paciente
- Obtén predicción, nivel de confianza, y probabilidades por clase
- Opción de exportar reporte en PDF

---

## API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/datasets` | Listar todos los datasets con metadata |
| `POST` | `/api/upload` | Subir archivo CSV (multipart/form-data) |
| `DELETE` | `/api/datasets/{id}` | Eliminar dataset por ID |
| `POST` | `/api/balance` | Balancear dataset con SMOTE-COV `{ dataset_id }` |
| `POST` | `/api/train` | Entrenar clasificador `{ dataset_id, classifier, balanced_by }` |
| `GET` | `/api/models` | Listar modelos entrenados |
| `POST` | `/api/classify` | Clasificar paciente `{ model_id, patient_data }` |
| `GET` | `/api/schema/{name}` | Obtener columnas de un CSV |

---

## Estructura del Proyecto

```
onco-diagnost/
├── app/                          # Frontend Next.js
│   ├── dashboard/
│   │   ├── datasets/page.tsx     # Gestión de datasets
│   │   ├── balance/page.tsx      # Balanceo SMOTE-COV
│   │   ├── train/page.tsx        # Entrenamiento ML
│   │   ├── classify/page.tsx     # Clasificación de pacientes
│   │   ├── layout.tsx            # Layout con sidebar
│   │   └── components/           # ProgressBar
│   ├── components/
│   │   └── AuthGuard.tsx         # Login
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Splash page
├── lib/
│   ├── api.ts                    # Cliente HTTP unificado
│   ├── constants.ts
│   └── utils.ts
├── types/
│   └── index.ts                  # Tipos TypeScript
├── datasets/                     # Datasets de ejemplo
├── models/                       # Modelos pre-entrenados (JSON)
│
├── backend/                      # Backend FastAPI
│   ├── main.py                   # App FastAPI + CORS
│   ├── database.py               # SQLite init + conexión
│   ├── schemas.py                # Pydantic schemas
│   ├── requirements.txt          # Dependencias Python
│   ├── routers/
│   │   ├── datasets.py           # Upload, list, delete
│   │   ├── balance.py            # SMOTE-COV balance
│   │   ├── train.py              # Entrenamiento ML
│   │   ├── classify.py           # Clasificación
│   │   └── models.py            # Listar modelos
│   ├── services/
│   │   ├── smote_cov.py          # Wrapper SMOTE-COV
│   │   └── classifier.py         # KNN/MLP/C4.5
│   └── data/                     # Datos locales (no commiteado)
│       ├── uploads/              # CSVs subidos
│       ├── balanced/             # CSVs balanceados
│       └── models/               # Modelos .pkl
│
├── package.json
├── next.config.ts
└── .env.local
```

---

## SmoteCovPy — Dependencia Externa

El algoritmo **SMOTE-COV** fue desarrollado en la Universidad de Camagüey. El backend importa `SmoteCovPy.py` como módulo externo. Asegúrate de:

1. Tener el archivo `SmoteCovPy.py` accesible
2. Ajustar `SMOTE_PATH` en `backend/services/smote_cov.py` a la ruta correcta
3. El archivo requiere `scikit-learn` instalado (incluido en `requirements.txt`)

---

## Advertencia Médica

**IMPORTANTE:** Esta aplicación es una herramienta de **apoyo diagnóstico** y no debe usarse como único criterio para diagnósticos médicos. Las predicciones deben ser interpretadas por profesionales médicos cualificados.

---

## Licencia

Este proyecto es parte de un trabajo de tesis académico. Consultar con los autores antes de su uso en producción.

---

## Autor

**Jenifer Casalis Chau** — Universidad de Camagüey "Ignacio Agramonte Loynaz"

Facultad de Informática y Ciencias Exactas — Curso 2024-2025
