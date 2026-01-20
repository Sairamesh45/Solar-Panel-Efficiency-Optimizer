"""
Anomaly Detection Service for Solar Panel Sensor Data
Uses IsolationForest to detect outliers in sensor readings.
"""

import json
import joblib
import os
import sys
from pathlib import Path
from typing import Dict, List

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

MODELS_DIR = Path(__file__).parent / "models"
ANOMALY_MODEL_PATH = MODELS_DIR / "anomaly_detector.pkl"
SCALER_PATH = MODELS_DIR / "anomaly_scaler.pkl"


def train_anomaly_detector(data_csv_path: str = None):
    """
    Train anomaly detector on historical sensor data.

    Args:
        data_csv_path: Path to CSV with sensor readings (temp, voltage, current, irradiance)
    """
    if data_csv_path is None:
        data_csv_path = os.path.join(
            os.path.dirname(__file__),
            "dataForML",
            "POWER_Point_Hourly_20250902_20251104_040d79N_073d95W_LST_prepared.csv",
        )

    print(f"Loading data from {data_csv_path}...")
    df = pd.read_csv(data_csv_path)

    # Select sensor-like features
    sensor_features = []
    for col in ["T2M", "RH2M", "WS10M", "WD10M", "ghi", "dni", "dhi", "poa_global"]:
        if col in df.columns:
            sensor_features.append(col)

    if not sensor_features:
        raise ValueError("No sensor features found in data")

    X = df[sensor_features].dropna()
    print(f"Training on {len(X)} samples with features: {sensor_features}")

    # Standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train Isolation Forest
    # contamination=0.05 means we expect ~5% of data to be anomalies
    model = IsolationForest(
        contamination=0.05,
        random_state=42,
        n_estimators=100,
        max_samples="auto",
        n_jobs=-1,
    )
    model.fit(X_scaled)

    # Save model and scaler
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(model, ANOMALY_MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    joblib.dump(sensor_features, MODELS_DIR / "anomaly_features.pkl")

    print(f"Anomaly detector saved to {ANOMALY_MODEL_PATH}")
    print(f"Scaler saved to {SCALER_PATH}")

    # Test on training data to show stats
    predictions = model.predict(X_scaled)
    anomaly_count = (predictions == -1).sum()
    print(
        f"Detected {anomaly_count} anomalies in training data ({anomaly_count/len(X)*100:.2f}%)"
    )

    return model, scaler, sensor_features


def detect_anomalies(sensor_data: List[Dict]) -> Dict:
    """
    Detect anomalies in sensor readings.

    Args:
        sensor_data: List of dicts with sensor readings

    Returns:
        Dict with anomaly predictions and scores
    """
    # Load model and scaler
    if not ANOMALY_MODEL_PATH.exists():
        return {
            "error": "Anomaly detector model not found. Please train first.",
            "model_path": str(ANOMALY_MODEL_PATH),
        }

    model = joblib.load(ANOMALY_MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    feature_names = joblib.load(MODELS_DIR / "anomaly_features.pkl")

    # Convert to DataFrame
    df = pd.DataFrame(sensor_data)

    # Extract features in correct order
    missing_features = [f for f in feature_names if f not in df.columns]
    if missing_features:
        return {
            "error": f"Missing features: {missing_features}",
            "required_features": feature_names,
        }

    X = df[feature_names].values

    # Standardize
    X_scaled = scaler.transform(X)

    # Predict: -1 for anomaly, 1 for normal
    predictions = model.predict(X_scaled)

    # Decision scores (more negative = more anomalous)
    scores = model.decision_function(X_scaled)

    results = []
    for i, (pred, score) in enumerate(zip(predictions, scores)):
        results.append(
            {
                "index": i,
                "is_anomaly": bool(pred == -1),
                "anomaly_score": float(score),
                "confidence": float(
                    1 / (1 + np.exp(score))
                ),  # Convert to 0-1 probability
            }
        )

    anomaly_count = sum(1 for r in results if r["is_anomaly"])

    return {
        "status": "success",
        "total_samples": len(results),
        "anomalies_detected": anomaly_count,
        "anomaly_rate": anomaly_count / len(results) if results else 0.0,
        "results": results,
        "model_info": {
            "model_type": "IsolationForest",
            "features_used": feature_names,
            "contamination_rate": 0.05,
        },
    }


def main():
    """
    Main entry point for CLI and stdin/stdout interface.
    Modes:
      - train: Train the anomaly detector
      - predict: Detect anomalies in provided sensor data (JSON via stdin)
    """
    if len(sys.argv) > 1 and sys.argv[1] == "train":
        # Training mode
        data_path = sys.argv[2] if len(sys.argv) > 2 else None
        train_anomaly_detector(data_path)
        return

    # Prediction mode (default)
    try:
        input_data = json.loads(sys.stdin.read())

        # Expect input like: {"sensor_data": [{...}, {...}]}
        if "sensor_data" not in input_data:
            print(
                json.dumps(
                    {
                        "error": "Expected 'sensor_data' key in input JSON",
                        "example": {"sensor_data": [{"T2M": 25, "ghi": 800}]},
                    }
                )
            )
            sys.exit(1)

        result = detect_anomalies(input_data["sensor_data"])
        print(json.dumps(result, indent=2))

    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
