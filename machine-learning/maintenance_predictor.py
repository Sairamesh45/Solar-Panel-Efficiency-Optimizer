"""
Predictive Maintenance Service for Solar Panels
Predicts efficiency degradation and optimal cleaning timing based on:
- Days since last cleaning
- Environmental conditions (dust, humidity)
- Historical performance data
"""

import json
import joblib
import os
import sys
from pathlib import Path
from typing import Dict, List

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

MODELS_DIR = Path(__file__).parent / "models"
MAINTENANCE_MODEL_PATH = MODELS_DIR / "maintenance_predictor.pkl"
MAINTENANCE_SCALER_PATH = MODELS_DIR / "maintenance_scaler.pkl"


def create_maintenance_training_data(base_data_csv: str = None) -> pd.DataFrame:
    """
    Generate synthetic maintenance training data based on environmental conditions.
    In production, this would use real maintenance logs.
    """
    if base_data_csv is None:
        base_data_csv = os.path.join(
            os.path.dirname(__file__),
            "dataForML",
            "POWER_Point_Hourly_20250902_20251104_040d79N_073d95W_LST_prepared.csv",
        )

    df = pd.read_csv(base_data_csv)

    # Simulate maintenance scenarios
    np.random.seed(42)
    n_samples = min(5000, len(df))

    # Sample random rows
    samples = df.sample(n=n_samples, random_state=42).copy()

    # Add maintenance-related features
    samples["days_since_cleaning"] = np.random.randint(0, 90, size=n_samples)
    samples["dust_level"] = np.random.uniform(0, 1, size=n_samples)
    samples["avg_humidity"] = samples.get("RH2M", 50) / 100.0

    # Calculate simulated efficiency loss
    # Loss increases with days since cleaning, dust, and decreases with humidity (rain cleans)
    base_loss = (
        samples["days_since_cleaning"] / 90 * 0.15
    )  # Up to 15% loss after 90 days
    dust_impact = samples["dust_level"] * 0.10  # Up to 10% loss from dust
    humidity_benefit = (
        samples["avg_humidity"] * -0.03
    )  # Rain helps clean (up to 3% benefit)

    # Add some noise
    noise = np.random.normal(0, 0.01, size=n_samples)

    samples["efficiency_loss_pct"] = (
        np.clip(
            base_loss + dust_impact + humidity_benefit + noise, 0, 0.30  # Max 30% loss
        )
        * 100
    )  # Convert to percentage

    # Optimal cleaning day (when loss exceeds threshold or after 60 days)
    samples["should_clean"] = (
        (samples["efficiency_loss_pct"] > 8) | (samples["days_since_cleaning"] > 60)
    ).astype(int)

    return samples


def train_maintenance_predictor(data_csv_path: str = None):
    """
    Train predictive maintenance model.

    Args:
        data_csv_path: Path to CSV with maintenance data
    """
    print("Generating maintenance training data...")
    df = create_maintenance_training_data(data_csv_path)

    # Features for prediction
    feature_cols = [
        "days_since_cleaning",
        "dust_level",
        "avg_humidity",
        "T2M",  # Temperature
        "WS10M",  # Wind speed
        "ghi",  # Solar irradiance
    ]

    # Check available features
    available_features = [col for col in feature_cols if col in df.columns]
    if "days_since_cleaning" not in available_features:
        raise ValueError("days_since_cleaning is required")

    print(f"Training on features: {available_features}")

    X = df[available_features].fillna(0)
    y = df["efficiency_loss_pct"]

    # Split chronologically
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    # Standardize features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train Random Forest
    model = RandomForestRegressor(
        n_estimators=100, max_depth=10, min_samples_leaf=5, random_state=42, n_jobs=-1
    )
    model.fit(X_train_scaled, y_train)

    # Evaluate
    train_score = model.score(X_train_scaled, y_train)
    test_score = model.score(X_test_scaled, y_test)
    print(f"Training R²: {train_score:.4f}")
    print(f"Test R²: {test_score:.4f}")

    # Feature importance
    importance = pd.DataFrame(
        {"feature": available_features, "importance": model.feature_importances_}
    ).sort_values("importance", ascending=False)
    print("\nFeature Importance:")
    print(importance.to_string(index=False))

    # Save model
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(model, MAINTENANCE_MODEL_PATH)
    joblib.dump(scaler, MAINTENANCE_SCALER_PATH)
    joblib.dump(available_features, MODELS_DIR / "maintenance_features.pkl")

    print(f"\nMaintenance predictor saved to {MAINTENANCE_MODEL_PATH}")

    return model, scaler, available_features


