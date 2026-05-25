import json
from fastapi import APIRouter, HTTPException

from database import get_db
from schemas import ClassifyRequest, ClassifyOut, ApiResponse
from services.classifier import classify_patient

router = APIRouter(prefix="/api", tags=["classify"])


@router.post("/classify", response_model=ApiResponse)
def classify(req: ClassifyRequest):
    conn = get_db()
    model_row = conn.execute(
        "SELECT * FROM models WHERE id = ?", (req.model_id,)
    ).fetchone()

    if not model_row:
        conn.close()
        raise HTTPException(404, "Modelo no encontrado")

    model_dir = model_row["pickle_path"]
    if not model_dir:
        conn.close()
        raise HTTPException(500, "Archivo de modelo no encontrado")

    import os
    model_dir = os.path.dirname(model_dir)

    try:
        result = classify_patient(model_dir, req.patient_data)
    except Exception as e:
        conn.close()
        raise HTTPException(500, f"Error en clasificación: {e}")

    conn.execute(
        "INSERT INTO classifications (model_id, patient_data, prediction, "
        "confidence, predicted_class) VALUES (?, ?, ?, ?, ?)",
        (req.model_id, json.dumps(req.patient_data),
         result["prediction"], result["confidence"],
         result["predicted_class"]),
    )
    conn.commit()
    conn.close()

    return ApiResponse(success=True, data=result)
