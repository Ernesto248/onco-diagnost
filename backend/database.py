import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "data" / "oncodiagnost.db"

def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS datasets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            original_path TEXT,
            balanced_path TEXT,
            rows INTEGER,
            features INTEGER,
            minority_class TEXT,
            minority_count INTEGER,
            majority_count INTEGER,
            imbalance_ratio REAL,
            is_balanced INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
            classifier_type TEXT NOT NULL,
            balanced_by TEXT NOT NULL DEFAULT 'smote-cov',
            auc REAL,
            f1_score REAL,
            features TEXT,
            classes TEXT,
            pickle_path TEXT,
            scaler_path TEXT,
            hyperparams TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS classifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_id INTEGER REFERENCES models(id) ON DELETE CASCADE,
            patient_data TEXT,
            prediction TEXT,
            confidence REAL,
            predicted_class TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    conn.close()
