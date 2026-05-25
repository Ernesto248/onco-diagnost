import os
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd

from database import get_db
from schemas import DatasetOut, DatasetUploadOut, ApiResponse

router = APIRouter(prefix="/api", tags=["datasets"])
UPLOAD_DIR = Path(__file__).parent.parent / "data" / "uploads"


def parse_dataset(csv_path: str) -> dict:
    df = pd.read_csv(csv_path)
    df = df.drop(columns=["ID_REF"], errors="ignore")
    class_col = df.columns[-1]
    df[class_col] = df[class_col].astype(str).str.strip()

    counts = df[class_col].value_counts()
    minority = counts.index[-1]
    majority = counts.index[0]

    n_features = len(df.columns) - 1
    n_rows = len(df)
    n_min = int(counts[minority])
    n_maj = int(counts[majority])
    ir = round(n_maj / n_min, 2) if n_min > 0 else 0

    return {
        "rows": n_rows,
        "features": n_features,
        "minority_class": str(minority),
        "minority_count": n_min,
        "majority_count": n_maj,
        "imbalance_ratio": ir,
    }


@router.get("/datasets", response_model=ApiResponse)
def list_datasets():
    conn = get_db()
    rows = conn.execute(
        "SELECT id, name, rows, features, minority_class, minority_count, "
        "majority_count, imbalance_ratio, is_balanced, created_at "
        "FROM datasets ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    datasets = [dict(r) for r in rows]
    for d in datasets:
        d["is_balanced"] = bool(d["is_balanced"])
    return ApiResponse(success=True, data=datasets)


@router.post("/upload", response_model=ApiResponse)
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(400, "Solo se permiten archivos CSV")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = file.filename.replace(" ", "_")
    file_path = UPLOAD_DIR / safe_name

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    try:
        info = parse_dataset(str(file_path))
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(400, f"Error al procesar CSV: {e}")

    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO datasets (name, original_path, rows, features, "
        "minority_class, minority_count, majority_count, imbalance_ratio) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (safe_name, str(file_path), info["rows"], info["features"],
         info["minority_class"], info["minority_count"],
         info["majority_count"], info["imbalance_ratio"]),
    )
    conn.commit()
    ds_id = cursor.lastrowid
    conn.close()

    return ApiResponse(success=True, data={
        "id": ds_id,
        "name": safe_name,
        **info,
    })


@router.delete("/datasets/{dataset_id}", response_model=ApiResponse)
def delete_dataset(dataset_id: int):
    conn = get_db()
    ds = conn.execute("SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
    if not ds:
        conn.close()
        raise HTTPException(404, "Dataset no encontrado")

    # Solo eliminar balanced_path. original_path es compartido con el dataset padre.
    if ds["balanced_path"] and os.path.exists(ds["balanced_path"]):
        os.remove(ds["balanced_path"])

    # Solo eliminar original_path si ningun otro dataset lo referencia
    if ds["original_path"] and os.path.exists(ds["original_path"]):
        refs = conn.execute(
            "SELECT COUNT(*) as cnt FROM datasets WHERE original_path = ? AND id != ?",
            (ds["original_path"], dataset_id),
        ).fetchone()
        if refs["cnt"] == 0:
            os.remove(ds["original_path"])

    conn.execute("DELETE FROM datasets WHERE id = ?", (dataset_id,))
    conn.commit()
    conn.close()
    return ApiResponse(success=True, data={"deleted": dataset_id})


@router.get("/schema/{dataset_name}", response_model=ApiResponse)
def get_schema(dataset_name: str):
    safe_name = dataset_name.replace(" ", "_")
    file_path = UPLOAD_DIR / safe_name if (UPLOAD_DIR / safe_name).exists() else None
    bal_dir = Path(__file__).parent.parent / "data" / "balanced"
    if not file_path:
        file_path = bal_dir / safe_name

    if not file_path or not file_path.exists():
        raise HTTPException(404, f"Dataset '{dataset_name}' no encontrado")

    df = pd.read_csv(file_path)
    df = df.drop(columns=["ID_REF"], errors="ignore")
    columns = [{"name": c, "type": str(df[c].dtype)} for c in df.columns]

    return ApiResponse(success=True, data={
        "datasetName": dataset_name,
        "totalColumns": len(columns),
        "columns": columns,
    })
