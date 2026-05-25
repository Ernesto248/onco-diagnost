import json
from fastapi import APIRouter

from database import get_db
from schemas import ModelOut, ApiResponse

router = APIRouter(prefix="/api", tags=["models"])


@router.get("/models", response_model=ApiResponse)
def list_models():
    conn = get_db()
    rows = conn.execute(
        "SELECT id, name, dataset_id, classifier_type, balanced_by, "
        "auc, f1_score, features, classes, created_at "
        "FROM models ORDER BY created_at DESC"
    ).fetchall()
    conn.close()

    models = []
    for r in rows:
        m = dict(r)
        m["created_at"] = str(m["created_at"]) if m["created_at"] else None
        try:
            m["features"] = json.loads(m["features"]) if m["features"] else None
        except (json.JSONDecodeError, TypeError):
            pass
        try:
            m["classes"] = json.loads(m["classes"]) if m["classes"] else None
        except (json.JSONDecodeError, TypeError):
            pass
        models.append(m)

    return ApiResponse(success=True, data=models)
