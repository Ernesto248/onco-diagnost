# 📖 OncoDiag - Guía de Uso para IA

## Introducción

Esta guía está diseñada para que un agente de IA pueda comprender completamente la funcionalidad de la aplicación OncoDiag. Describe cada pantalla, cada componente de la interfaz de usuario (UI) y el propósito de cada botón o campo interactivo.

---

## 1. Navegación Principal y Dashboard

La aplicación utiliza un diseño de dashboard con una barra de navegación lateral (o un menú de hamburguesa en dispositivos móviles) para acceder a las diferentes secciones.

### 1.1. Barra de Navegación (`app/dashboard/layout.tsx`)

- **Componente Principal**: Un menú lateral persistente en la vista de escritorio y un menú superior con un botón de hamburguesa en la vista móvil.
- **Botones de Navegación**:
  - **Clasificar**: Navega a `/dashboard/classify`. Permite a los usuarios realizar predicciones de diagnóstico en base a un modelo entrenado.
  - **Entrenar Modelo**: Navega a `/dashboard/train`. Permite a los usuarios entrenar un nuevo modelo de IA a partir de un dataset.
  - **Balancear Dataset**: Navega a `/dashboard/balance`. Permite a los usuarios corregir el desbalance de clases en un dataset.
  - **Datasets**: Navega a `/dashboard/datasets`. Permite a los usuarios ver y gestionar los datasets cargados.

---

## 2. Pantalla de Clasificación (`app/dashboard/classify/page.tsx`)

### 2.1. Propósito

Esta pantalla es el corazón de la herramienta de diagnóstico. Aquí, un especialista médico puede introducir los datos de un paciente en un formulario dinámico y obtener una clasificación de riesgo de cáncer basada en un modelo de IA previamente entrenado.

### 2.2. Componentes y Flujo de Trabajo

1.  **Selector de Modelo**:

    - **UI**: Un menú desplegable (`<select>`).
    - **ID**: `model-selector`
    - **Poblado por**: Llama a la API `GET /api/models` para obtener la lista de modelos entrenados disponibles.
    - **Acción**: Al seleccionar un modelo, el sistema:
      1.  Llama a `GET /api/schema/{modelName}` para obtener el esquema de datos (campos, tipos, valores permitidos) que el modelo espera.
      2.  Renderiza dinámicamente un formulario con los campos correspondientes.

2.  **Formulario de Datos del Paciente**:

    - **UI**: Un formulario (`<form>`) con campos generados dinámicamente. Cada campo tiene:
      - Un `label` claro (ej. "Age", "Tumor Size").
      - Un `input` del tipo adecuado (numérico, de texto, o un `select` para valores categóricos).
    - **Acción**: El usuario rellena todos los campos con la información del paciente.

3.  **Botón de Clasificar**:

    - **UI**: Un botón (`<button>`).
    - **ID**: `classify-button`
    - **Acción**:
      1.  Al hacer clic, se recopilan los datos del formulario.
      2.  Se realiza una llamada `POST` a la API `/api/classify`.
      3.  **Payload**: `{ "modelName": "nombre_del_modelo", "features": { "campo1": valor1, "campo2": valor2 } }`
      4.  El botón se deshabilita y muestra un estado de "cargando" mientras espera la respuesta.

4.  **Tarjeta de Resultados**:
    - **UI**: Un componente condicional que se muestra tras una clasificación exitosa.
    - **Contenido**:
      - **Porcentaje de Riesgo**: Un número grande y destacado (ej. "87%").
      - **Diagnóstico**: El nombre real de la condición (ej. "Cáncer de Pulmón").
      - **Etiqueta de Riesgo**: Una insignia (badge) que indica "Bajo Riesgo", "Riesgo Moderado" o "Alto Riesgo".
      - **Desglose de Probabilidades**: Barras de progreso (`ProgressBar`) que muestran la probabilidad para cada posible clase de resultado (ej. "Benigno" vs. "Maligno").

---

## 3. Pantalla de Entrenamiento de Modelo (`app/dashboard/train/page.tsx`)

