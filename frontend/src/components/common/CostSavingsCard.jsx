import React from 'react';
import './CostSavingsCard.css';

const CostSavingsCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="cost-savings-card loading">
        <div className="spinner"></div>
        <p>Calculating savings...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="cost-savings-card empty">
        <p>No data available</p>
      </div>
    );
  }

  const fm = data.financialMetrics || {};

  return (
    <div className="cost-savings-card">
      <div className="card-header">
        <h3>💰 Financial Metrics</h3>
      </div>
      
      <div className="card-content">
        <div className="metric-grid">
          {/* Total Savings */}
          <div className="metric-item highlight">
            <div className="metric-value">₹{fm.totalSavings?.toLocaleString() || '0'}</div>
            <div className="metric-label">Total Savings</div>
          </div>

          {/* Net Savings */}
          <div className="metric-item highlight-secondary">
            <div className="metric-value">₹{fm.netSavings?.toLocaleString() || '0'}</div>
            <div className="metric-label">Net Savings</div>
          </div>

          {/* ROI */}
          <div className="metric-item">
            <div className="metric-value success">{fm.roi?.toFixed(2) || '0'}%</div>
            <div className="metric-label">Return on Investment</div>
          </div>

          {/* Payback Period */}
          <div className="metric-item">
            <div className="metric-value">{fm.paybackPeriod?.toFixed(1) || '0'}</div>
            <div className="metric-label">Payback Period (months)</div>
          </div>

          {/* Electricity Tariff */}
          <div className="metric-item">
            <div className="metric-value">₹{fm.electricityTariff || '0'}</div>
            <div className="metric-label">Tariff per kWh</div>
          </div>

          {/* Maintenance Costs */}
          <div className="metric-item">
            <div className="metric-value warning">₹{fm.maintenanceCosts?.toLocaleString() || '0'}</div>
            <div className="metric-label">Maintenance Costs</div>
          </div>
        </div>

        {/* Energy Produced */}
        {data.energyProduced && (
          <div className="energy-section">
            <div className="energy-total">
              <span className="energy-icon">⚡</span>
              <span className="energy-value">{data.energyProduced.total?.toFixed(2) || '0'} kWh</span>
              <span className="energy-label">Total Energy Produced</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostSavingsCard;
