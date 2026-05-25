import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import roc_auc_score, f1_score

CLASSIFIERS = {
    "knn": KNeighborsClassifier(n_neighbors=5),
    "mlp": MLPClassifier(
        hidden_layer_sizes=(100, 50), max_iter=300,
        random_state=42, early_stopping=True
    ),
    "c4.5": DecisionTreeClassifier(
        random_state=42, max_depth=15,
        min_samples_split=10
    ),
}


def load_dataset(csv_path: str, class_column: str = None) -> tuple:
    df = pd.read_csv(csv_path)
    df = df.drop(columns=["ID_REF"], errors="ignore")

    if class_column is None:
        class_column = df.columns[-1]

    df[class_column] = df[class_column].astype(str).str.strip()

    X = df.drop(columns=[class_column]).values.astype(np.float64)
    y_raw = df[class_column].values.astype(str)

    le = LabelEncoder()
    y = le.fit_transform(y_raw)

    return X, y, le, list(df.drop(columns=[class_column]).columns)


def train_model(csv_path: str, classifier_type: str, output_dir: str) -> dict:
    X, y, le, feature_cols = load_dataset(csv_path)

    scaler = StandardScaler()
    X = scaler.fit_transform(X)

    clf = CLASSIFIERS[classifier_type]
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    aucs, f1s = [], []
    for train_idx, test_idx in cv.split(X, y):
        clf_clone = joblib.hash(clf) if False else CLASSIFIERS[classifier_type]
        from sklearn.base import clone
        c = clone(clf)
        c.fit(X[train_idx], y[train_idx])
        y_prob = c.predict_proba(X[test_idx])[:, 1]
        y_pred = c.predict(X[test_idx])
        aucs.append(roc_auc_score(y[test_idx], y_prob))
        f1s.append(f1_score(y[test_idx], y_pred))

    avg_auc = float(np.mean(aucs))
    avg_f1 = float(np.mean(f1s))

    clf.fit(X, y)

    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    model_path = out / "model.pkl"
    scaler_path = out / "scaler.pkl"
    joblib.dump(clf, model_path)
    joblib.dump(scaler, scaler_path)

    classes_list = le.classes_.tolist()

    return {
        "auc": round(avg_auc, 4),
        "f1_score": round(avg_f1, 4),
        "pickle_path": str(model_path),
        "scaler_path": str(scaler_path),
        "features": feature_cols,
        "classes": classes_list,
        "feature_count": len(feature_cols),
    }


def classify_patient(model_dir: str, patient_data: dict) -> dict:
    model_dir = Path(model_dir)
    clf = joblib.load(model_dir / "model.pkl")
    scaler = joblib.load(model_dir / "scaler.pkl")

    import json
    metadata_path = model_dir / "metadata.json"
    if metadata_path.exists():
        with open(metadata_path) as f:
            meta = json.load(f)
        feature_cols = meta.get("features", [])
        classes = meta.get("classes", [])
    else:
        feature_cols = []
        classes = []

    if feature_cols:
        values = []
        for col in feature_cols:
            val = patient_data.get(col, 0)
            values.append(float(val))
        X = np.array([values])
    else:
        X = np.array([[float(v) for v in patient_data.values()]])

    X = scaler.transform(X)
    y_prob = clf.predict_proba(X)[0]
    y_pred = int(clf.predict(X)[0])

    probs = {}
    for i, cls in enumerate(classes):
        probs[str(cls)] = round(float(y_prob[i]), 4)

    if not classes:
        probs = {"class_0": round(float(y_prob[0]), 4),
                 "class_1": round(float(y_prob[1]), 4)}

    pred_class = str(classes[y_pred]) if classes and y_pred < len(classes) else str(y_pred)
    confidence = round(float(y_prob[y_pred]), 4)

    return {
        "prediction": pred_class,
        "confidence": confidence,
        "predicted_class": pred_class,
        "all_probabilities": probs,
    }
