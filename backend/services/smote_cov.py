import sys
from pathlib import Path
import shutil
import pandas as pd

SMOTE_PATH = Path(r"C:\Users\mleon\code\tesis\Smote")
sys.path.insert(0, str(SMOTE_PATH))

from SmoteCovPy import SmoteCov, ShrinkageMethods


def detect_class_column(csv_path: str) -> str:
    df = pd.read_csv(csv_path, nrows=1)
    df = df.drop(columns=["ID_REF"], errors="ignore")
    return df.columns[-1]


def run_smote_cov(csv_path: str, output_dir: str, class_column: str = None) -> dict:
    original = Path(csv_path)
    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)

    if class_column is None:
        class_column = detect_class_column(csv_path)

    # Limpiar: forzar columnas no-clase a numerico (SmoteCov requiere todo numerico)
    df_raw = pd.read_csv(csv_path)
    for col in df_raw.columns:
        if col != class_column and col != "ID_REF":
            df_raw[col] = pd.to_numeric(df_raw[col], errors="coerce")
    df_raw = df_raw.dropna()
    clean_path = original.parent / f"_clean_{original.name}"
    df_raw.to_csv(clean_path, index=False)

    balanced_in_range = output / f"{original.stem}_in_range_balanced_dataset_ld_method_by_sklearn.csv"
    balanced_free_range = output / f"{original.stem}_free_range_balanced_dataset_ld_method_by_sklearn.csv"

    if (balanced_in_range.exists() and balanced_in_range.stat().st_size > 0
        and balanced_free_range.exists() and balanced_free_range.stat().st_size > 0):
        df_orig = pd.read_csv(clean_path)
        df_bal = pd.read_csv(balanced_in_range)
        original_rows = len(df_orig)
        balanced_rows = len(df_bal)
        synthetic_added = balanced_rows - original_rows
        clean_path.unlink(missing_ok=True)
        return {
            "balanced_path": str(balanced_in_range),
            "original_rows": original_rows,
            "balanced_rows": balanced_rows,
            "synthetic_added": synthetic_added,
        }

    sm = SmoteCov(str(clean_path), class_column_name=class_column)
    sm.get_classes_count()
    ir_before = sm.calculate_ir_value()
    minority_count = sm._minority_class_count
    majority_count = sm._majority_class_count

    if ir_before <= 1.5:
        dest = output / f"{original.stem}_balanced_nop.csv"
        shutil.copy(csv_path, str(dest))
        clean_path.unlink(missing_ok=True)
        return {
            "balanced_path": str(dest),
            "original_rows": minority_count + majority_count,
            "balanced_rows": minority_count + majority_count,
            "synthetic_added": 0,
        }

    sm.balance_dataset_using_ledoit_wolf_method(
        shrinkage_method=ShrinkageMethods.SKLEARN
    )

    source_dir = clean_path.parent
    clean_stem = clean_path.stem
    in_range_cwd = source_dir / f"{clean_stem}_in_range_balanced_dataset_ld_method_by_sklearn.csv"
    free_range_cwd = source_dir / f"{clean_stem}_free_range_balanced_dataset_ld_method_by_sklearn.csv"

    if not in_range_cwd.exists():
        matches = sorted(source_dir.glob("*_in_range_balanced*"), key=lambda p: p.stat().st_mtime, reverse=True)
        if matches:
            in_range_cwd = matches[0]
    if not free_range_cwd.exists():
        matches = sorted(source_dir.glob("*_free_range_balanced*"), key=lambda p: p.stat().st_mtime, reverse=True)
        if matches:
            free_range_cwd = matches[0]

    if in_range_cwd.exists() and in_range_cwd != balanced_in_range:
        shutil.move(str(in_range_cwd), str(balanced_in_range))
    if free_range_cwd.exists() and free_range_cwd != balanced_free_range:
        shutil.move(str(free_range_cwd), str(balanced_free_range))

    if not balanced_in_range.exists():
        raise FileNotFoundError(
            f"SMOTE-COV no genero el archivo balanceado. "
            f"Buscado en: {balanced_in_range} y {source_dir}"
        )

    original_rows = minority_count + majority_count
    df_bal = pd.read_csv(balanced_in_range)
    balanced_rows = len(df_bal)
    synthetic_added = balanced_rows - original_rows

    clean_path.unlink(missing_ok=True)

    return {
        "balanced_path": str(balanced_in_range),
        "original_rows": original_rows,
        "balanced_rows": balanced_rows,
        "synthetic_added": synthetic_added,
    }
