"""
Feature engineering, cleaning, encoding, and scaling.
Must handle both training data and inference-time single samples.
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
from typing import Tuple, List
import joblib
from pathlib import Path

MODELS_DIR = Path(__file__).parent / "models"
MODELS_DIR.mkdir(exist_ok=True)

# These are the features we will use for training and inference
FEATURE_COLUMNS = [
    "Age", "Sex", "Systolic_BP", "Diastolic_BP", "Cholesterol", "BMI",
    "Smoking", "Exercise_Hours_Per_Week", "Sleep_Hours_Per_Day",
    "Stress_Level", "Max_Heart_Rate", "Chest_Pain_Type",
    "Fasting_Blood_Sugar", "Exercise_Induced_Angina", "ST_Depression",
]
TARGET_COLUMN = "target"

def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Handle missing values, outliers, type casting."""
    df = df.copy()
    # Drop completely empty rows
    df.dropna(how="all", inplace=True)
    # Only keep columns we need (available ones)
    available = [c for c in FEATURE_COLUMNS if c in df.columns]
    target_available = TARGET_COLUMN in df.columns
    cols = available + ([TARGET_COLUMN] if target_available else [])
    df = df[cols].copy()
    # Fill numeric missing values with median
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        df[col].fillna(df[col].median(), inplace=True)
    # Convert object columns to numeric where possible
    for col in df.select_dtypes(include=[object]).columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        df[col].fillna(df[col].median(), inplace=True)
    return df

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create derived features."""
    df = df.copy()
    if "Systolic_BP" in df.columns and "Diastolic_BP" in df.columns:
        df["Pulse_Pressure"] = df["Systolic_BP"] - df["Diastolic_BP"]
        df["MAP"] = df["Diastolic_BP"] + df["Pulse_Pressure"] / 3  # Mean Arterial Pressure
    if "Age" in df.columns and "Max_Heart_Rate" in df.columns:
        df["HR_Age_Ratio"] = df["Max_Heart_Rate"] / df["Age"].clip(lower=1)
    if "BMI" in df.columns:
        df["BMI_Category"] = pd.cut(df["BMI"], bins=[0, 18.5, 25, 30, 100], labels=[0, 1, 2, 3]).astype(float)
    if "Cholesterol" in df.columns and "Age" in df.columns:
        df["Chol_Age_Risk"] = df["Cholesterol"] * df["Age"] / 1000
    if "Stress_Level" in df.columns and "Sleep_Hours_Per_Day" in df.columns:
        df["Stress_Sleep_Ratio"] = df["Stress_Level"] / df["Sleep_Hours_Per_Day"].clip(lower=0.1)
    return df

ENGINEERED_FEATURES = [
    "Pulse_Pressure", "MAP", "HR_Age_Ratio", "BMI_Category",
    "Chol_Age_Risk", "Stress_Sleep_Ratio"
]

ALL_FEATURES = FEATURE_COLUMNS + ENGINEERED_FEATURES

def prepare_training_data(df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, List[str], StandardScaler]:
    """Full pipeline for training: clean → engineer → impute → scale. Returns X, y, feature_names, scaler."""
    df = clean_dataframe(df)
    df = engineer_features(df)
    
    y = df[TARGET_COLUMN].values if TARGET_COLUMN in df.columns else None
    feature_names = [f for f in ALL_FEATURES if f in df.columns]
    X = df[feature_names].values.astype(float)
    
    # Final imputation for any remaining NaN
    imputer = SimpleImputer(strategy="median")
    X = imputer.fit_transform(X)
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Save imputer + scaler
    joblib.dump(imputer, MODELS_DIR / "imputer.joblib")
    joblib.dump(scaler, MODELS_DIR / "scaler.joblib")
    joblib.dump(feature_names, MODELS_DIR / "feature_names.joblib")
    
    return X_scaled, y, feature_names, scaler

def preprocess_single(input_dict: dict) -> Tuple[np.ndarray, List[str]]:
    """
    Preprocess a single assessment form dict for inference.
    Loads saved scaler/imputer/feature_names from disk.
    input_dict keys match AssessmentFormData from frontend.
    """
    # Map frontend field names to our feature names
    field_map = {
        "Age": "Age",
        "Sex": "Sex",  # 1=Male, 0=Female
        "Systolic_BP": "Systolic_BP",
        "Diastolic_BP": "Diastolic_BP",
        "Cholesterol": "Cholesterol",
        "BMI": "BMI",
        "Smoking": "Smoking",
        "Exercise_Hours_Per_Week": "Exercise_Hours_Per_Week",
        "Sleep_Hours_Per_Day": "Sleep_Hours_Per_Day",
        "Stress_Level": "Stress_Level",
        "Max_Heart_Rate": "Max_Heart_Rate",
        "Chest_Pain_Type": "Chest_Pain_Type",
        "Fasting_Blood_Sugar": "Fasting_Blood_Sugar",
        "Exercise_Induced_Angina": "Exercise_Induced_Angina",
        "ST_Depression": "ST_Depression",
    }
    
    row = {feat: float(input_dict.get(src, 0)) for src, feat in field_map.items()}
    df = pd.DataFrame([row])
    df = engineer_features(df)
    
    feature_names = joblib.load(MODELS_DIR / "feature_names.joblib")
    imputer = joblib.load(MODELS_DIR / "imputer.joblib")
    scaler = joblib.load(MODELS_DIR / "scaler.joblib")
    
    # Align columns
    for f in feature_names:
        if f not in df.columns:
            df[f] = 0.0
    X = df[feature_names].values.astype(float)
    X = imputer.transform(X)
    X_scaled = scaler.transform(X)
    
    return X_scaled, feature_names
