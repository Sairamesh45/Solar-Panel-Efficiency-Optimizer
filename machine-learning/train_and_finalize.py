"""
Complete ML pipeline: Train, evaluate, calculate efficiency, and save best model.
Outputs comprehensive JSON report with all metrics and saves the best model.
"""

import json
import joblib
import math
import os
from dataclasses import asdict, dataclass
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.multioutput import MultiOutputRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

TARGET_COLS = ["dc_power_kw", "ac_power_kw", "energy_kwh"]
DEFAULT_DATA_FILE = os.path.join(
    os.path.dirname(__file__),
    "dataForML",
    "POWER_Point_Hourly_20250902_20251104_040d79N_073d95W_LST_prepared.csv",
)
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")


@dataclass
class EfficiencyMetrics:
    """Efficiency-based metrics for model evaluation."""
    mape: Dict[str, float]  # Mean Absolute Percentage Error
    rmse_normalized: Dict[str, float]  # RMSE as % of mean value
    pred_within_5pct: Dict[str, float]  # % predictions within ±5% of actual
    pred_within_10pct: Dict[str, float]  # % predictions within ±10% of actual


@dataclass
class ModelMetrics:
    """Traditional regression metrics."""
    mae: Dict[str, float]
    rmse: Dict[str, float]
    r2: Dict[str, float]


@dataclass
class ModelEvaluation:
    """Complete model evaluation with traditional and efficiency metrics."""
    model_name: str
    metrics: ModelMetrics
    efficiency: EfficiencyMetrics
    sample_predictions: List[Dict[str, float]]
    training_time: float


def load_and_engineer(csv_path: str) -> pd.DataFrame:
    """Load prepared data and add cyclical time features."""
    df = pd.read_csv(csv_path)
    if "datetime" in df.columns:
        df["datetime"] = pd.to_datetime(df["datetime"], utc=True)
    df = df.sort_values("datetime") if "datetime" in df.columns else df

    df = df.dropna(subset=TARGET_COLS)

    irradiance_cols = ["ghi", "dni", "dhi", "poa_global", "poa_direct", "poa_diffuse"]
    for col in irradiance_cols:
        if col in df.columns:
            df[col] = df[col].clip(lower=0)

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
    """Split into features and targets."""
    feature_cols = [
        col for col in df.columns if col not in TARGET_COLS + ["datetime"]
    ]
    X = df[feature_cols].select_dtypes(exclude=["object"])
    y = df[TARGET_COLS]
    return X, y


def build_models(n_jobs: int = -1) -> Dict[str, Pipeline]:
    """Build candidate models."""
    models = {
        "linear_regression": Pipeline(
            steps=[
                ("scale", StandardScaler()),
                ("multi", MultiOutputRegressor(LinearRegression())),
            ]
        ),
        "random_forest": MultiOutputRegressor(
            RandomForestRegressor(
                n_estimators=50,
                max_depth=10,
                min_samples_leaf=2,
                n_jobs=n_jobs,
                random_state=42,
            )
        ),
        "hist_gradient_boosting": MultiOutputRegressor(
            HistGradientBoostingRegressor(
                learning_rate=0.1,
                max_depth=8,
                max_iter=200,
                min_samples_leaf=2,
                random_state=42,
            )
        ),
    }
    return models


def calculate_efficiency_metrics(
    y_test: pd.DataFrame, preds_df: pd.DataFrame
) -> EfficiencyMetrics:
    """Calculate efficiency-based metrics."""
    mape = {}
    rmse_normalized = {}
    within_5pct = {}
    within_10pct = {}

    for target in TARGET_COLS:
        actual = y_test[target].values
        pred = preds_df[target].values

        # MAPE: Mean Absolute Percentage Error
        non_zero = actual != 0
        if non_zero.sum() > 0:
            mape[target] = float(
                np.mean(np.abs((actual[non_zero] - pred[non_zero]) / actual[non_zero])) * 100
            )
        else:
            mape[target] = 0.0

        # Normalized RMSE
        rmse = math.sqrt(mean_squared_error(actual, pred))
        mean_val = np.mean(actual)
        rmse_normalized[target] = float((rmse / mean_val) * 100) if mean_val != 0 else 0.0

        # Percentage within tolerance
        pct_error = np.abs((actual - pred) / (actual + 1e-8)) * 100
        within_5pct[target] = float((pct_error <= 5).sum() / len(pct_error) * 100)
        within_10pct[target] = float((pct_error <= 10).sum() / len(pct_error) * 100)

    return EfficiencyMetrics(
        mape=mape,
        rmse_normalized=rmse_normalized,
        pred_within_5pct=within_5pct,
        pred_within_10pct=within_10pct,
    )


