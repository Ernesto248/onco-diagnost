# 🏥 OncoDiag - Casos de Uso Completos

## 📋 Descripción General

OncoDiag es una aplicación web de diagnóstico asistido de cáncer que utiliza inteligencia artificial y machine learning para ayudar a profesionales médicos en el proceso de diagnóstico oncológico. La aplicación proporciona herramientas completas para gestionar datos médicos, entrenar modelos de IA y realizar clasificaciones de pacientes con interfaz responsive optimizada para dispositivos móviles y desktop.

---

## 👥 Actores del Sistema

### **Especialista Médico (Actor Principal)**

- Profesional de la salud especializado en oncología
- Usuario principal del sistema
- Responsable de interpretar los resultados de IA
- Toma decisiones clínicas basadas en los análisis asistidos
- Utiliza la aplicación desde diferentes dispositivos (móvil, tablet, desktop)

### **Administrador del Sistema**

- Gestiona datasets y modelos institucionales
- Configura parámetros de entrenamiento avanzados
- Mantiene la calidad y consistencia de los datos
- Supervisa el rendimiento del sistema

### **Investigador Clínico**

- Utiliza la herramienta para análisis de investigación
- Evalúa la efectividad de diferentes modelos
- Genera reportes para publicaciones científicas

---

## 🎯 Casos de Uso Principales

### **Módulo 1: Gestión de Datasets**

#### **CU-001: Cargar Dataset Médico**

**Actor:** Especialista Médico / Administrador  
**Descripción:** Subir un archivo CSV con datos clínicos de pacientes al sistema

**Flujo Principal:**

1. El usuario accede a la sección "Datasets" desde el menú principal
2. Ve la interfaz de carga con área de drag & drop
3. Arrastra archivo CSV o hace click para seleccionar (máximo 10MB)
4. El sistema valida formato, estructura y tamaño en tiempo real
5. Se muestra barra de progreso de carga (0-100%)
6. Sistema analiza automáticamente:
   - Número de filas y columnas
   - Tipos de datos por columna
   - Valores únicos y distribuciones
   - Detección de clases desbalanceadas
7. El dataset se almacena y aparece en la lista principal

**Precondiciones:**

- Archivo en formato CSV válido
- Estructura con headers definidos
- Tamaño menor a 10MB
- Datos médicos estructurados

**Postcondiciones:**

- Dataset disponible para uso en entrenamiento y balanceo
- Esquema de datos analizado y almacenado
- Métricas básicas calculadas y visibles
- Archivo respaldado en sistema de archivos

**Flujos Alternativos:**

- **Error de formato:** Sistema muestra mensaje específico del error
- **Archivo muy grande:** Sistema rechaza y sugiere optimización
- **Datos corruptos:** Sistema identifica filas problemáticas

#### **CU-002: Visualizar y Gestionar Datasets**

**Actor:** Especialista Médico  
**Descripción:** Ver listado completo de datasets con información detallada y opciones de gestión

**Flujo Principal:**

1. Usuario navega a sección "Datasets"
2. Sistema muestra lista organizada con información:
   - Nombre del archivo
   - Fecha y hora de carga
   - Tamaño del archivo en KB/MB
   - Número de filas (muestras)
   - Número de columnas (características)
   - Estado: Original, Balanceado, o En Proceso
   - Indicadores visuales de salud de datos
3. Usuario puede realizar acciones:
   - Ver detalles completos del dataset
   - Eliminar datasets obsoletos
   - Descargar datasets procesados
   - Acceder directamente a balanceo o entrenamiento

**Funcionalidades Específicas:**

- **Filtrado:** Por tipo, fecha, estado
- **Ordenamiento:** Por nombre, tamaño, fecha
- **Vista de tarjetas** responsive para móviles
- **Indicadores de estado** con colores intuitivos

#### **CU-003: Analizar Esquema y Metadatos**

**Actor:** Especialista Médico  
**Descripción:** Examinar estructura detallada y estadísticas de un dataset específico

**Flujo Principal:**

