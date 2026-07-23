"""
Dataset acquisition with Kaggle + UCI fallback.
"""
import os
import json
import pandas as pd
import numpy as np
from pathlib import Path

DATA_DIR = Path(__file__).parent

def get_dataset() -> pd.DataFrame:
    """
    Try to load from local CSV first.
    If not found, try Kaggle API.
    If Kaggle fails, use UCI Heart Disease dataset from sklearn.
    Returns DataFrame with standardized columns.
    """
    local_path = DATA_DIR / "heart_attack_risk.csv"
    if local_path.exists():
        return pd.read_csv(local_path)
    
    # Try Kaggle
    try:
        import kaggle
        kaggle.api.authenticate()
        kaggle.api.dataset_download_files(
            "iamsouravbanerjee/heart-attack-prediction-dataset",
            path=str(DATA_DIR),
            unzip=True
        )
        # Find the downloaded CSV
        csvs = list(DATA_DIR.glob("*.csv"))
        if csvs:
            df = pd.read_csv(csvs[0])
            df.to_csv(local_path, index=False)
            return df
    except Exception as e:
        print(f"Kaggle download failed: {e}. Using UCI fallback.")
    
    # UCI Heart Disease fallback
    return _get_uci_dataset()

def _get_uci_dataset() -> pd.DataFrame:
    """Load UCI Heart Disease dataset and normalize to our schema."""
    from sklearn.datasets import fetch_openml
    # Use the Cleveland Heart Disease dataset
    try:
        data = fetch_openml("heart-disease", version=1, as_frame=True)
        df = data.frame.copy()
        # Normalize target: 0=no disease, 1=disease
        df['target'] = (df['num'].astype(int) > 0).astype(int)
        df.drop(columns=['num'], inplace=True, errors='ignore')
    except Exception:
        # Last resort: generate synthetic dataset based on known distributions
        df = _generate_synthetic_dataset(1000)
    
    # Rename to our standard column names
    column_map = {
        'age': 'Age',
        'sex': 'Sex',
        'cp': 'Chest_Pain_Type',
        'trestbps': 'Systolic_BP',
        'chol': 'Cholesterol',
        'fbs': 'Fasting_Blood_Sugar',
        'restecg': 'ECG_Results',
        'thalach': 'Max_Heart_Rate',
        'exang': 'Exercise_Induced_Angina',
        'oldpeak': 'ST_Depression',
        'slope': 'ST_Slope',
        'ca': 'Major_Vessels',
        'thal': 'Thalassemia',
    }
    df.rename(columns={k: v for k, v in column_map.items() if k in df.columns}, inplace=True)
    
    # Add synthetic lifestyle features if missing
    np.random.seed(42)
    n = len(df)
    if 'Smoking' not in df.columns:
        df['Smoking'] = np.random.randint(0, 2, n)
    if 'Alcohol_Intake' not in df.columns:
        df['Alcohol_Intake'] = np.random.randint(0, 2, n)
    if 'Exercise_Hours_Per_Week' not in df.columns:
        df['Exercise_Hours_Per_Week'] = np.random.uniform(0, 10, n).round(1)
    if 'BMI' not in df.columns:
        df['BMI'] = np.random.uniform(18.5, 35, n).round(1)
    if 'Sleep_Hours_Per_Day' not in df.columns:
        df['Sleep_Hours_Per_Day'] = np.random.uniform(5, 9, n).round(1)
    if 'Stress_Level' not in df.columns:
        df['Stress_Level'] = np.random.randint(1, 11, n)
    if 'Diastolic_BP' not in df.columns:
        df['Diastolic_BP'] = (df.get('Systolic_BP', pd.Series([120]*n)) * 0.65).round(0).astype(int)
    
    return df

def _generate_synthetic_dataset(n: int = 1000) -> pd.DataFrame:
    """Generate a synthetic heart disease dataset based on clinical distributions."""
    np.random.seed(42)
    ages = np.random.randint(29, 77, n)
    sexes = np.random.randint(0, 2, n)
    systolic_bp = np.random.normal(130, 20, n).clip(90, 200).round(0).astype(int)
    diastolic_bp = (systolic_bp * 0.65 + np.random.normal(0, 5, n)).clip(60, 120).round(0).astype(int)
    cholesterol = np.random.normal(230, 50, n).clip(100, 400).round(0).astype(int)
    bmi = np.random.normal(27, 5, n).clip(15, 45).round(1)
    smoking = np.random.randint(0, 2, n)
    exercise = np.random.uniform(0, 10, n).round(1)
    sleep = np.random.uniform(4, 10, n).round(1)
    stress = np.random.randint(1, 11, n)
    max_hr = (220 - ages + np.random.normal(0, 10, n)).clip(80, 200).round(0).astype(int)
    # Risk score based on clinical formula
    risk_score = (
        (ages - 40) * 0.02 +
        (systolic_bp - 120) * 0.015 +
        (cholesterol - 200) * 0.01 +
        (bmi - 25) * 0.02 +
        smoking * 0.3 +
        (5 - exercise * 0.5) * 0.05 +
        (8 - sleep) * 0.02 +
        (stress - 5) * 0.03 +
        sexes * 0.1
    )
    target = (risk_score > np.percentile(risk_score, 45)).astype(int)
    return pd.DataFrame({
        'Age': ages, 'Sex': sexes, 'Systolic_BP': systolic_bp, 'Diastolic_BP': diastolic_bp,
        'Cholesterol': cholesterol, 'BMI': bmi, 'Smoking': smoking,
        'Exercise_Hours_Per_Week': exercise, 'Sleep_Hours_Per_Day': sleep,
        'Stress_Level': stress, 'Max_Heart_Rate': max_hr, 'target': target,
        'Chest_Pain_Type': np.random.randint(0, 4, n),
        'Fasting_Blood_Sugar': np.random.randint(0, 2, n),
        'Exercise_Induced_Angina': np.random.randint(0, 2, n),
        'ST_Depression': np.random.uniform(0, 5, n).round(1),
    })
