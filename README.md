# OncoDiag - Plataforma de Diagnóstico Asistido de Cáncer

Una plataforma web moderna desarrollada con Next.js y TypeScript para el diagnóstico asistido de cáncer utilizando machine learning.

## 🚀 Características

- **Gestión de Datasets**: Carga y visualización de datasets CSV médicos
- **Balanceo de Datos**: Algoritmo SMOTE para balancear datasets desbalanceados
- **Clasificación de Pacientes**: Formularios dinámicos para clasificación con TensorFlow.js
- **Interfaz Moderna**: UI responsiva y accesible con Tailwind CSS
- **Tipado Completo**: TypeScript en toda la aplicación

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Heroicons
- **Machine Learning**: TensorFlow.js
- **APIs**: Next.js API Routes
- **Validación**: Validación nativa de formularios

## 📁 Estructura del Proyecto

```
├── app/
│   ├── api/                    # API Routes
│   │   ├── datasets/          # Listar datasets
│   │   ├── upload/            # Subir archivos CSV
│   │   ├── balance/           # Balanceo SMOTE
│   │   ├── schema/            # Esquema de datasets
│   │   └── classify/          # Clasificación ML
│   ├── dashboard/             # Panel de control
│   │   ├── datasets/          # Gestión de datasets
│   │   ├── balance/           # Balanceo de datos
│   │   └── classify/          # Clasificación
│   ├── globals.css           # Estilos globales
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Página de inicio
├── types/
│   └── index.ts              # Tipos TypeScript
├── datasets/                 # Directorio de datasets (se crea automáticamente)
└── public/                   # Archivos estáticos
```

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18+
- pnpm (recomendado) o npm

### Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd onco-diagnost
   ```

2. **Instalar dependencias**

   ```bash
   pnpm install
   ```

3. **Ejecutar en modo desarrollo**

   ```bash
   pnpm dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

### Producción

```bash
pnpm build
pnpm start
```

## 📊 Flujo de Trabajo

### 1. Gestión de Datasets

- Navega a `/dashboard/datasets`
- Sube archivos CSV arrastrando o seleccionando
- Visualiza todos los datasets disponibles
- Valida formato y contenido automáticamente

### 2. Balanceo de Datos

- Navega a `/dashboard/balance`
- Selecciona un dataset original
- Aplica algoritmo SMOTE para balancear clases
- Genera nuevo dataset con sufijo `_balanced`

### 3. Clasificación de Pacientes

- Navega a `/dashboard/classify`
- Selecciona un modelo (dataset original o balanceado)
- El formulario se genera dinámicamente según el esquema
- Completa los datos del paciente
- Obtén predicción con nivel de confianza

## 🤖 Machine Learning

### Algoritmo SMOTE

- **SMOTE (Synthetic Minority Oversampling Technique)**
- Genera muestras sintéticas de la clase minoritaria
- Mejora el rendimiento en datos médicos desbalanceados
- Preserva las características estadísticas originales

### Clasificación

- **TensorFlow.js** para inferencia en el servidor
- Formularios dinámicos basados en esquema del dataset
- Validación automática de tipos de datos
- Métricas de confianza para evaluar predicciones

## 🔒 Consideraciones de Seguridad

- Validación completa de archivos CSV
- Límites de tamaño de archivo (10MB)
- Sanitización de nombres de archivo
- Validación de tipos de datos en formularios

## 📝 API Endpoints

### GET `/api/datasets`

Lista todos los datasets disponibles

### POST `/api/upload`

Sube un nuevo archivo CSV

### POST `/api/balance`

Aplica balanceo SMOTE a un dataset

### GET `/api/schema/[datasetName]`

Obtiene el esquema (columnas) de un dataset

### POST `/api/classify`

Realiza clasificación de un paciente

## 🎨 Interfaz de Usuario

- **Diseño Responsivo**: Funciona en desktop, tablet y móvil
- **Tema Médico**: Colores y iconos apropiados para el contexto
- **Accesibilidad**: Cumple estándares WCAG
- **Estados de Carga**: Indicadores visuales para operaciones largas
- **Validación en Tiempo Real**: Feedback inmediato en formularios

## ⚠️ Aviso Médico

**IMPORTANTE**: Esta aplicación es una herramienta de apoyo diagnóstico y no debe usarse como único criterio para diagnósticos médicos. Siempre consulte con profesionales médicos cualificados para obtener diagnósticos definitivos.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Soporte

Para soporte técnico o preguntas:

- Abrir un issue en GitHub
- Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ para mejorar el diagnóstico médico asistido por IA**
