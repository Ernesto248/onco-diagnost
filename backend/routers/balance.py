import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
import pandas as pd

from database import get_db
from schemas import BalanceRequest, BalanceOut, ApiResponse
from services.smote_cov import run_smote_cov, detect_class_column

router = APIRouter(prefix="/api", tags=["balance"])
BALANCED_DIR = Path(__file__).parent.parent / "data" / "balanced"


@router.post("/balance", response_model=ApiResponse)
def balance_dataset(req: BalanceRequest):
    conn = get_db()
    ds = conn.execute("SELECT * FROM datasets WHERE id = ?", (req.dataset_id,)).fetchone()

    if not ds:
        conn.close()
        raise HTTPException(404, "Dataset no encontrado")

    original_path = ds["original_path"]
    if not original_path or not os.path.exists(original_path):
        conn.close()
        raise HTTPException(404, "Archivo original no encontrado")

    ds_name = Path(original_path).stem

    class_column = detect_class_column(original_path)

    try:
        result = run_smote_cov(original_path, str(BALANCED_DIR), class_column=class_column)
    except Exception as e:
        conn.close()
        raise HTTPException(500, f"Error en SMOTE-COV: {e}")

    if result["synthetic_added"] == 0:
        balanced_name = f"{ds_name}_balanced_{req.dataset_id}.csv"
        final_path = BALANCED_DIR / balanced_name
        if result["balanced_path"] != str(final_path):
            import shutil
            shutil.copy(result["balanced_path"], str(final_path))

        df_bal = pd.read_csv(str(final_path))
        df_bal = df_bal.drop(columns=["ID_REF"], errors="ignore")
        cls_col = df_bal.columns[-1]
        df_bal[cls_col] = df_bal[cls_col].astype(str).str.strip()
        n_min = int(df_bal[cls_col].value_counts().min())
        n_maj = int(df_bal[cls_col].value_counts().max())
        ir_after = round(n_maj / n_min, 2) if n_min > 0 else 0

        conn.execute(
            "INSERT INTO datasets (name, original_path, balanced_path, rows, features, "
            "minority_class, minority_count, majority_count, imbalance_ratio, is_balanced) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)",
            (balanced_name, original_path, str(final_path),
             len(df_bal), len(df_bal.columns) - 1,
             ds["minority_class"], n_min, n_maj, ir_after),
        )
        conn.execute(
            "UPDATE datasets SET balanced_path = ?, is_balanced = 1 WHERE id = ?",
            (str(final_path), req.dataset_id),
        )
        conn.commit()
        conn.close()
        return ApiResponse(success=True, data={
            "balanced_id": req.dataset_id,
            "name": balanced_name,
            "rows": len(df_bal),
            "imbalance_ratio": ir_after,
            "synthetic_added": 0,
            "originalFile": original_path,
            "balancedFile": str(final_path),
            "originalRows": ds["rows"],
            "balancedRows": len(df_bal),
            "operation": "SMOTE-COV (Ledoit-Wolf)",
        })

    bal_name = Path(result["balanced_path"]).name
    bal_path = str(BALANCED_DIR / bal_name)

    if result["balanced_path"] != bal_path:
        import shutil
        shutil.copy(result["balanced_path"], bal_path)

    df_bal = pd.read_csv(bal_path)
    df_bal = df_bal.drop(columns=["ID_REF"], errors="ignore")
    class_col = df_bal.columns[-1]
    df_bal[class_col] = df_bal[class_col].astype(str).str.strip()
    n_min = int(df_bal[class_col].value_counts().min())
    n_maj = int(df_bal[class_col].value_counts().max())
    ir_after = round(n_maj / n_min, 2) if n_min > 0 else 0

    balanced_name = f"{ds_name}_balanced_{req.dataset_id}.csv"
    final_path = BALANCED_DIR / balanced_name
    if bal_path != str(final_path):
        import shutil
        shutil.copy(bal_path, str(final_path))

    cursor = conn.execute(
        "INSERT INTO datasets (name, original_path, balanced_path, rows, features, "
        "minority_class, minority_count, majority_count, imbalance_ratio, is_balanced) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)",
        (balanced_name, original_path, str(final_path),
         len(df_bal), len(df_bal.columns) - 1,
         ds["minority_class"], n_min, n_maj, ir_after),
    )
    conn.execute(
        "UPDATE datasets SET balanced_path = ?, is_balanced = 1 WHERE id = ?",
        (str(final_path), req.dataset_id),
    )
    conn.commit()
    bal_id = cursor.lastrowid
    conn.close()

    return ApiResponse(success=True, data={
        "balanced_id": bal_id,
        "name": balanced_name,
        "rows": len(df_bal),
        "imbalance_ratio": ir_after,
        "synthetic_added": result["synthetic_added"],
        "originalFile": original_path,
        "balancedFile": str(final_path),
        "originalRows": ds["rows"],
        "balancedRows": len(df_bal),
        "operation": "SMOTE-COV (Ledoit-Wolf)",
    })
