"""
Train 5 models, compare, select best, save all.
Run: python -m backend.ml.train
"""
import json
import time
import warnings
warnings.filterwarnings("ignore")
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score, classification_report
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier
import joblib
import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from backend.ml.data.download import get_dataset
from backend.ml.preprocess import prepare_training_data

MODELS_DIR = Path(__file__).parent / "models"
MODELS_DIR.mkdir(exist_ok=True)

MODELS = {
    "logistic_regression": LogisticRegression(max_iter=1000, C=1.0, random_state=42),
    "random_forest": RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42, n_jobs=-1),
    "xgboost": XGBClassifier(n_estimators=200, max_depth=6, learning_rate=0.05, random_state=42, eval_metric="logloss", verbosity=0),
    "lightgbm": LGBMClassifier(n_estimators=200, max_depth=6, learning_rate=0.05, random_state=42, verbose=-1),
    "catboost": CatBoostClassifier(iterations=200, depth=6, learning_rate=0.05, random_seed=42, verbose=False),
}

def train_and_evaluate() -> dict:
    print("Loading dataset...")
    df = get_dataset()
    print(f"Dataset shape: {df.shape}")
    
    X, y, feature_names, scaler = prepare_training_data(df)
    print(f"Features: {feature_names}")
    print(f"Positive rate: {y.mean():.2%}")
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    results = {}
    
    for name, model in MODELS.items():
        print(f"\nTraining {name}...")
        start = time.time()
        
        # Cross-validation
        cv_results = cross_validate(
            model, X, y, cv=cv,
            scoring=["roc_auc", "precision", "recall", "f1"],
            return_train_score=True, n_jobs=-1
        )
        
        # Final fit on full data
        model.fit(X, y)
        elapsed = time.time() - start
        
        results[name] = {
            "roc_auc":   float(cv_results["test_roc_auc"].mean()),
            "precision": float(cv_results["test_precision"].mean()),
            "recall":    float(cv_results["test_recall"].mean()),
            "f1":        float(cv_results["test_f1"].mean()),
            "train_roc_auc": float(cv_results["train_roc_auc"].mean()),
            "std_roc_auc": float(cv_results["test_roc_auc"].std()),
            "training_time_s": round(elapsed, 2),
        }
        
        print(f"  ROC-AUC: {results[name]['roc_auc']:.4f} ± {results[name]['std_roc_auc']:.4f}")
        print(f"  F1:      {results[name]['f1']:.4f}")
        print(f"  Time:    {elapsed:.1f}s")
        
        # Save model
        joblib.dump(model, MODELS_DIR / f"{name}.joblib")
    
    # Select best by ROC-AUC
    best_name = max(results, key=lambda k: results[k]["roc_auc"])
    best_model = joblib.load(MODELS_DIR / f"{best_name}.joblib")
    
    # Save best model as canonical
    joblib.dump(best_model, MODELS_DIR / "best_model.joblib")
    
    # Save comparison JSON
    comparison = {
        "best_model": best_name,
        "best_roc_auc": results[best_name]["roc_auc"],
        "feature_names": feature_names,
        "n_samples": len(y),
        "positive_rate": float(y.mean()),
        "models": results,
    }
    with open(MODELS_DIR / "model_comparison.json", "w") as f:
        json.dump(comparison, f, indent=2)
    
    print(f"\n{'='*50}")
    print(f"Best model: {best_name} (ROC-AUC: {results[best_name]['roc_auc']:.4f})")
    print(f"All models saved to {MODELS_DIR}")
    print(f"{'='*50}")
    
    return comparison

if __name__ == "__main__":
    train_and_evaluate()