1. Usuario selecciona un dataset específico
2. Sistema carga y presenta análisis completo:
   - **Información General:**
     - Nombre y ubicación del archivo
     - Timestamp de carga
     - Tamaño y dimensiones
   - **Estructura de Columnas:**
     - Lista completa de campos
     - Tipos de datos identificados
     - Rangos de valores numéricos
     - Categorías en datos categóricos
   - **Estadísticas Descriptivas:**
     - Valores faltantes por columna
     - Distribuciones de frecuencia
     - Outliers detectados
   - **Calidad de Datos:**
     - Porcentaje de completitud
     - Consistencia de formatos
     - Duplicados identificados

---

### **Módulo 2: Balanceo de Datos con SMOTE**

#### **CU-004: Ejecutar Balanceo SMOTE**

**Actor:** Especialista Médico / Administrador  
**Descripción:** Aplicar algoritmo SMOTE para equilibrar clases desproporcionadas en datasets médicos

**Flujo Principal:**

1. Usuario accede a "Balanceo de Datos"
2. Sistema muestra interfaz con información educativa sobre SMOTE
3. Se presenta lista de datasets originales (excluye ya balanceados)
4. Usuario selecciona dataset objetivo
5. Sistema analiza automáticamente:
   - Distribución actual de clases
   - Nivel de desbalance detectado
   - Clases minoritarias identificadas
6. Usuario confirma proceso de balanceo
7. Sistema ejecuta algoritmo SMOTE:
   - Genera muestras sintéticas para clases minoritarias
   - Mantiene características estadísticas originales
   - Preserva integridad de relaciones entre variables
8. Se crea nuevo dataset balanceado con sufijo "\_balanced"
9. Sistema muestra resultados comparativos

**Precondiciones:**

- Dataset original cargado y válido
- Clases categóricas identificables
- Dataset no previamente balanceado
- Suficientes muestras para análisis estadístico

**Postcondiciones:**

- Nuevo dataset balanceado creado y disponible
- Métricas de balanceo documentadas
- Dataset original preservado intacto
- Metadatos de proceso almacenados

#### **CU-005: Comparar Resultados Pre/Post Balanceo**

**Actor:** Especialista Médico  
**Descripción:** Analizar impacto del balanceo mediante comparación visual y estadística

**Flujo Principal:**

1. Al completarse el balanceo, sistema presenta comparación:
   - **Vista Lado a Lado:**
     - Dataset Original vs Balanceado
     - Distribución de clases (gráficos)
     - Número de muestras por clase
     - Proporciones antes/después
   - **Métricas de Impacto:**
     - Porcentaje de mejora en balance
     - Nuevas muestras sintéticas generadas
     - Tiempo de procesamiento
     - Técnica SMOTE aplicada
   - **Recomendaciones:**
     - Adequación para entrenamiento
     - Posibles mejoras adicionales
     - Siguiente pasos sugeridos

---

### **Módulo 3: Entrenamiento de Modelos de IA**

#### **CU-006: Configurar Entrenamiento Avanzado**

**Actor:** Especialista Médico / Administrador  
**Descripción:** Configurar parámetros detallados para entrenar un modelo de machine learning

**Flujo Principal:**

1. Usuario accede a "Entrenar Modelo"
2. Sistema presenta interfaz de configuración en pasos:

   **Paso 1 - Selección de Dataset:**

   - Lista de datasets disponibles (originales y balanceados)
   - Recomendaciones basadas en balance de clases
   - Vista previa de características del dataset

   **Paso 2 - Configuración del Modelo:**

   - Selección de columna objetivo (variable a predecir)
   - Configuración de hiperparámetros:
     - **Épocas:** 10-500 (slider con recomendaciones)
     - **Tasa de Aprendizaje:** 0.1, 0.01, 0.001, 0.0001
     - **Tamaño del Lote:** 16, 32, 64, 128
     - **Arquitectura:** Automática basada en dataset

   **Paso 3 - Validación:**

   - Sistema valida configuración
   - Estima tiempo de entrenamiento
   - Muestra advertencias si las hay
   - Confirmación final del usuario

**Precondiciones:**

