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
        "system": {"panel_age_years": int, "days_since_cleaning": int, "capacity_kw": float}
    }
    """
    
    # Extract values
    lat = input_data.get("location", {}).get("latitude", 40.79)
    lon = input_data.get("location", {}).get("longitude", -73.95)
    tilt = input_data.get("roof", {}).get("tilt", 30)
    azimuth = input_data.get("roof", {}).get("azimuth", 180)
    system_capacity_kw = input_data.get("system", {}).get("capacity_kw", 5.0)
    panel_age = input_data.get("system", {}).get("panel_age_years", 0)
    days_since_cleaning = input_data.get("system", {}).get("days_since_cleaning", 0)
    
    # Estimate solar irradiance based on latitude (varies significantly by location)
    # Higher latitudes get less solar radiation
    lat_factor = 1.0 - (abs(lat) / 90.0) * 0.4  # Reduce up to 40% at poles
    
    # Base irradiance values adjusted by latitude
    ghi_base = 600.0 * lat_factor  # W/m² - Global Horizontal Irradiance
    dni_base = 850.0 * lat_factor  # W/m² - Direct Normal Irradiance
    dhi_base = 150.0 * lat_factor  # W/m² - Diffuse Horizontal Irradiance
    
    # Adjust for system age (degradation)
    age_degradation = 1.0 - (panel_age * 0.005)  # 0.5% per year
    
    # Adjust for cleaning status (dust accumulation)
    cleaning_factor = 1.0 - min(days_since_cleaning / 90.0, 0.15)  # Up to 15% loss
    
    # Apply degradation factors
    ghi = ghi_base * age_degradation * cleaning_factor
    dni = dni_base * age_degradation * cleaning_factor
    dhi = dhi_base * age_degradation * cleaning_factor
    
    # Temperature varies by latitude (tropical vs temperate)
    temp_air = 25.0 + (abs(lat) - 20) * 0.2  # Warmer near equator
    wind_speed = 2.5 + (abs(lat) / 30) * 0.5  # More wind at higher latitudes
    humidity = max(30.0, 70.0 - abs(lat))  # Higher humidity near equator
    
    # Calculate solar position (varies by latitude - higher elevation near equator)
    sun_elevation = 90.0 - abs(lat) + 15.0  # Higher at equator, lower at poles
    sun_azimuth = azimuth  # Use panel azimuth for alignment
    sun_zenith = 90.0 - sun_elevation
    
    # Tilt optimization factor (better alignment = more POA)
    optimal_tilt = abs(lat)  # Optimal tilt ≈ latitude
    tilt_efficiency = 1.0 - abs(tilt - optimal_tilt) / 90.0  # Penalty for sub-optimal tilt
    
    # Azimuth optimization (180° = south = best for northern hemisphere)
    azimuth_penalty = abs(azimuth - 180.0) / 180.0 * 0.2  # Up to 20% loss for poor orientation
    orientation_factor = 1.0 - azimuth_penalty
    
    # Calculate POA (Plane of Array) irradiance with tilt and orientation adjustments
    poa_global = ghi * 0.85 * tilt_efficiency * orientation_factor
    poa_direct = dni * 0.6 * tilt_efficiency * orientation_factor
    poa_diffuse = dhi * 1.2
    poa_sky_diffuse = dhi * 1.1
    poa_ground_diffuse = ghi * 0.1 * (tilt / 90.0)  # More ground reflection at higher tilt
    
    # Cell temperature (higher temperatures reduce efficiency)
    cell_temperature = temp_air + (poa_global / 800) * 30
    
    # Performance ratio based on system quality and conditions
    performance_ratio = 0.85 * age_degradation * cleaning_factor
    
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
        lat = input_data.get("location", {}).get("latitude", 40.79)
        panel_age = input_data.get("system", {}).get("panel_age_years", 0)
        days_since_cleaning = input_data.get("system", {}).get("days_since_cleaning", 0)
        tilt = input_data.get("roof", {}).get("tilt", 30)
        azimuth = input_data.get("roof", {}).get("azimuth", 180)
        
        # Peak sun hours vary by latitude (tropical regions get more sun)
        # Equator (~0°): 5.5-6 hrs, Mid-latitudes (30-45°): 4-5 hrs, High latitudes (>45°): 3-4 hrs
        lat_abs = abs(lat)
        if lat_abs < 15:
            peak_sun_hours = 6.0  # Tropical
        elif lat_abs < 30:
            peak_sun_hours = 5.5  # Subtropical
        elif lat_abs < 45:
            peak_sun_hours = 4.5  # Temperate
        else:
            peak_sun_hours = 3.5  # High latitude
        
        # Adjust for system orientation and tilt
        optimal_tilt = lat_abs
        tilt_efficiency = 1.0 - abs(tilt - optimal_tilt) / 90.0
        azimuth_efficiency = 1.0 - abs(azimuth - 180.0) / 180.0 * 0.2
        
        # System degradation factors
        age_factor = 1.0 - (panel_age * 0.005)
        cleaning_factor = 1.0 - min(days_since_cleaning / 90.0, 0.15)
        
        # Overall system efficiency
        combined_efficiency = tilt_efficiency * azimuth_efficiency * age_factor * cleaning_factor
        
        # Daily and annual estimates (scale the hourly prediction)
        daily_energy_kwh = energy_kwh * peak_sun_hours * combined_efficiency
        annual_energy_kwh = daily_energy_kwh * 365
        
        # Efficiency calculation based on theoretical maximum
        theoretical_max = system_capacity * peak_sun_hours * 365  # kWh/year at ideal conditions
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
                    "performance_ratio": round(combined_efficiency * 0.85, 3),
                    "degradation_factor": round(age_factor, 3),
                    "soiling_loss_percent": round((1 - cleaning_factor) * 100, 2),
                    "orientation_efficiency": round(azimuth_efficiency, 3),
                    "tilt_efficiency": round(tilt_efficiency, 3)
                },
                "financial": {
                    "annual_savings_inr": round(annual_energy_kwh * 6.5, 0),  # ₹6.5/kWh average tariff
                    "monthly_savings_inr": round((annual_energy_kwh * 6.5) / 12, 0),
                    "25_year_savings_inr": round(annual_energy_kwh * 6.5 * 25 * 0.95, 0),  # 5% discount for degradation
                    "cost_per_kwh": 6.5
                }
            },
            "model_info": {
                "model_name": "Histogram Gradient Boosting",
                "model_version": "1.0.0",
                "trained_on": "2025-09-02 to 2025-11-04 data",
                "accuracy_r2": 0.9990,
                "mape_percent": 0.89
            },
            "input_features": {
                "azimuth": azimuth,
                "panel_age_years": panel_age,
                "days_since_cleaning": days_since_cleaning,
                "peak_sun_hours": round(peak_sun_hours, 2),
                "combined_efficiency": round(combined_efficiency, 3),
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
