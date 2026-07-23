"""
SHAP values and natural language explanations for predictions.
"""
import shap
import numpy as np
import joblib
from pathlib import Path
from typing import List, Dict, Any

MODELS_DIR = Path(__file__).parent / "models"

# Human-readable feature names for natural language generation
FEATURE_DISPLAY_NAMES = {
    "Age": "age",
    "Sex": "biological sex",
    "Systolic_BP": "systolic blood pressure",
    "Diastolic_BP": "diastolic blood pressure",
    "Cholesterol": "cholesterol level",
    "BMI": "body mass index",
    "Smoking": "tobacco use",
    "Exercise_Hours_Per_Week": "weekly exercise",
    "Sleep_Hours_Per_Day": "daily sleep",
    "Stress_Level": "stress level",
    "Max_Heart_Rate": "maximum heart rate",
    "Chest_Pain_Type": "chest pain type",
    "Fasting_Blood_Sugar": "fasting blood sugar",
    "Exercise_Induced_Angina": "exercise-induced angina",
    "ST_Depression": "ST depression",
    "Pulse_Pressure": "pulse pressure",
    "MAP": "mean arterial pressure",
    "HR_Age_Ratio": "heart rate to age ratio",
    "BMI_Category": "BMI category",
    "Chol_Age_Risk": "cholesterol-age risk index",
    "Stress_Sleep_Ratio": "stress-to-sleep ratio",
}

# Features where higher value = higher risk vs lower risk
RISK_DIRECTION = {
    "Age": "increase",
    "Systolic_BP": "increase",
    "Diastolic_BP": "increase",
    "Cholesterol": "increase",
    "BMI": "increase",
    "Smoking": "increase",
    "Stress_Level": "increase",
    "Exercise_Hours_Per_Week": "decrease",
    "Sleep_Hours_Per_Day": "decrease",
    "Max_Heart_Rate": "decrease",
    "Fasting_Blood_Sugar": "increase",
    "Exercise_Induced_Angina": "increase",
    "ST_Depression": "increase",
    "Pulse_Pressure": "increase",
    "MAP": "increase",
    "Stress_Sleep_Ratio": "increase",
    "HR_Age_Ratio": "decrease",
    "BMI_Category": "increase",
    "Chol_Age_Risk": "increase",
    "Sex": "neutral",
    "Chest_Pain_Type": "neutral",
}

def compute_shap_values(model, X: np.ndarray, feature_names: List[str]) -> np.ndarray:
    """Compute SHAP values for a single sample."""
    try:
        model_type = type(model).__name__.lower()
        if "logistic" in model_type or "linear" in model_type:
            explainer = shap.LinearExplainer(model, X, feature_perturbation="interventional")
        else:
            explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X)
        # For binary classification, some models return list of 2 arrays
        if isinstance(shap_values, list):
            shap_values = shap_values[1]  # positive class
        return shap_values
    except Exception as e:
        print(f"SHAP computation failed: {e}")
        return np.zeros((X.shape[0], X.shape[1]))

def get_top_factors(shap_values: np.ndarray, feature_names: List[str], top_n: int = 8) -> List[Dict[str, Any]]:
    """Return top N factors sorted by absolute SHAP value."""
    vals = shap_values[0] if len(shap_values.shape) > 1 else shap_values
    pairs = sorted(zip(feature_names, vals), key=lambda x: abs(x[1]), reverse=True)
    total_abs = sum(abs(v) for _, v in pairs) or 1
    
    factors = []
    for feat, shap_val in pairs[:top_n]:
        impact_pct = round(abs(shap_val) / total_abs * 100, 1)
        direction = "increase" if shap_val > 0 else "decrease"
        factors.append({
            "feature": feat,
            "title": FEATURE_DISPLAY_NAMES.get(feat, feat.replace("_", " ").title()),
            "shap_value": round(float(shap_val), 4),
            "impact_percentage": impact_pct,
            "direction": direction,  # increase/decrease risk
            "description": _get_feature_description(feat, shap_val),
        })
    return factors