- Al menos un dataset disponible
- Dataset con esquema válido cargado
- Columna objetivo claramente identificada
- Recursos computacionales disponibles

#### **CU-007: Ejecutar Entrenamiento con Monitoreo**

**Actor:** Sistema (automático) con supervisión del usuario  
**Descripción:** Entrenar modelo de machine learning con seguimiento en tiempo real

**Flujo Principal:**

1. Usuario confirma configuración e inicia entrenamiento
2. Sistema inicia proceso automático:

   **Fase de Preparación:**

   - Validación final de datos
   - División entrenamiento/validación (80/20)
   - Normalización de características
   - Configuración de arquitectura de red

   **Fase de Entrenamiento:**

   - Progreso visual en tiempo real (0-100%)
   - Métricas actualizadas por época:
     - Loss (pérdida) de entrenamiento
     - Accuracy (precisión) de validación
     - Tiempo transcurrido
   - Gráficos de convergencia en vivo

   **Fase de Finalización:**

   - Evaluación en conjunto de prueba
   - Cálculo de métricas finales
   - Guardado automático del modelo
   - Generación de reporte de entrenamiento

**Postcondiciones:**

- Modelo entrenado disponible para clasificación
- Métricas de rendimiento calculadas y almacenadas
- Metadatos completos del proceso documentados
- Modelo listo para uso en diagnósticos

#### **CU-008: Evaluar Resultados de Entrenamiento**

**Actor:** Especialista Médico  
**Descripción:** Revisar y analizar exhaustivamente los resultados del modelo entrenado

**Flujo Principal:**

1. Al completarse el entrenamiento, sistema presenta dashboard de resultados:

   **Métricas de Rendimiento:**

   - Precisión final del modelo (%)
   - Pérdida (loss) final
   - Tiempo total de entrenamiento
   - Número de épocas completadas

   **Información del Dataset:**

   - Nombre del dataset utilizado
   - Número total de muestras
   - Características utilizadas
   - Distribución de clases

   **Arquitectura del Modelo:**

   - Capas de la red neuronal
   - Número de parámetros
   - Función de activación
   - Optimizador utilizado

   **Recomendaciones:**

   - Calidad del modelo entrenado
   - Sugerencias de mejora
   - Adequación para uso clínico
   - Próximos pasos recomendados

---

### **Módulo 4: Clasificación y Diagnóstico Asistido**

#### **CU-009: Seleccionar Modelo para Diagnóstico**

**Actor:** Especialista Médico  
**Descripción:** Elegir modelo entrenado apropiado para realizar diagnóstico de paciente específico

**Flujo Principal:**

1. Usuario accede a "Clasificación de Pacientes"
2. Sistema presenta galería de modelos disponibles:
   - **Por cada modelo:**
     - Nombre descriptivo
     - Dataset de origen
     - Fecha de entrenamiento
     - Precisión alcanzada
     - Tipo de cáncer/condición objetivo
     - Estado: Activo, En pruebas, Archivado
3. Usuario selecciona modelo apropiado
4. Sistema carga metadatos y configuración:
   - Esquema de entrada requerido
   - Campos obligatorios identificados
   - Rangos de valores esperados
   - Información sobre interpretación de resultados
5. Se genera formulario dinámico personalizado

**Precondiciones:**

- Al menos un modelo entrenado disponible
- Metadatos del modelo accesibles
- Usuario con conocimiento clínico del dominio

#### **CU-010: Capturar Datos Completos del Paciente**

**Actor:** Especialista Médico  
**Descripción:** Completar formulario inteligente con información clínica estructurada del paciente

**Flujo Principal:**

1. Sistema presenta formulario dinámico generado automáticamente
2. Formulario se adapta según el modelo seleccionado con:

   **Campos Inteligentes:**

   - **Demográficos:** Edad, sexo, etnia (según aplicabilidad)
   - **Antropométricos:** Peso, altura, IMC (calculado automáticamente)
   - **Clínicos:** Estadios, grados, tamaños de tumor
   - **Laboratorio:** Valores de marcadores tumorales
   - **Histológicos:** Tipos celulares, diferenciación
   - **Genéticos:** Mutaciones relevantes (si aplicable)

   **Características del Formulario:**

   - Validación en tiempo real de tipos de datos
   - Rangos de valores médicamente válidos
   - Campos dependientes (aparecen según otras selecciones)
   - Autocompletado inteligente
   - Indicadores de campos obligatorios
   - Tooltips con información médica contextual

