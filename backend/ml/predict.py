"""
Prediction service — loads model and runs inference.
This module is imported by the FastAPI prediction router.
"""
import json
import numpy as np
import joblib
from pathlib import Path
from typing import Dict, Any, List

MODELS_DIR = Path(__file__).parent / "models"

_model_cache = {}
_model_name_cache = {}

def _load_model(model_name: str = "best_model"):
    if model_name not in _model_cache:
        model_path = MODELS_DIR / f"{model_name}.joblib"
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found: {model_path}. Run: python -m backend.ml.train")
        _model_cache[model_name] = joblib.load(model_path)
    return _model_cache[model_name]

def _get_model_name() -> str:
    comparison_path = MODELS_DIR / "model_comparison.json"
    if comparison_path.exists():
        with open(comparison_path) as f:
            return json.load(f).get("best_model", "best_model")
    return "best_model"

def is_model_ready() -> bool:
    """Check if trained model exists on disk."""
    return (MODELS_DIR / "best_model.joblib").exists()

def calculate_health_score(risk_pct: float, input_data: dict) -> float:
    """
    Calculate a 0-100 health score from risk % and lifestyle factors.
    Higher is better.
    """
    base = 100 - risk_pct * 0.8
    # Bonuses for healthy behaviors
    exercise = input_data.get("Exercise_Hours_Per_Week", 3)
    sleep = input_data.get("Sleep_Hours_Per_Day", 7)
    smoking = input_data.get("Smoking", 0)
    bmi = input_data.get("BMI", 25)
    
    base += min(exercise * 1.2, 10)         # Up to +10 for exercise
    base += max(0, (sleep - 5) * 1.5)       # Up to +6 for good sleep
    base -= smoking * 8                      # -8 for smoking
    base -= max(0, (bmi - 25) * 0.5)        # Deduct for overweight
    
    return round(max(0, min(100, base)), 1)

def get_digital_heart_state(risk_pct: float) -> Dict[str, Any]:
    """Return digital heart parameters based on risk."""
    if risk_pct < 25:
        return {"state": "healthy", "pulse_rate": 68, "artery_health": 92, "color_hex": "#4ADE80"}
    elif risk_pct < 50:
        return {"state": "warning", "pulse_rate": 82, "artery_health": 68, "color_hex": "#FB923C"}
    elif risk_pct < 75:
        return {"state": "critical", "pulse_rate": 96, "artery_health": 42, "color_hex": "#EF4444"}
    else:
        return {"state": "critical", "pulse_rate": 110, "artery_health": 22, "color_hex": "#991B1B"}

def predict_risk(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Full prediction pipeline.
    Returns: risk_percentage, risk_category, confidence_score, health_score,
             shap_factors, explanation, recommendation, digital_heart_state, model_used
    """
    if not is_model_ready():
        return predict_risk_fallback(input_data)
        
    from backend.ml.preprocess import preprocess_single
    from backend.ml.shap_explainer import (
        compute_shap_values, get_top_factors, generate_natural_language_explanation
    )
    
    model_name = _get_model_name()
    model = _load_model()
    
    X_scaled, feature_names = preprocess_single(input_data)
    
    # Get probability
    proba = model.predict_proba(X_scaled)[0]
    risk_pct = float(proba[1] * 100)
    confidence = float(max(proba) * 100)
    
    # Risk category
    if risk_pct < 25:
        category = "Low Risk"
    elif risk_pct < 50:
        category = "Medium Risk"
    elif risk_pct < 75:
        category = "High Risk"
    else:
        category = "Critical Risk"
    
    # SHAP
    shap_vals = compute_shap_values(model, X_scaled, feature_names)
    factors = get_top_factors(shap_vals, feature_names, top_n=8)
    explanation = generate_natural_language_explanation(factors, risk_pct, category)
    
    # Health score
    health_score = calculate_health_score(risk_pct, input_data)
    
    # Digital heart
    heart_data = get_digital_heart_state(risk_pct)
    
    # Recommendations
    top_risk_factors = [f for f in factors if f["direction"] == "increase"][:3]
    rec_parts = ["Based on your assessment:"]
    for f in top_risk_factors:
        rec_parts.append(f"• Address {f['title']}: {f['description']}")
    if not top_risk_factors:
        rec_parts.append("• Maintain your current healthy lifestyle and schedule annual cardiac screening.")
    rec_parts.append("Always consult a qualified cardiologist for personalized medical advice.")
    recommendation = "\n".join(rec_parts)
    
    return {
        "risk_percentage": round(risk_pct, 2),
        "risk_category": category,
        "confidence_score": round(confidence, 1),
        "health_score": health_score,
        "model_used": model_name,
        "shap_factors": factors,
        "explanation": explanation,
        "recommendation": recommendation,
        "digital_heart_state": heart_data["state"],
        "digital_heart": heart_data,
    }

def predict_risk_fallback(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Clinical formula fallback when ML model isn't trained yet.
    Returns same schema as predict_risk.
    """
    age = float(input_data.get("Age", 45))
    sbp = float(input_data.get("Systolic_BP", 120))
    chol = float(input_data.get("Cholesterol", 200))
    bmi = float(input_data.get("BMI", 25))
    smoking = int(input_data.get("Smoking", 0))
    exercise = float(input_data.get("Exercise_Hours_Per_Week", 3))
    sleep = float(input_data.get("Sleep_Hours_Per_Day", 7))
    stress = float(input_data.get("Stress_Level", 5))
    
    score = (
        (age - 35) * 0.5 +
        (sbp - 120) * 0.2 +
        (chol - 200) * 0.02 +
        (bmi - 22) * 0.5 +
        smoking * 15 +
        max(0, (4 - exercise)) * 2 +
        max(0, (7 - sleep)) * 2 +
        (stress - 5) * 1.5
    )
    risk_pct = max(2, min(98, score))
    
    if risk_pct < 25: category = "Low Risk"
    elif risk_pct < 50: category = "Medium Risk"
    elif risk_pct < 75: category = "High Risk"
    else: category = "Critical Risk"
    
    health_score = calculate_health_score(risk_pct, input_data)
    heart_data = get_digital_heart_state(risk_pct)
    
    factors = [
        {"feature": "Systolic_BP", "title": "Systolic Blood Pressure", "shap_value": (sbp-120)*0.003, "impact_percentage": 18.5, "direction": "increase" if sbp > 120 else "decrease", "description": "Blood pressure is the primary driver of cardiovascular risk."},
        {"feature": "Cholesterol", "title": "Total Cholesterol", "shap_value": (chol-200)*0.001, "impact_percentage": 14.2, "direction": "increase" if chol > 200 else "decrease", "description": "Elevated cholesterol promotes arterial plaque."},
        {"feature": "Exercise_Hours_Per_Week", "title": "Weekly Exercise", "shap_value": exercise*-0.01, "impact_percentage": 12.0, "direction": "decrease", "description": "Exercise is the most powerful cardiac protective factor."},
    ]
    
    return {
        "risk_percentage": round(risk_pct, 2),
        "risk_category": category,
        "confidence_score": 78.5,
        "health_score": health_score,
        "model_used": "clinical_formula",
        "shap_factors": factors,
        "explanation": f"Your estimated cardiovascular risk is {risk_pct:.1f}% ({category}). This uses a clinical formula. Train the ML model for higher accuracy.",
        "recommendation": "Consult a cardiologist and train the ML model by running: python -m backend.ml.train",
        "digital_heart_state": heart_data["state"],
        "digital_heart": heart_data,
    }
