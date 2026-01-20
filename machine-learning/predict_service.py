"""
ML Prediction Service for Solar Panel Efficiency
Loads the trained model and makes predictions based on input features.
"""

import sys
import json
import joblib
import numpy as np
import pandas as pd
import math
from pathlib import Path

# Path to the trained model
MODEL_PATH = Path(__file__).parent / "models" / "best_model_hist_gradient_boosting.pkl"

def prepare_features(input_data):
    """
    Prepare features from frontend input to match training data format.
    Expected input_data structure from frontend:
    {
        "location": {"latitude": float, "longitude": float},
        "roof": {"area": float, "tilt": float, "azimuth": float},
        "energy": {"monthly_consumption": float},
        "system": {"panel_age_years": int, "days_since_cleaning": int}
    }
    """
    
    # Extract values
    lat = input_data.get("location", {}).get("latitude", 40.79)
    lon = input_data.get("location", {}).get("longitude", -73.95)
    tilt = input_data.get("roof", {}).get("tilt", 30)
    azimuth = input_data.get("roof", {}).get("azimuth", 180)
    system_capacity_kw = input_data.get("system", {}).get("capacity_kw", 5.0)
    
    # For prediction, we need typical values for weather/irradiance
    # These should ideally come from a weather API or be estimated based on location
    # Using average values for demonstration
    ghi = 500.0  # W/m² - average solar irradiance
    dni = 700.0
    dhi = 100.0
    temp_air = 25.0  # °C
    wind_speed = 2.0  # m/s
    humidity = 50.0  # %
    
    # Calculate solar position (using noon values as approximation)
    sun_elevation = 45.0
    sun_azimuth = 180.0
    sun_zenith = 45.0
    
    # Calculate POA (Plane of Array) irradiance
    poa_global = ghi * 0.85  # Simplified calculation
    poa_direct = dni * 0.6
    poa_diffuse = dhi * 1.2
    poa_sky_diffuse = dhi * 1.1
    poa_ground_diffuse = ghi * 0.1
    
    # Cell temperature (simplified)
    cell_temperature = temp_air + (poa_global / 800) * 30
    
    # Performance ratio estimate
    performance_ratio = 0.85
    
    # Time features (using typical mid-day values)
    hour = 12
    month = 6  # Mid-year
    day = 15
    year = 2025
    
    # Cyclical encoding
    hour_sin = np.sin(2 * math.pi * hour / 24)
    hour_cos = np.cos(2 * math.pi * hour / 24)
    month_sin = np.sin(2 * math.pi * month / 12)
    month_cos = np.cos(2 * math.pi * month / 12)
    doy = 165  # Mid-year day
    doy_sin = np.sin(2 * math.pi * doy / 365)
    doy_cos = np.cos(2 * math.pi * doy / 365)
    
    # Create feature dictionary matching training data
    features = {
        'YEAR': year,
        'MO': month,
        'DY': day,
        'HR': hour,
        'latitude': lat,
        'longitude': lon,
        'tilt': tilt,
        'azimuth': azimuth,
        'system_capacity_kw': system_capacity_kw,
        'ghi': ghi,
        'dni': dni,
        'dhi': dhi,
        'temp_air': temp_air,
        'wind_speed': wind_speed,
        'humidity': humidity,
        'sun_elevation': sun_elevation,
        'sun_azimuth': sun_azimuth,
        'sun_zenith': sun_zenith,
        'poa_global': poa_global,
        'poa_direct': poa_direct,
        'poa_diffuse': poa_diffuse,
        'poa_sky_diffuse': poa_sky_diffuse,
        'poa_ground_diffuse': poa_ground_diffuse,
        'cell_temperature': cell_temperature,
        'performance_ratio': performance_ratio,
        'hour_sin': hour_sin,
        'hour_cos': hour_cos,
        'month_sin': month_sin,
        'month_cos': month_cos,
        'doy_sin': doy_sin,
        'doy_cos': doy_cos
    }
    
    return pd.DataFrame([features])


def predict_solar_output(input_data):
    """
    Make predictions using the trained ML model.
    Returns predictions for DC power, AC power, and energy output.
    """
    
    try:
        # Load the trained model
        if not MODEL_PATH.exists():
            return {
                "success": False,
                "error": f"Model file not found at {MODEL_PATH}. Please train the model first."
            }
        
        model = joblib.load(MODEL_PATH)
        
        # Prepare features
        X = prepare_features(input_data)
        
        # Make prediction
        predictions = model.predict(X)
        
        # Extract predictions (model outputs 3 values: dc_power_kw, ac_power_kw, energy_kwh)
        dc_power_kw = float(predictions[0][0])
        ac_power_kw = float(predictions[0][1])
        energy_kwh = float(predictions[0][2])
        
        # Calculate additional metrics
        system_capacity = input_data.get("system", {}).get("capacity_kw", 5.0)
        
        # Daily and annual estimates (extrapolating from hourly)
        daily_energy_kwh = energy_kwh * 5.5  # Peak sun hours per day (average)
        annual_energy_kwh = daily_energy_kwh * 365
        
        # Efficiency calculation
        theoretical_max = system_capacity * 5.5 * 365  # kWh/year at 100% efficiency
        actual_efficiency = (annual_energy_kwh / theoretical_max * 100) if theoretical_max > 0 else 0
        
        # Performance metrics
        capacity_factor = (annual_energy_kwh / (system_capacity * 8760)) * 100 if system_capacity > 0 else 0
        
        return {
            "success": True,
            "predictions": {
                "instantaneous": {
                    "dc_power_kw": round(dc_power_kw, 4),
                    "ac_power_kw": round(ac_power_kw, 4),
                    "hourly_energy_kwh": round(energy_kwh, 4)
                },
                "daily": {
                    "energy_kwh": round(daily_energy_kwh, 2),
                    "peak_power_kw": round(ac_power_kw, 2)
                },
                "annual": {
                    "energy_kwh": round(annual_energy_kwh, 0),
                    "energy_mwh": round(annual_energy_kwh / 1000, 2)
                },
                "efficiency": {
                    "system_efficiency_percent": round(actual_efficiency, 2),
                    "capacity_factor_percent": round(capacity_factor, 2),
                    "performance_ratio": 0.85
                },
                "financial": {
                    "annual_savings_inr": round(annual_energy_kwh * 6, 0),  # ₹6/kWh
                    "monthly_savings_inr": round((annual_energy_kwh * 6) / 12, 0),
                    "25_year_savings_inr": round(annual_energy_kwh * 6 * 25, 0)
                }
            },
            "model_info": {
                "model_name": "Histogram Gradient Boosting",
                "model_version": "1.0.0",
                "trained_on": "2025-09-02 to 2025-11-04 data",
                "accuracy_r2": 0.9990,
                "mape_percent": 6.19
            },
            "input_features": {
                "location": f"{input_data.get('location', {}).get('latitude', 0)}, {input_data.get('location', {}).get('longitude', 0)}",
                "system_capacity_kw": system_capacity,
                "tilt": input_data.get("roof", {}).get("tilt", 30),
                "azimuth": input_data.get("roof", {}).get("azimuth", 180)
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def main():
    """
    Main entry point when called from Node.js backend.
    Reads JSON from stdin, makes prediction, outputs JSON to stdout.
    """
    try:
        # Read input from stdin
        input_json = sys.stdin.read()
        input_data = json.loads(input_json)
        
        # Make prediction
        result = predict_solar_output(input_data)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": f"Python service error: {str(e)}"
        }
        print(json.dumps(error_result))
        sys.exit(1)


if __name__ == "__main__":
    main()