3. Sistema valida completitud y consistencia antes de envío

**Características Responsive:**

- **Móvil:** Campos apilados verticalmente, inputs grandes para toque
- **Tablet:** Layout en 2 columnas con espaciado optimizado
- **Desktop:** Layout en 3 columnas con vista completa

#### **CU-011: Procesar Clasificación con IA**

**Actor:** Sistema (automático)  
**Descripción:** Ejecutar algoritmo de clasificación y generar diagnóstico asistido interpretable

**Flujo Principal:**

1. Usuario confirma datos y envía formulario
2. Sistema ejecuta proceso de clasificación:

   **Preprocesamiento:**

   - Validación final de todos los campos
   - Normalización según parámetros del modelo
   - Transformación a formato de entrada requerido
   - Verificación de rangos y consistencia

   **Inferencia del Modelo:**

   - Carga del modelo entrenado específico
   - Aplicación de algoritmo de clasificación
   - Cálculo de probabilidades para todas las clases
   - Determinación de clase más probable

   **Postprocesamiento:**

   - Conversión de probabilidades a porcentajes
   - Categorización de nivel de riesgo:
     - **Alto:** ≥70%
     - **Medio:** 40-69%
     - **Bajo:** <40%
   - Generación de explicación textual
   - Cálculo de confianza del modelo

**Algoritmos Utilizados:**

- Redes neuronales densas (TensorFlow.js)
- Normalización Z-score
- Activación softmax para probabilidades
- Validación cruzada para confianza

#### **CU-012: Presentar Resultados de Diagnóstico**

**Actor:** Especialista Médico  
**Descripción:** Visualizar y analizar resultados completos del diagnóstico asistido por IA

**Flujo Principal:**

1. Al completarse la clasificación, sistema presenta resultados en dashboard interactivo:

   **Resultado Principal (Hero Section):**

   - Porcentaje de riesgo prominente (tamaño grande, colores intuitivos)
   - Diagnóstico textual claro y comprensible
   - Badge de nivel de riesgo con colores semafóricos:
     - 🔴 Alto riesgo (rojo)
     - 🟡 Riesgo medio (amarillo)
     - 🟢 Riesgo bajo (verde)

   **Análisis Detallado:**

   - **Desglose de Probabilidades:**

     - Todas las clases evaluadas
     - Porcentajes individuales
     - Barras de progreso visuales
     - Ranking de probabilidades

   - **Información Técnica:**

     - Modelo utilizado y versión
     - Dataset de entrenamiento
     - Fecha y hora del análisis
     - Nivel de confianza del modelo
     - Características más influyentes

   - **Contexto Clínico:**
     - Datos del paciente utilizados
     - Parámetros clave destacados
     - Recomendaciones de seguimiento
     - Disclaimer sobre naturaleza asistida

**Adaptabilidad de Interfaz:**

- **Móvil:** Layout vertical con elementos apilados
- **Tablet:** Vista en 2 columnas optimizada
- **Desktop:** Dashboard completo en múltiples secciones

---

### **Módulo 5: Gestión del Sistema y Soporte**

#### **CU-013: Monitorear Estado del Sistema**

**Actor:** Usuario (cualquier rol)  
**Descripción:** Verificar estado operacional de todos los componentes del sistema

**Flujo Principal:**

1. Sistema muestra indicadores de estado en sidebar persistente:
   - **TensorFlow.js:** ✅ Activo / ❌ Error
   - **API Backend:** ✅ Conectado / ⚠️ Latencia alta / ❌ Desconectado
   - **Base de Datos:** ✅ Disponible / ❌ Error
   - **Almacenamiento:** ✅ OK / ⚠️ Espacio bajo
2. Indicadores se actualizan automáticamente cada 30 segundos
3. Colores intuitivos indican estado (verde/amarillo/rojo)
4. Click en indicador muestra detalles técnicos

