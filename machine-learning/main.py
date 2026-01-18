"""
Solar Panel Efficiency Machine Learning Module

This module contains machine learning models and utilities for 
predicting and optimizing solar panel efficiency.
"""

import pvlib
import pandas as pd
import numpy as np
from datetime import datetime
import os


def prepare_ml_training_data(csv_path, output_path=None, 
                             latitude=40.79, longitude=-73.95,
                             tilt=30, azimuth=180, 
                             system_capacity_kw=5.0):
    """
    Prepare solar data for ML model training by adding pvlib calculations.
    
    Args:
        csv_path (str): Path to input CSV file
        output_path (str, optional): Path to save prepared data. If None, saves as *_prepared.csv
        latitude (float): Location latitude in degrees
        longitude (float): Location longitude in degrees
        tilt (float): Panel tilt angle from horizontal (0-90 degrees)
        azimuth (float): Panel azimuth angle (0=North, 90=East, 180=South, 270=West)
        system_capacity_kw (float): System capacity in kilowatts
    
    Returns:
        pd.DataFrame: Prepared dataset with pvlib outputs
    """
    
    print(f"Loading data from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    print(f"Original data shape: {df.shape}")
    
    # Create datetime column
    df['datetime'] = pd.to_datetime(df[['YEAR', 'MO', 'DY', 'HR']].rename(
        columns={'YEAR': 'year', 'MO': 'month', 'DY': 'day', 'HR': 'hour'}
    ))
    
    # Remove rows with 0 irradiance (nighttime)
    print("Removing rows with zero irradiance...")
    df = df[df['ALLSKY_SFC_SW_DWN'] > 0].copy()
    print(f"After filtering: {df.shape}")
    
    # Add system parameters as columns
    df['latitude'] = latitude
    df['longitude'] = longitude
    df['tilt'] = tilt
    df['azimuth'] = azimuth
    df['system_capacity_kw'] = system_capacity_kw
    
    # Rename columns to match pvlib naming
    df.rename(columns={
        'ALLSKY_SFC_SW_DWN': 'ghi',
        'ALLSKY_SFC_SW_DNI': 'dni',
        'ALLSKY_SFC_SW_DIFF': 'dhi',
        'T2M': 'temp_air',
        'WS10M': 'wind_speed',
        'QV2M': 'humidity'
    }, inplace=True)
    
    # Create location object
    location = pvlib.location.Location(latitude, longitude, tz='UTC')
    
    # Set timezone for datetime
    df['datetime'] = df['datetime'].dt.tz_localize('UTC')
    
    print("Calculating solar position...")
    # Calculate solar position
    solar_position = location.get_solarposition(df['datetime'])
    df['sun_elevation'] = solar_position['elevation'].values
    df['sun_azimuth'] = solar_position['azimuth'].values
    df['sun_zenith'] = solar_position['apparent_zenith'].values
    
    print("Calculating POA irradiance...")
    # Calculate plane of array (POA) irradiance
    poa_irradiance = pvlib.irradiance.get_total_irradiance(
        surface_tilt=tilt,
        surface_azimuth=azimuth,
        dni=df['dni'],
        ghi=df['ghi'],
        dhi=df['dhi'],
        solar_zenith=df['sun_zenith'],
        solar_azimuth=df['sun_azimuth']
    )
    
    df['poa_global'] = poa_irradiance['poa_global'].values
    df['poa_direct'] = poa_irradiance['poa_direct'].values
    df['poa_diffuse'] = poa_irradiance['poa_diffuse'].values
    df['poa_sky_diffuse'] = poa_irradiance['poa_sky_diffuse'].values
    df['poa_ground_diffuse'] = poa_irradiance['poa_ground_diffuse'].values
    
    print("Calculating cell temperature...")
    # Calculate cell temperature using SAPM model
    temp_model_params = pvlib.temperature.TEMPERATURE_MODEL_PARAMETERS['sapm']['open_rack_glass_glass']
    cell_temp = pvlib.temperature.sapm_cell(
        poa_global=df['poa_global'],
        temp_air=df['temp_air'],
        wind_speed=df['wind_speed'],
        a=temp_model_params['a'],
        b=temp_model_params['b'],
        deltaT=temp_model_params['deltaT']
    )
    df['cell_temperature'] = cell_temp.values
    
    print("Calculating power output...")
    # Calculate power output with temperature coefficient
    # Standard test conditions: 25°C, efficiency ~15%
    efficiency = 0.15
    temp_coefficient = -0.004  # Power loss per degree C above 25°C
    
    # Temperature correction factor
    temp_correction = 1 + temp_coefficient * (df['cell_temperature'] - 25)
    
    # Calculate DC power output
    df['dc_power_kw'] = (df['poa_global'] / 1000) * system_capacity_kw * efficiency * temp_correction
    df['dc_power_kw'] = df['dc_power_kw'].clip(lower=0)
    
    # AC power (assuming 96% inverter efficiency)
    inverter_efficiency = 0.96
    df['ac_power_kw'] = df['dc_power_kw'] * inverter_efficiency
    
    # Calculate hourly energy
    df['energy_kwh'] = df['ac_power_kw'] * 1.0  # 1 hour intervals
    
    # Calculate performance metrics
    df['performance_ratio'] = np.where(
        df['ghi'] > 0,
        df['ac_power_kw'] / ((df['ghi'] / 1000) * system_capacity_kw * efficiency),
        0
    )
    
    # Reorder columns for better readability
    column_order = [
        'datetime', 'YEAR', 'MO', 'DY', 'HR',
        'latitude', 'longitude', 'tilt', 'azimuth', 'system_capacity_kw',
        'ghi', 'dni', 'dhi',
        'temp_air', 'wind_speed', 'humidity',
        'sun_elevation', 'sun_azimuth', 'sun_zenith',
        'poa_global', 'poa_direct', 'poa_diffuse', 'poa_sky_diffuse', 'poa_ground_diffuse',
        'cell_temperature',
        'dc_power_kw', 'ac_power_kw', 'energy_kwh',
        'performance_ratio'
    ]
    
    df = df[column_order]
    
    # Save prepared data
    if output_path is None:
        base_name = os.path.splitext(csv_path)[0]
        output_path = f"{base_name}_prepared.csv"
    
    df.to_csv(output_path, index=False)
    print(f"\nPrepared data saved to: {output_path}")
    print(f"Final data shape: {df.shape}")
    print(f"\nSummary statistics:")
    print(f"Total energy: {df['energy_kwh'].sum():.2f} kWh")
    print(f"Average power: {df['ac_power_kw'].mean():.2f} kW")
    print(f"Peak power: {df['ac_power_kw'].max():.2f} kW")
    print(f"Average performance ratio: {df['performance_ratio'].mean():.2f}")
    
    return df


def main():
    """
    Main entry point for the ML module - Prepare training data
    """
    print("Solar Panel Efficiency ML Module")
    print("=" * 50)
    
    # Path to the data file
    data_path = os.path.join(
        os.path.dirname(__file__),
        'dataForML',
        'POWER_Point_Hourly_20250902_20251104_040d79N_073d95W_LST.csv'
    )
    
    # Prepare ML training data
    # Location: approximately 40.79°N, 73.95°W (New York area based on filename)
    df = prepare_ml_training_data(
        csv_path=data_path,
        latitude=40.79,
        longitude=-73.95,
        tilt=30,  # Optimal tilt for NYC latitude
        azimuth=180,  # South-facing
        system_capacity_kw=5.0
    )
    
    print("\n" + "=" * 50)
    print("Data preparation complete!")
    print(f"Columns: {list(df.columns)}")


if __name__ == "__main__":
    main()