### 3.1. Propósito

Permite a los usuarios crear y entrenar un nuevo modelo de machine learning a partir de un dataset existente.

### 3.2. Componentes y Flujo de Trabajo

1.  **Selector de Dataset**:

    - **UI**: Un menú desplegable (`<select>`).
    - **ID**: `dataset-selector`
    - **Poblado por**: Llama a `GET /api/datasets` para listar los archivos CSV disponibles.
    - **Acción**: Al seleccionar un dataset, se obtienen sus columnas para poblar el selector de la columna objetivo.

2.  **Selector de Columna Objetivo (Target)**:

    - **UI**: Un menú desplegable (`<select>`).
    - **ID**: `target-column-selector`
    - **Poblado por**: Las columnas del dataset seleccionado.
    - **Acción**: El usuario elige la columna que el modelo debe aprender a predecir (ej. "diagnosis").

3.  **Campo de Nombre del Modelo**:

    - **UI**: Un campo de texto (`<input type="text">`).
    - **ID**: `model-name-input`
    - **Acción**: El usuario introduce un nombre único para el nuevo modelo.

4.  **Botón de Entrenar Modelo**:
    - **UI**: Un botón (`<button>`).
    - **ID**: `train-button`
    - **Acción**:
      1.  Realiza una llamada `POST` a la API `/api/train`.
      2.  **Payload**: `{ "datasetName": "nombre.csv", "modelName": "nuevo_modelo", "targetColumn": "columna_objetivo" }`
      3.  El sistema inicia el proceso de entrenamiento en el backend. La UI muestra un estado de "Entrenando..." y una barra de progreso.
      4.  Al finalizar, se muestra un mensaje de éxito o error.

---

## 4. Pantalla de Balanceo de Dataset (`app/dashboard/balance/page.tsx`)

### 4.1. Propósito

Proporciona una herramienta para corregir el desbalance de clases en un dataset, lo cual es crucial para entrenar modelos de IA precisos.

### 4.2. Componentes y Flujo de Trabajo

1.  **Selector de Dataset**:

    - **UI**: Un menú desplegable (`<select>`).
    - **ID**: `dataset-selector`
    - **Poblado por**: Llama a `GET /api/datasets`.
    - **Acción**: Al seleccionar un dataset, se obtienen sus columnas.

2.  **Selector de Columna Objetivo (Target)**:

    - **UI**: Un menú desplegable (`<select>`).
    - **ID**: `target-column-selector`
    - **Acción**: El usuario elige la columna que contiene las clases a balancear.

3.  **Botón de Balancear**:
    - **UI**: Un botón (`<button>`).
    - **ID**: `balance-button`
    - **Acción**:
      1.  Realiza una llamada `POST` a la API `/api/balance`.
      2.  **Payload**: `{ "fileName": "nombre.csv", "targetColumn": "columna_objetivo" }`
      3.  El backend genera un nuevo archivo CSV con el sufijo `_balanced`.
      4.  La UI muestra un mensaje de éxito indicando el nombre del nuevo archivo.

---

## 5. Pantalla de Datasets (`app/dashboard/datasets/page.tsx`)

### 5.1. Propósito

Permite la carga y gestión de los datasets que se usarán para entrenamiento y balanceo.

### 5.2. Componentes y Flujo de Trabajo

1.  **Área de Carga de Archivos (Drag & Drop)**:

    - **UI**: Una zona designada para arrastrar y soltar archivos.
    - **Acción**:
      1.  El usuario arrastra un archivo CSV a esta zona o hace clic para abrir el selector de archivos.
      2.  El archivo se envía al backend a través de una llamada `POST` a `/api/upload`.
      3.  La UI muestra el progreso de la carga.

2.  **Lista de Datasets Existentes**:
    - **UI**: Una tabla o lista que muestra los datasets cargados.
    - **Poblado por**: Llama a `GET /api/datasets`.
    - **Contenido**: Muestra el nombre de cada archivo CSV en el directorio `/datasets`.
