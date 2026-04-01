import React from 'react';
import './CarbonFootprintCard.css';

const CarbonFootprintCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="carbon-footprint-card loading">
        <div className="spinner"></div>
        <p>Calculating environmental impact...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="carbon-footprint-card empty">
        <p>No data available</p>
      </div>
    );
  }

  const cf = data.carbonFootprint || {};

  return (
    <div className="carbon-footprint-card">
      <div className="card-header">
        <h3>🌍 Environmental Impact</h3>
      </div>
      
      <div className="card-content">
        {/* Main CO2 Metric */}
        <div className="co2-main">
          <div className="co2-value">{cf.co2Avoided?.toLocaleString() || '0'} kg</div>
          <div className="co2-label">CO₂ Emissions Avoided</div>
        </div>

        {/* Impact Equivalents */}
        <div className="impact-grid">
          <div className="impact-item">
            <div className="impact-icon">🌳</div>
            <div className="impact-value">{cf.treesEquivalent?.toFixed(1) || '0'}</div>
            <div className="impact-label">Trees Planted (1 year)</div>
          </div>

          <div className="impact-item">
            <div className="impact-icon">🚗</div>
            <div className="impact-value">{cf.carsOffRoad?.toFixed(1) || '0'}</div>
            <div className="impact-label">Days of Car Off Road</div>
          </div>

          <div className="impact-item">
            <div className="impact-icon">⚫</div>
            <div className="impact-value">{cf.coalAvoided?.toFixed(1) || '0'} kg</div>
            <div className="impact-label">Coal Avoided</div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="info-section">
          <p className="info-text">
            <strong>Grid Emission Factor:</strong> {cf.gridEmissionFactor || '0.82'} kg CO₂/kWh
          </p>
          <p className="info-description">
            Your solar panels are making a real difference! Every kWh produced reduces carbon emissions 
            and helps combat climate change.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CarbonFootprintCard;