#### **CU-014: Navegar en Dispositivo Móvil**

**Actor:** Especialista Médico (en smartphone/tablet)  
**Descripción:** Utilizar aplicación desde dispositivos móviles con experiencia optimizada

**Flujo Principal:**

1. Usuario accede desde dispositivo móvil
2. Sistema detecta tamaño de pantalla y activa modo responsive
3. **Navegación Móvil:**
   - Menú hamburguesa en esquina superior izquierda
   - Sidebar deslizable con backdrop
   - Navegación por gestos táctiles
   - Auto-cierre al seleccionar opción
4. **Formularios Optimizados:**
   - Campos de entrada grandes para dedos
   - Teclados contextuales (numérico para números)
   - Validación inmediata con feedback visual
   - Botones de acción de ancho completo
5. **Visualización de Resultados:**
   - Gráficos adaptados a pantalla pequeña
   - Scroll vertical intuitivo
   - Elementos táctiles prominentes

#### **CU-015: Gestión Avanzada de Errores**

**Actor:** Sistema (automático)  
**Descripción:** Manejar errores gracefully y proporcionar retroalimentación útil

**Flujo Principal:**

1. Sistema detecta error (conexión, validación, procesamiento)
2. Categoriza tipo de error:
   - **Usuario:** Datos inválidos, campos vacíos
   - **Sistema:** Falla de API, timeout
   - **Datos:** Archivo corrupto, formato inválido
3. Presenta mensaje contextual:
   - 🟢 **Éxito:** Operación completada correctamente
   - 🟡 **Advertencia:** Acción completada con observaciones
   - 🔴 **Error:** Falla que requiere acción del usuario
   - 🔵 **Información:** Actualizaciones de estado
4. Proporciona acciones correctivas cuando es posible
5. Registra errores para análisis y mejora

---

## 🔄 Flujos de Trabajo Completos

### **Flujo A: Nuevo Usuario - Primer Diagnóstico Completo**

**Duración Estimada:** 15-20 minutos  
**Actor:** Especialista Médico nuevo en el sistema

1. **Preparación Inicial (5-7 min):**

   - Cargar dataset médico institucional (CU-001)
   - Revisar estructura y calidad de datos (CU-003)
   - Aplicar balanceo SMOTE si es necesario (CU-004)

2. **Entrenamiento del Modelo (8-10 min):**

   - Configurar parámetros de entrenamiento (CU-006)
   - Ejecutar entrenamiento con monitoreo (CU-007)
   - Evaluar métricas de rendimiento (CU-008)

3. **Primer Diagnóstico (2-3 min):**
   - Seleccionar modelo recién entrenado (CU-009)
   - Ingresar datos de paciente de prueba (CU-010)
   - Revisar resultados de clasificación (CU-012)

### **Flujo B: Usuario Experimentado - Diagnóstico Rápido**

**Duración Estimada:** 2-3 minutos  
**Actor:** Especialista con modelos preexistentes

1. Acceder directamente a Clasificación (CU-009)
2. Seleccionar modelo apropiado para el caso
3. Completar formulario de paciente (CU-010)
4. Analizar resultados y generar reporte (CU-012)

### **Flujo C: Investigación Clínica - Análisis Comparativo**

**Duración Estimada:** 30-45 minutos  
**Actor:** Investigador evaluando diferentes enfoques

1. **Preparación de Datos:**

   - Cargar múltiples datasets de diferentes fuentes
   - Aplicar diferentes técnicas de balanceo
   - Analizar calidad comparativa de datos

2. **Entrenamiento Múltiple:**

   - Entrenar modelos con diferentes hiperparámetros
   - Evaluar rendimiento comparativo
   - Documentar mejores configuraciones

3. **Validación Cruzada:**
   - Probar modelos con casos conocidos
   - Comparar resultados con diagnósticos confirmados
   - Generar métricas de investigación

---

## 📊 Métricas de Rendimiento y Calidad

### **Datasets:**

