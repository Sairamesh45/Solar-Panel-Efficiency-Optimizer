"""
Train and compare ML models to predict DC power, AC power, and hourly energy
from prepared solar PV feature data. Outputs a JSON report with metrics and
sample predictions for easy consumption by other services.
"""

import json
import math
import os
from dataclasses import asdict, dataclass
from typing import Dict, List

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.multioutput import MultiOutputRegressor
from sklearn.pipeline import Pipeline
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.preprocessing import StandardScaler

# Reusable constants
TARGET_COLS = ["dc_power_kw", "ac_power_kw", "energy_kwh"]
DEFAULT_DATA_FILE = os.path.join(
    os.path.dirname(__file__),
    "dataForML",
    "POWER_Point_Hourly_20250902_20251104_040d79N_073d95W_LST_prepared.csv",
)


@dataclass
class ModelMetrics:
    mae: Dict[str, float]
    rmse: Dict[str, float]
    r2: Dict[str, float]


@dataclass
class ModelReport:
    model_name: str
    metrics: ModelMetrics
    sample_predictions: List[Dict[str, float]]


def load_and_engineer(csv_path: str) -> pd.DataFrame:
    """Load prepared data and add cyclical time features; clean negatives."""
    df = pd.read_csv(csv_path)
    if "datetime" in df.columns:
        df["datetime"] = pd.to_datetime(df["datetime"], utc=True)
    df = df.sort_values("datetime") if "datetime" in df.columns else df

    # Remove rows with any missing targets
    df = df.dropna(subset=TARGET_COLS)

    # Replace tiny negative irradiance due to noise with zeros
    irradiance_cols = ["ghi", "dni", "dhi", "poa_global", "poa_direct", "poa_diffuse"]
    for col in irradiance_cols:
        if col in df.columns:
            df[col] = df[col].clip(lower=0)

    # Time-based cyclical encodings
    if {"HR", "MO", "DY"}.issubset(df.columns):
        df["hour_sin"] = np.sin(2 * math.pi * df["HR"] / 24)
        df["hour_cos"] = np.cos(2 * math.pi * df["HR"] / 24)
        df["month_sin"] = np.sin(2 * math.pi * df["MO"] / 12)
        df["month_cos"] = np.cos(2 * math.pi * df["MO"] / 12)
        if "datetime" in df.columns:
            doy = df["datetime"].dt.dayofyear
            df["doy_sin"] = np.sin(2 * math.pi * doy / 365)
            df["doy_cos"] = np.cos(2 * math.pi * doy / 365)

    return df


def make_feature_target(df: pd.DataFrame):
    """Split DataFrame into features X and targets y."""
    feature_cols = [
        col
        for col in df.columns
        if col not in TARGET_COLS + ["datetime"]
    ]
    X = df[feature_cols].select_dtypes(exclude=["object"])
    y = df[TARGET_COLS]
    return X, y


def build_models(n_jobs: int = -1) -> Dict[str, Pipeline]:
    """Construct candidate models with reasonable defaults."""
    models = {
        "linear_regression": Pipeline(
            steps=[
                ("scale", StandardScaler()),
                ("multi", MultiOutputRegressor(LinearRegression())),
            ]
        ),
        "random_forest": MultiOutputRegressor(
            RandomForestRegressor(
                n_estimators=200,
                max_depth=12,
                min_samples_leaf=2,
                n_jobs=n_jobs,
                random_state=42,
            )
        ),
        "hist_gradient_boosting": MultiOutputRegressor(
            HistGradientBoostingRegressor(
                learning_rate=0.08,
                max_depth=12,
                max_iter=400,
                min_samples_leaf=2,
                random_state=42,
            )
        ),
    }

    return models


def evaluate_model(model, X_train, X_test, y_train, y_test) -> ModelMetrics:
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    preds_df = pd.DataFrame(preds, columns=TARGET_COLS)

    mae = {
        target: float(mean_absolute_error(y_test[target], preds_df[target]))
        for target in TARGET_COLS
    }
    rmse = {
        target: float(math.sqrt(mean_squared_error(y_test[target], preds_df[target])))
        for target in TARGET_COLS
    }
    r2 = {
        target: float(r2_score(y_test[target], preds_df[target]))
        for target in TARGET_COLS
    }

    return ModelMetrics(mae=mae, rmse=rmse, r2=r2), preds_df


def build_report(df: pd.DataFrame, test_df: pd.DataFrame, y_test: pd.DataFrame, preds_df: pd.DataFrame, model_name: str, metrics: ModelMetrics) -> ModelReport:
    sample = []
    for i in range(min(5, len(test_df))):
        row = {"datetime": str(test_df.iloc[i].get("datetime"))}
        for target in TARGET_COLS:
            row[f"actual_{target}"] = float(y_test.iloc[i][target])
            row[f"pred_{target}"] = float(preds_df.iloc[i][target])
        sample.append(row)

    return ModelReport(
        model_name=model_name,
        metrics=metrics,
        sample_predictions=sample,
    )


def main(csv_path: str = DEFAULT_DATA_FILE) -> str:
    df = load_and_engineer(csv_path)
    X, y = make_feature_target(df)

    # Chronological split to avoid lookahead leakage
    split_idx = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    test_df = df.iloc[split_idx:]

    models = build_models()
    reports: List[ModelReport] = []

    for name, model in models.items():
        metrics, preds_df = evaluate_model(model, X_train, X_test, y_train, y_test)
        reports.append(build_report(df, test_df, y_test, preds_df, name, metrics))

    # Determine best model per target by MAE
    best_per_target = {}
    for target in TARGET_COLS:
        best_model = min(reports, key=lambda r: r.metrics.mae[target])
        best_per_target[target] = {
            "model": best_model.model_name,
            "mae": best_model.metrics.mae[target],
            "rmse": best_model.metrics.rmse[target],
            "r2": best_model.metrics.r2[target],
        }

    payload = {
        "dataset": {
            "rows": len(df),
            "train_rows": len(X_train),
            "test_rows": len(X_test),
            "features": [col for col in X.columns],
            "targets": TARGET_COLS,
        },
        "models": [
            {
                "model": r.model_name,
                "metrics": asdict(r.metrics),
                "sample_predictions": r.sample_predictions,
            }
            for r in reports
        ],
        "best_model_per_target": best_per_target,
    }

    json_output = json.dumps(payload, indent=2)
    print(json_output)
    return json_output


if __name__ == "__main__":
    main()
