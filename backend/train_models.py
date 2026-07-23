import os
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
)

from data_pipeline import generate_or_load_dataset, preprocess_data

SAVED_MODELS_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')
os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

def train_and_evaluate_models():
    print("=== Aegis Heart ML Pipeline: Training & Model Comparison ===")
    df = generate_or_load_dataset()
    X_train, X_test, X_train_s, X_test_s, y_train, y_test, feature_names = preprocess_data(df)

    models = {
        'Logistic Regression': (LogisticRegression(max_iter=1000, random_state=42), True),
        'Random Forest': (RandomForestClassifier(n_estimators=150, max_depth=8, random_state=42), False),
        'Gradient Boosting': (GradientBoostingClassifier(n_estimators=120, learning_rate=0.08, random_state=42), False),
        'XGBoost': (XGBClassifier(n_estimators=120, learning_rate=0.08, max_depth=5, eval_metric='logloss', random_state=42), False),
        'LightGBM': (LGBMClassifier(n_estimators=120, learning_rate=0.08, verbose=-1, random_state=42), False)
    }

    results = {}
    fitted_models = {}

    best_score = -1.0
    best_model_name = None
    best_model_obj = None
    best_use_scaled = False

    for name, (model, use_scaled) in models.items():
        print(f"Training {name}...")
        X_tr = X_train_s if use_scaled else X_train
        X_te = X_test_s if use_scaled else X_test

        model.fit(X_tr, y_train)

        y_pred = model.predict(X_te)
        y_proba = model.predict_proba(X_te)[:, 1] if hasattr(model, "predict_proba") else y_pred

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        auc = roc_auc_score(y_test, y_proba)

        results[name] = {
            'accuracy': round(float(acc), 4),
            'precision': round(float(prec), 4),
            'recall': round(float(rec), 4),
            'f1_score': round(float(f1), 4),
            'roc_auc': round(float(auc), 4),
            'used_scaled_data': use_scaled
        }
        fitted_models[name] = (model, use_scaled)

        # Selection criteria: Composite score of ROC-AUC and F1
        composite_score = 0.6 * auc + 0.4 * f1
        if composite_score > best_score:
            best_score = composite_score
            best_model_name = name
            best_model_obj = model
            best_use_scaled = use_scaled

    print("\n--- Model Evaluation Summary ---")
    for name, m in results.items():
        print(f"{name}: Accuracy={m['accuracy']}, F1={m['f1_score']}, ROC-AUC={m['roc_auc']}")

    print(f"\nWinner Model Selected Automatically: {best_model_name} (Score: {best_score:.4f})")

    # Compute Feature Importances / SHAP attributions
    X_tr_best = X_train_s if best_use_scaled else X_train
    importances = {}
    if hasattr(best_model_obj, 'feature_importances_'):
        raw_imp = best_model_obj.feature_importances_
        importances = {feat: float(imp) for feat, imp in zip(feature_names, raw_imp)}
    elif hasattr(best_model_obj, 'coef_'):
        raw_imp = np.abs(best_model_obj.coef_[0])
        importances = {feat: float(imp) for feat, imp in zip(feature_names, raw_imp)}

    # Normalize importances
    total_imp = sum(importances.values()) or 1.0
    importances = {k: round(v / total_imp, 4) for k, v in importances.items()}

    # Save Best Model Artifacts
    joblib.dump(best_model_obj, os.path.join(SAVED_MODELS_DIR, 'best_model.pkl'))

    meta = {
        'best_model_name': best_model_name,
        'best_use_scaled': best_use_scaled,
        'evaluation_results': results,
        'feature_importances': importances,
        'feature_names': feature_names
    }
    with open(os.path.join(SAVED_MODELS_DIR, 'model_metadata.json'), 'w') as f:
        json.dump(meta, f, indent=2)

    print("Model, scaler, and metadata saved to backend/saved_models/")
    return meta

if __name__ == '__main__':
    train_and_evaluate_models()
