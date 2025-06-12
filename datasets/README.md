# Directorio de Datasets

Este directorio se utiliza para almacenar los archivos CSV subidos por los usuarios.

## Estructura

- `*.csv` - Datasets originales subidos por los usuarios
- `*_balanced.csv` - Datasets balanceados generados por el algoritmo SMOTE

## Configuración

- **Tamaño máximo**: 10MB por archivo
- **Formato soportado**: CSV únicamente
- **Validación**: Automática al subir archivos
- **Nombres**: Se evitan duplicados agregando sufijos numéricos

## Seguridad

- Solo archivos CSV son permitidos
- Validación de contenido antes de guardar
- Nombres de archivo sanitizados automáticamente

## Uso

Los archivos en este directorio son utilizados por:

1. **API de Datasets** (`/api/datasets`) - Lista archivos disponibles
2. **API de Esquema** (`/api/schema/[datasetName]`) - Lee headers de CSV
3. **API de Balanceo** (`/api/balance`) - Procesa y genera archivos balanceados
4. **API de Clasificación** (`/api/classify`) - Utiliza datos para entrenamiento/inferencia

---

**Nota**: Este directorio se crea automáticamente cuando se sube el primer dataset.