- **Tiempo de Carga:** < 10 segundos para archivos de 10MB
- **Formatos Soportados:** CSV con UTF-8
- **Validación:** Automática en tiempo real
- **Almacenamiento:** Persistente con respaldo

### **Balanceo SMOTE:**

- **Tiempo de Procesamiento:** 15-60 segundos según tamaño
- **Mejora de Balance:** Típicamente 70-90%
- **Calidad de Datos:** Preservación de distribuciones originales
- **Efectividad:** Medida por métricas de entrenamiento posteriores

### **Entrenamiento de Modelos:**

- **Tiempo:** 30-300 segundos (simulación optimizada)
- **Precisión Típica:** 85-95% en datasets balanceados
- **Arquitecturas:** Redes densas multicapa
- **Persistencia:** Modelos guardados automáticamente

### **Clasificaciones:**

- **Tiempo de Respuesta:** < 2 segundos
- **Confianza Mínima:** Variable por modelo
- **Interpretabilidad:** Porcentajes y categorías de riesgo
- **Trazabilidad:** Completa con metadatos

### **Experiencia de Usuario:**

- **Carga Inicial:** < 3 segundos
- **Navegación:** Responsive en todos los dispositivos
- **Formularios:** Validación instantánea
- **Feedback:** Inmediato en todas las acciones

---

## 🔒 Consideraciones Éticas y de Seguridad

### **Privacidad de Datos Médicos:**

- **Procesamiento Local:** Datos nunca salen del navegador para clasificación
- **Almacenamiento Temporal:** Datasets en servidor local únicamente
- **Cumplimiento:** Diseñado para compliance con HIPAA/GDPR
- **Anonimización:** Recomendada antes de carga de datos

### **Responsabilidad Clínica:**

- **Natura Asistida:** Claramente comunicada en toda la interfaz
- **Disclaimers:** Presentes en resultados de diagnóstico
- **Validación Médica:** Siempre requerida para decisiones clínicas
- **Documentación:** Proceso completo trazable para auditorías

### **Calidad del Modelo:**

- **Validación Cruzada:** Implementada en entrenamiento
- **Métricas Transparentes:** Precisión y confianza siempre visibles
- **Limitaciones:** Claramente documentadas
- **Actualizaciones:** Capacidad de reentrenamiento con nuevos datos

---

## 🎯 Objetivos Estratégicos

### **Objetivos Primarios:**

1. **Asistir** profesionales médicos en diagnósticos oncológicos complejos
2. **Acelerar** el proceso de análisis de grandes volúmenes de datos clínicos
3. **Estandarizar** metodologías de evaluación entre instituciones
4. **Democratizar** acceso a herramientas de IA médica avanzada

### **Objetivos Secundarios:**

1. **Educar** sobre aplicaciones de ML en medicina oncológica
2. **Facilitar** investigación clínica colaborativa
3. **Optimizar** flujos de trabajo en entornos clínicos
4. **Promover** medicina basada en evidencia aumentada por IA

### **Métricas de Éxito:**

- **Adopción:** Número de especialistas utilizando la herramienta
- **Precisión:** Correlación con diagnósticos confirmados
- **Eficiencia:** Reducción en tiempo de análisis
- **Satisfacción:** Feedback positivo de usuarios clínicos

---

## 📱 Compatibilidad y Accesibilidad

### **Dispositivos Soportados:**

- **Smartphones:** iOS 14+, Android 10+ (Chrome, Safari)
- **Tablets:** iPad OS 14+, Android tablets (Chrome)
- **Desktop:** Windows 10+, macOS 10.15+, Linux (Chrome, Firefox, Safari)

### **Características de Accesibilidad:**

- **Navegación por Teclado:** Completamente funcional
- **Lectores de Pantalla:** Compatible con ARIA labels
- **Contraste Alto:** Cumple estándares WCAG 2.1 AA
- **Texto Escalable:** Responsive a configuraciones del sistema
- **Touch Friendly:** Elementos táctiles de 44px mínimo

---

_Este documento completo describe todos los casos de uso de OncoDiag v1.0. Para información técnica de implementación, consulte la documentación de desarrollo en README.md_
