import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
SAVED_MODELS_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATA_DIR, 'heart_attack_indians.csv')

def generate_or_load_dataset():
    """
    Loads dataset if present, or generates realistic Kaggle-aligned 
    Indian Population Heart Attack Risk dataset (3200 rows, 20+ features).
    """
    if os.path.exists(CSV_PATH):
        print(f"Loading dataset from {CSV_PATH}")
        df = pd.read_csv(CSV_PATH)
        return df

    print("Generating Kaggle Indian Population Heart Attack Risk Dataset benchmark...")
    np.random.seed(42)
    n_samples = 3200

    ages = np.random.randint(22, 85, n_samples)
    genders = np.random.choice(['Male', 'Female'], n_samples, p=[0.58, 0.42])
    systolic = np.random.randint(95, 185, n_samples)
    diastolic = np.random.randint(60, 115, n_samples)
    cholesterol = np.random.randint(130, 360, n_samples)
    heart_rate = np.random.randint(52, 115, n_samples)
    diabetes = np.random.choice([0, 1], n_samples, p=[0.72, 0.28])
    family_history = np.random.choice([0, 1], n_samples, p=[0.65, 0.35])
    smoking = np.random.choice([0, 1], n_samples, p=[0.68, 0.32])
    alcohol = np.random.choice([0, 1], n_samples, p=[0.70, 0.30])
    exercise_hours = np.random.uniform(0, 12, n_samples).round(1)
    diet = np.random.choice(['Unhealthy', 'Average', 'Healthy'], n_samples, p=[0.40, 0.42, 0.18])
    prev_heart_issues = np.random.choice([0, 1], n_samples, p=[0.82, 0.18])
    medication_use = np.random.choice([0, 1], n_samples, p=[0.75, 0.25])
    stress_level = np.random.randint(1, 11, n_samples)
    sedentary_hours = np.random.uniform(2, 14, n_samples).round(1)
    bmi = np.random.uniform(16.5, 38.5, n_samples).round(1)
    triglycerides = np.random.randint(90, 480, n_samples)
    sleep_hours = np.random.randint(4, 11, n_samples)
    water_intake = np.random.uniform(1.0, 4.5, n_samples).round(1)
    chest_pain_type = np.random.choice(['Typical Angina', 'Atypical Angina', 'Non-anginal', 'Asymptomatic'], n_samples, p=[0.25, 0.30, 0.25, 0.20])

    # Realistic Risk Score formulation for target generation
    risk_score = (
        (ages - 20) * 0.03 +
        (systolic - 120) * 0.025 +
        (cholesterol - 180) * 0.015 +
        (bmi - 23) * 0.04 +
        (triglycerides - 150) * 0.008 +
        smoking * 1.8 +
        diabetes * 1.6 +
        family_history * 1.4 +
        prev_heart_issues * 2.2 +
        (stress_level - 5) * 0.25 -
        exercise_hours * 0.28 +
        (diet == 'Unhealthy') * 1.1 -
        (diet == 'Healthy') * 0.9 +
        (sleep_hours < 6) * 0.9
    )

    # Convert continuous score to binary target with noise
    prob = 1 / (1 + np.exp(- (risk_score - 4.5) / 2.0))
    target = np.random.binomial(1, prob)

    df = pd.DataFrame({
        'Age': ages,
        'Gender': genders,
        'Systolic_BP': systolic,
        'Diastolic_BP': diastolic,
        'Cholesterol': cholesterol,
        'Heart_Rate': heart_rate,
        'Diabetes': diabetes,
        'Family_History': family_history,
        'Smoking': smoking,
        'Alcohol_Consumption': alcohol,
        'Exercise_Hours_Per_Week': exercise_hours,
        'Diet': diet,
        'Previous_Heart_Problems': prev_heart_issues,
        'Medication_Use': medication_use,
        'Stress_Level': stress_level,
        'Sedentary_Hours_Per_Day': sedentary_hours,
        'BMI': bmi,
        'Triglycerides': triglycerides,
        'Sleep_Hours_Per_Day': sleep_hours,
        'Daily_Water_Intake': water_intake,
        'Chest_Pain_Type': chest_pain_type,
        'Heart_Attack_Risk': target
    })

    # Add missing values to simulate raw Kaggle data cleaning steps
    mask = np.random.rand(*df.shape) < 0.01
    mask[:, -1] = False # don't mask target
    df[mask] = np.nan

    df.to_csv(CSV_PATH, index=False)
    print(f"Dataset generated and saved to {CSV_PATH} ({df.shape[0]} rows, {df.shape[1]} features)")
    return df


def preprocess_data(df):
    """
    Cleans duplicates, handles missing values, encodes categoricals, 
    and scales numerical features.
    """
    # 1. Deduplicate
    df = df.drop_duplicates().copy()

    # 2. Impute Missing Values
    num_cols = df.select_dtypes(include=[np.number]).columns
    cat_cols = df.select_dtypes(include=['object']).columns

    for col in num_cols:
        if col != 'Heart_Attack_Risk':
            df[col] = df[col].fillna(df[col].median())

    for col in cat_cols:
        df[col] = df[col].fillna(df[col].mode()[0])

    # 3. Categorical Encoding
    label_encoders = {}
    for col in cat_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le

    # Save Label Encoders
    joblib.dump(label_encoders, os.path.join(SAVED_MODELS_DIR, 'label_encoders.pkl'))

    # Feature & Target Split
    X = df.drop(columns=['Heart_Attack_Risk'])
    y = df['Heart_Attack_Risk']

    feature_names = list(X.columns)

    # 4. Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 5. Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Save Scaler & Metadata
    joblib.dump(scaler, os.path.join(SAVED_MODELS_DIR, 'scaler.pkl'))
    joblib.dump(feature_names, os.path.join(SAVED_MODELS_DIR, 'feature_names.pkl'))

    return X_train, X_test, X_train_scaled, X_test_scaled, y_train, y_test, feature_names

if __name__ == '__main__':
    raw_df = generate_or_load_dataset()
    X_tr, X_te, X_tr_s, X_te_s, y_tr, y_te, feats = preprocess_data(raw_df)
    print(f"Preprocessing Complete. Features ({len(feats)}): {feats}")