def evaluate_model(
    model, X_train, X_test, y_train, y_test
) -> Tuple[ModelMetrics, EfficiencyMetrics, pd.DataFrame]:
    """Train and evaluate model."""
    import time
    start = time.time()
    model.fit(X_train, y_train)
    training_time = time.time() - start
    
    preds = model.predict(X_test)
    preds_df = pd.DataFrame(preds, columns=TARGET_COLS)

    mae = {
        target: float(mean_absolute_error(y_test[target], preds_df[target]))
        for target in TARGET_COLS
    }
    rmse = {
        target: float(
            math.sqrt(mean_squared_error(y_test[target], preds_df[target]))
        )
        for target in TARGET_COLS
    }
    r2 = {
        target: float(r2_score(y_test[target], preds_df[target]))
        for target in TARGET_COLS
    }

    metrics = ModelMetrics(mae=mae, rmse=rmse, r2=r2)
    efficiency = calculate_efficiency_metrics(y_test, preds_df)

    return metrics, efficiency, preds_df, training_time


def build_evaluation_report(
    df: pd.DataFrame,
    test_df: pd.DataFrame,
    y_test: pd.DataFrame,
    preds_df: pd.DataFrame,
    model_name: str,
    metrics: ModelMetrics,
    efficiency: EfficiencyMetrics,
    training_time: float,
) -> ModelEvaluation:
    """Build evaluation report."""
    sample = []
    for i in range(min(5, len(test_df))):
        row = {"datetime": str(test_df.iloc[i].get("datetime", ""))}
        for target in TARGET_COLS:
            row[f"actual_{target}"] = float(y_test.iloc[i][target])
            row[f"pred_{target}"] = float(preds_df.iloc[i][target])
            actual = y_test.iloc[i][target]
            pred = preds_df.iloc[i][target]
            pct_error = abs((actual - pred) / (actual + 1e-8)) * 100
            row[f"error_pct_{target}"] = float(pct_error)
        sample.append(row)

    return ModelEvaluation(
        model_name=model_name,
        metrics=metrics,
        efficiency=efficiency,
        sample_predictions=sample,
        training_time=training_time,
    )


def main(csv_path: str = DEFAULT_DATA_FILE) -> str:
    """Main training and evaluation pipeline."""
    # Create models directory
    os.makedirs(MODELS_DIR, exist_ok=True)

    print("Loading and engineering data...")
    df = load_and_engineer(csv_path)
    X, y = make_feature_target(df)

    # Chronological split
    split_idx = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    test_df = df.iloc[split_idx:]

    print("Training models...")
    models = build_models()
    evaluations: List[ModelEvaluation] = []

    for name, model in models.items():
        print(f"  Training {name}...")
        metrics, efficiency, preds_df, training_time = evaluate_model(
            model, X_train, X_test, y_train, y_test
        )
        evaluation = build_evaluation_report(
            df, test_df, y_test, preds_df, name, metrics, efficiency, training_time
        )
        evaluations.append(evaluation)

    # Overall best model (by average R² across all targets)
    best_eval = max(
        evaluations,
        key=lambda e: np.mean([e.metrics.r2[t] for t in TARGET_COLS])
    )
    print(f"\nBest overall model: {best_eval.model_name}")
    print(f"  Average R²: {np.mean([best_eval.metrics.r2[t] for t in TARGET_COLS]):.6f}")
    print(f"  Average MAPE: {np.mean([best_eval.efficiency.mape[t] for t in TARGET_COLS]):.4f}%")

    # Save best model
    best_model = models[best_eval.model_name]
    best_model.fit(X_train, y_train)
    model_path = os.path.join(MODELS_DIR, f"best_model_{best_eval.model_name}.pkl")
    joblib.dump(best_model, model_path)
    print(f"Best model saved to: {model_path}")

    # Build JSON payload with only the best model's outputs
    payload = {
        "metadata": {
            "dataset_rows": len(df),
            "train_rows": len(X_train),
            "test_rows": len(X_test),
            "num_features": len(X.columns),
            "targets": TARGET_COLS,
        },
        "best_model": {
            "model": best_eval.model_name,
            "traditional_metrics": asdict(best_eval.metrics),
            "efficiency_metrics": asdict(best_eval.efficiency),
            "training_time_seconds": best_eval.training_time,
            "sample_predictions": best_eval.sample_predictions,
            "model_path": model_path,
        },
    }

    json_output = json.dumps(payload, indent=2)
    print("\n" + "="*60)
    print("FINAL EVALUATION REPORT (JSON)")
    print("="*60)
    print(json_output)
    return json_output


if __name__ == "__main__":
    main()