def _get_feature_description(feature: str, shap_val: float) -> str:
    """Short clinical description of a feature's impact."""
    descriptions = {
        "Systolic_BP": "Elevated blood pressure significantly increases cardiac strain and arterial wall stress.",
        "Cholesterol": "High LDL cholesterol accelerates atherosclerotic plaque formation in coronary arteries.",
        "Age": "Advancing age progressively increases cumulative cardiovascular disease risk.",
        "BMI": "Excess body mass increases metabolic load on the heart and promotes hypertension.",
        "Smoking": "Tobacco use damages endothelial lining and dramatically accelerates arterial disease.",
        "Exercise_Hours_Per_Week": "Regular aerobic exercise strengthens myocardial function and reduces vascular resistance.",
        "Sleep_Hours_Per_Day": "Adequate sleep is critical for blood pressure regulation and cardiac recovery.",
        "Stress_Level": "Chronic psychological stress elevates cortisol, promoting arterial inflammation.",
        "Max_Heart_Rate": "Reduced maximal heart rate indicates lower cardiorespiratory fitness reserve.",
        "Fasting_Blood_Sugar": "Elevated blood glucose causes progressive vascular damage and neuropathy.",
        "ST_Depression": "ST-segment changes during exercise indicate myocardial ischemia.",
        "Exercise_Induced_Angina": "Chest pain during exercise suggests coronary artery flow limitation.",
        "Pulse_Pressure": "Wide pulse pressure reflects arterial stiffness, a marker of vascular aging.",
        "Stress_Sleep_Ratio": "High stress combined with poor sleep creates compounding cardiac risk.",
    }
    base = descriptions.get(feature, f"{FEATURE_DISPLAY_NAMES.get(feature, feature)} affects cardiovascular risk.")
    return base

def generate_natural_language_explanation(factors: List[Dict], risk_pct: float, risk_category: str) -> str:
    """
    Generate a clinical paragraph explaining the prediction.
    Example output:
    "Your estimated cardiovascular risk is 38.2% (Medium Risk). High systolic blood pressure
    (+14.8% impact) and elevated cholesterol (+11.2% impact) were the primary drivers
    increasing estimated risk. Regular exercise provided a protective effect (-9.5% impact).
    Stress levels also contributed to the elevated risk (+7.3% impact). Focus on blood
    pressure management and maintaining your exercise routine to meaningfully reduce risk."
    """
    risk_drivers = [f for f in factors if f["direction"] == "increase"][:3]
    protective_factors = [f for f in factors if f["direction"] == "decrease"][:2]
    
    parts = []
    parts.append(f"Your estimated cardiovascular risk is {risk_pct:.1f}% ({risk_category}).")
    
    if risk_drivers:
        driver_texts = []
        for f in risk_drivers:
            driver_texts.append(f"{f['title']} (+{f['impact_percentage']}% impact)")
        parts.append("The primary factors increasing estimated risk were: " + ", ".join(driver_texts) + ".")
    
    if protective_factors:
        protect_texts = []
        for f in protective_factors:
            protect_texts.append(f"{f['title']} (-{f['impact_percentage']}% impact)")
        parts.append("Protective factors that reduced risk include: " + ", ".join(protect_texts) + ".")
    
    # Add targeted recommendation
    top_driver = risk_drivers[0] if risk_drivers else None
    if top_driver:
        recs = {
            "Systolic_BP": "Focus on blood pressure management through the DASH diet, reduced sodium intake, and regular aerobic activity.",
            "Cholesterol": "Prioritize LDL reduction through omega-3 rich foods, plant sterols, and physician-guided lipid management.",
            "BMI": "A 10% reduction in body weight can reduce heart disease risk by up to 20%.",
            "Smoking": "Smoking cessation is the single highest-impact cardiovascular intervention available.",
            "Stress_Level": "Implement evidence-based stress reduction: 10-minute daily meditation, 4-7-8 breathing, and regular social connection.",
            "Sleep_Hours_Per_Day": "Prioritize 7-9 hours of sleep — insufficient sleep doubles heart attack risk.",
        }
        rec = recs.get(top_driver["feature"], "Work with your healthcare provider on a personalized risk-reduction plan.")
        parts.append(rec)
    
    return " ".join(parts)