def predict_maintenance_need(panel_data: List[Dict]) -> Dict:
    """
    Predict efficiency loss and maintenance needs.

    Args:
        panel_data: List of dicts with panel conditions

    Returns:
        Dict with maintenance predictions
    """
    # Load model
    if not MAINTENANCE_MODEL_PATH.exists():
        return {
            "error": "Maintenance predictor model not found. Please train first.",
            "model_path": str(MAINTENANCE_MODEL_PATH),
        }

    model = joblib.load(MAINTENANCE_MODEL_PATH)
    scaler = joblib.load(MAINTENANCE_SCALER_PATH)
    feature_names = joblib.load(MODELS_DIR / "maintenance_features.pkl")

    # Convert to DataFrame
    df = pd.DataFrame(panel_data)

    # Check for required features
    missing_features = [f for f in feature_names if f not in df.columns]
    if missing_features:
        # Fill with defaults for optional features
        for feat in missing_features:
            if feat != "days_since_cleaning":  # This one is required
                df[feat] = 0

        # Re-check
        missing_features = [f for f in feature_names if f not in df.columns]
        if missing_features:
            return {
                "error": f"Missing required features: {missing_features}",
                "required_features": feature_names,
            }

    X = df[feature_names].fillna(0).values

    # Standardize
    X_scaled = scaler.transform(X)

    # Predict efficiency loss
    predicted_loss = model.predict(X_scaled)

    results = []
    for i, loss in enumerate(predicted_loss):
        days_since = df.iloc[i].get("days_since_cleaning", 0)

        # Recommend cleaning if loss > 8% or days > 60
        should_clean = loss > 8 or days_since > 60

        # Estimate days until cleaning needed
        if should_clean:
            days_until_cleaning = 0
        else:
            # Rough estimate: assume linear degradation
            if loss < 8:
                days_until_cleaning = int((8 - loss) / (loss / max(days_since, 1)))
            else:
                days_until_cleaning = 0

        results.append(
            {
                "index": i,
                "days_since_cleaning": int(days_since),
                "predicted_efficiency_loss_pct": float(loss),
                "should_clean": bool(should_clean),
                "days_until_cleaning_recommended": max(0, days_until_cleaning),
                "urgency": "high" if loss > 12 else "medium" if loss > 8 else "low",
                "estimated_recovery_pct": float(
                    min(loss * 0.9, loss)
                ),  # Cleaning recovers ~90% of loss
            }
        )

    avg_loss = float(np.mean(predicted_loss))
    panels_needing_cleaning = sum(1 for r in results if r["should_clean"])

    return {
        "status": "success",
        "total_panels": len(results),
        "panels_needing_cleaning": panels_needing_cleaning,
        "average_efficiency_loss_pct": avg_loss,
        "results": results,
        "model_info": {
            "model_type": "RandomForestRegressor",
            "features_used": feature_names,
            "cleaning_threshold_pct": 8.0,
            "max_days_between_cleaning": 60,
        },
    }


def main():
    """
    Main entry point for CLI and stdin/stdout interface.
    Modes:
      - train: Train the maintenance predictor
      - predict: Predict maintenance needs (JSON via stdin)
    """
    if len(sys.argv) > 1 and sys.argv[1] == "train":
        # Training mode
        data_path = sys.argv[2] if len(sys.argv) > 2 else None
        train_maintenance_predictor(data_path)
        return

    # Prediction mode (default)
    try:
        input_data = json.loads(sys.stdin.read())

        # Expect: {"panel_data": [{...}, {...}]}
        if "panel_data" not in input_data:
            print(
                json.dumps(
                    {
                        "error": "Expected 'panel_data' key in input JSON",
                        "example": {
                            "panel_data": [
                                {"days_since_cleaning": 30, "dust_level": 0.5}
                            ]
                        },
                    }
                )
            )
            sys.exit(1)

        result = predict_maintenance_need(input_data["panel_data"])
        print(json.dumps(result, indent=2))

    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
