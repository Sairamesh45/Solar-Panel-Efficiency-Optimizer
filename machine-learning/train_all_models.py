"""
Train All ML Models - Complete Training Pipeline
Trains power prediction, anomaly detection, and maintenance prediction models.
"""

import os
import sys
from pathlib import Path

print("=" * 70)
print("SOLAR PANEL EFFICIENCY OPTIMIZER - ML TRAINING PIPELINE")
print("=" * 70)

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))


def train_power_models():
    """Train power prediction models (hist_gradient_boosting, random_forest, linear_regression)"""
    print("\n[1/3] Training Power Prediction Models...")
    print("-" * 70)
    try:
        from train_and_finalize import main as train_power

        result = train_power()
        print("✓ Power prediction models trained successfully")
        return True
    except Exception as e:
        print(f"✗ Error training power models: {e}")
        return False


def train_anomaly_model():
    """Train anomaly detection model"""
    print("\n[2/3] Training Anomaly Detection Model...")
    print("-" * 70)
    try:
        from anomaly_detector import train_anomaly_detector

        train_anomaly_detector()
        print("✓ Anomaly detection model trained successfully")
        return True
    except Exception as e:
        print(f"✗ Error training anomaly model: {e}")
        return False


def train_maintenance_model():
    """Train maintenance prediction model"""
    print("\n[3/3] Training Maintenance Prediction Model...")
    print("-" * 70)
    try:
        from maintenance_predictor import train_maintenance_predictor

        train_maintenance_predictor()
        print("✓ Maintenance prediction model trained successfully")
        return True
    except Exception as e:
        print(f"✗ Error training maintenance model: {e}")
        return False


def verify_models():
    """Verify all model files exist"""
    print("\n" + "=" * 70)
    print("VERIFICATION - Checking Model Files")
    print("=" * 70)

    models_dir = Path(__file__).parent / "models"

    required_files = [
        "best_model_hist_gradient_boosting.pkl",
        "best_model_random_forest.pkl",
        "best_model_linear_regression.pkl",
        "anomaly_detector.pkl",
        "anomaly_scaler.pkl",
        "anomaly_features.pkl",
        "maintenance_predictor.pkl",
        "maintenance_scaler.pkl",
        "maintenance_features.pkl",
    ]

    all_present = True
    for file_name in required_files:
        file_path = models_dir / file_name
        if file_path.exists():
            size_kb = file_path.stat().st_size / 1024
            print(f"✓ {file_name:<45} ({size_kb:.1f} KB)")
        else:
            print(f"✗ {file_name:<45} (MISSING)")
            all_present = False

    return all_present


def main():
    """Main training orchestration"""
    results = {
        "power_models": False,
        "anomaly_model": False,
        "maintenance_model": False,
    }

    # Train all models
    results["power_models"] = train_power_models()
    results["anomaly_model"] = train_anomaly_model()
    results["maintenance_model"] = train_maintenance_model()

    # Verify files
    all_files_present = verify_models()

    # Summary
    print("\n" + "=" * 70)
    print("TRAINING SUMMARY")
    print("=" * 70)
    print(
        f"Power Prediction Models:     {'✓ SUCCESS' if results['power_models'] else '✗ FAILED'}"
    )
    print(
        f"Anomaly Detection Model:     {'✓ SUCCESS' if results['anomaly_model'] else '✗ FAILED'}"
    )
    print(
        f"Maintenance Prediction Model: {'✓ SUCCESS' if results['maintenance_model'] else '✗ FAILED'}"
    )
    print(f"All Model Files Present:     {'✓ YES' if all_files_present else '✗ NO'}")

    success_count = sum(results.values())
    print(f"\nTotal: {success_count}/3 models trained successfully")

    if success_count == 3 and all_files_present:
        print("\n🎉 All models trained and verified! Ready for production.")
        print("\nNext steps:")
        print("  1. Review ML_MODELS_GUIDE.md for usage instructions")
        print("  2. Test models with test commands in the guide")
        print("  3. Start backend server to enable ML endpoints")
        return 0
    else:
        print("\n⚠️  Some models failed to train. Check errors above.")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
