import React from 'react';
import EfficiencyLossChart from './EfficiencyLossChart';
import MaintenanceAlert from './MaintenanceAlert';
import { formatCurrency, formatKwh, formatKw, formatPercentage } from '../../utils/formatters';

const SolarResultCard = ({ result }) => {
  if (!result) return null;

  const { systemRecommendation, performanceAnalysis, maintenance, financials } = result;

  return (
    <div style={{ marginTop: '30px', animation: 'fadeIn 0.5s ease-in' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px',
        borderRadius: '15px',
        color: 'white',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '2.2rem' }}>
          ☀️ Solar Analysis Complete
        </h2>
        <p style={{ opacity: 0.9, fontSize: '1.1rem', margin: 0 }}>
          Here are the personalized results for your solar installation
        </p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '25px', 
        marginBottom: '30px' 
      }}>
        
        {/* System Recommendation */}
        <div style={{ 
          background: 'linear-gradient(135deg, #e8f6ef 0%, #c8e6c9 100%)', 
          padding: '25px', 
          borderRadius: '15px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>💡</div>
          <h3 style={{ color: '#27ae60', margin: '0 0 15px 0', fontSize: '1.3rem' }}>
            Recommended System
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#27ae60', marginBottom: '5px' }}>
            {formatKw(systemRecommendation.size_kw)}
          </div>
          <div style={{ color: '#555', fontSize: '0.95rem', marginBottom: '15px' }}>System Size</div>
          <div style={{ 
            borderTop: '1px solid rgba(39, 174, 96, 0.3)', 
            paddingTop: '15px',
            fontSize: '0.95rem'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Annual Generation:</strong><br/>
              <span style={{ fontSize: '1.2rem', color: '#27ae60' }}>
                {formatKwh(systemRecommendation.annual_generation)}
              </span>
            </div>
          </div>
        </div>

        {/* Financials */}
        <div style={{ 
          background: 'linear-gradient(135deg, #fff9e6 0%, #ffe8a1 100%)', 
          padding: '25px', 
          borderRadius: '15px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>💰</div>
          <h3 style={{ color: '#f39c12', margin: '0 0 15px 0', fontSize: '1.3rem' }}>
            Financial Benefits
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f39c12', marginBottom: '5px' }}>
            {formatCurrency(financials.yearly_savings)}
          </div>
          <div style={{ color: '#555', fontSize: '0.95rem', marginBottom: '15px' }}>Yearly Savings</div>
          <div style={{ 
            borderTop: '1px solid rgba(243, 156, 18, 0.3)', 
            paddingTop: '15px',
            fontSize: '0.95rem'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Payback Period:</strong><br/>
              <span style={{ fontSize: '1.2rem', color: '#f39c12' }}>
                {financials.payback_years} Years
              </span>
            </div>
            <div>
              <strong>20-Year Savings:</strong><br/>
              <span style={{ fontSize: '1.2rem', color: '#27ae60' }}>
                {formatCurrency(financials.yearly_savings * 20)}
              </span>
            </div>
          </div>
        </div>

        {/* Efficiency */}
        <div style={{ 
          background: 'linear-gradient(135deg, #fdedec 0%, #f5b7b1 100%)', 
          padding: '25px', 
          borderRadius: '15px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📊</div>
          <h3 style={{ color: '#e74c3c', margin: '0 0 15px 0', fontSize: '1.3rem' }}>
            System Performance
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#e74c3c', marginBottom: '5px' }}>
            {formatPercentage(performanceAnalysis.efficiency_loss)}
          </div>
          <div style={{ color: '#555', fontSize: '0.95rem', marginBottom: '15px' }}>Efficiency Loss</div>
          <div style={{ 
            borderTop: '1px solid rgba(231, 76, 60, 0.3)', 
            paddingTop: '15px',
            fontSize: '0.95rem'
          }}>
            <div>
              <strong>Health Score:</strong><br/>
              <span style={{ 
                fontSize: '1.2rem', 
                color: performanceAnalysis.system_health_score > 80 ? '#27ae60' : 
                       performanceAnalysis.system_health_score > 60 ? '#f39c12' : '#e74c3c'
              }}>
                {performanceAnalysis.system_health_score}/100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Efficiency Loss Breakdown Chart */}
      {performanceAnalysis.loss_breakdown && (
        <div style={{ marginBottom: '30px' }}>
          <EfficiencyLossChart lossBreakdown={performanceAnalysis.loss_breakdown} />
        </div>
      )}

      {/* Maintenance Alerts */}
      {maintenance && (
        <MaintenanceAlert maintenance={maintenance} />
      )}

      {/* Additional Details */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        marginTop: '25px'
      }}>
        <h3 style={{ 
          color: '#2c3e50', 
          borderBottom: '2px solid #3498db', 
          paddingBottom: '12px',
          marginBottom: '20px',
          fontSize: '1.5rem'
        }}>
          📋 Detailed Breakdown
        </h3>
        
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Performance Metrics */}
          <div>
            <h4 style={{ color: '#34495e', marginBottom: '12px', fontSize: '1.1rem' }}>
              ⚡ Performance Metrics
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '15px'
            }}>
              <MetricItem 
                label="Efficiency Loss" 
                value={formatPercentage(performanceAnalysis.efficiency_loss)} 
                color="#e74c3c"
              />
              <MetricItem 
                label="System Health" 
                value={`${performanceAnalysis.system_health_score}/100`} 
                color="#27ae60"
              />
              {performanceAnalysis.loss_breakdown && Object.entries(performanceAnalysis.loss_breakdown).map(([key, value]) => (
                <MetricItem 
                  key={key}
                  label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                  value={formatPercentage(value)} 
                  color="#95a5a6"
                />
              ))}
            </div>
          </div>

          {/* System Specifications */}
          <div>
            <h4 style={{ color: '#34495e', marginBottom: '12px', fontSize: '1.1rem' }}>
              🔧 System Specifications
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '15px'
            }}>
              <MetricItem 
                label="System Size" 
                value={formatKw(systemRecommendation.size_kw)} 
                color="#3498db"
              />
              <MetricItem 
                label="Annual Generation" 
                value={formatKwh(systemRecommendation.annual_generation)} 
                color="#9b59b6"
              />
            </div>
          </div>

          {/* Financial Summary */}
          <div>
            <h4 style={{ color: '#34495e', marginBottom: '12px', fontSize: '1.1rem' }}>
              💵 Financial Summary
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '15px'
            }}>
              <MetricItem 
                label="Yearly Savings" 
                value={formatCurrency(financials.yearly_savings)} 
                color="#27ae60"
              />
              <MetricItem 
                label="Payback Period" 
                value={`${financials.payback_years} years`} 
                color="#f39c12"
              />
              <MetricItem 
                label="20-Year Savings" 
                value={formatCurrency(financials.yearly_savings * 20)} 
                color="#16a085"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ML Model Predictions */}
      {result.mlPredictions && (
        <div style={{
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          marginTop: '25px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '2.5rem', marginRight: '15px' }}>🤖</div>
            <div>
              <h3 style={{ color: '#1976d2', margin: 0, fontSize: '1.8rem' }}>
                AI Model Predictions
              </h3>
              <p style={{ color: '#555', margin: '5px 0 0 0', fontSize: '0.95rem' }}>
                Generated by {result.modelInfo?.name} with {result.modelInfo?.accuracy?.r2_score ? (result.modelInfo.accuracy.r2_score * 100).toFixed(2) + '% accuracy' : 'high accuracy'}
              </p>
            </div>
          </div>

          {/* Instantaneous Power */}
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#1976d2', marginBottom: '15px', fontSize: '1.2rem', borderBottom: '2px solid #1976d2', paddingBottom: '8px' }}>
              ⚡ Instantaneous Power Output
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
              <MetricItem 
                label="DC Power" 
                value={`${result.mlPredictions.instantaneous.dc_power_kw.toFixed(4)} kW`} 
                color="#ff6b6b"
              />
              <MetricItem 
                label="AC Power" 
                value={`${result.mlPredictions.instantaneous.ac_power_kw.toFixed(4)} kW`} 
                color="#4ecdc4"
              />
              <MetricItem 
                label="Hourly Energy" 
                value={`${result.mlPredictions.instantaneous.hourly_energy_kwh.toFixed(4)} kWh`} 
                color="#45b7d1"
              />
            </div>
          </div>

          {/* Daily Production */}
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#1976d2', marginBottom: '15px', fontSize: '1.2rem', borderBottom: '2px solid #1976d2', paddingBottom: '8px' }}>
              📅 Daily Production Estimates
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
              <MetricItem 
                label="Daily Energy" 
                value={`${result.mlPredictions.daily.energy_kwh.toFixed(2)} kWh`} 
                color="#f39c12"
              />
              <MetricItem 
                label="Peak Power" 
                value={`${result.mlPredictions.daily.peak_power_kw.toFixed(2)} kW`} 
                color="#e74c3c"
              />
            </div>
          </div>

          {/* Annual Production */}
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#1976d2', marginBottom: '15px', fontSize: '1.2rem', borderBottom: '2px solid #1976d2', paddingBottom: '8px' }}>
              📊 Annual Production Forecast
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
              <MetricItem 
                label="Annual Energy (kWh)" 
                value={result.mlPredictions.annual.energy_kwh.toLocaleString()} 
                color="#27ae60"
              />
              <MetricItem 
                label="Annual Energy (MWh)" 
                value={result.mlPredictions.annual.energy_mwh.toFixed(2)} 
                color="#16a085"
              />
            </div>
          </div>

          {/* System Efficiency */}
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#1976d2', marginBottom: '15px', fontSize: '1.2rem', borderBottom: '2px solid #1976d2', paddingBottom: '8px' }}>
              🎯 System Efficiency Metrics
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
              <MetricItem 
                label="System Efficiency" 
                value={`${result.mlPredictions.efficiency.system_efficiency_percent.toFixed(2)}%`} 
                color="#9b59b6"
              />
              <MetricItem 
                label="Capacity Factor" 
                value={`${result.mlPredictions.efficiency.capacity_factor_percent.toFixed(2)}%`} 
                color="#8e44ad"
              />
              <MetricItem 
                label="Performance Ratio" 
                value={result.mlPredictions.efficiency.performance_ratio.toFixed(2)} 
                color="#7f27ae"
              />
            </div>
          </div>

          {/* Financial Projections */}
          <div>
            <h4 style={{ color: '#1976d2', marginBottom: '15px', fontSize: '1.2rem', borderBottom: '2px solid #1976d2', paddingBottom: '8px' }}>
              💰 Financial Projections
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
              <MetricItem 
                label="Annual Savings" 
                value={formatCurrency(result.mlPredictions.financial.annual_savings_inr)} 
                color="#27ae60"
              />
              <MetricItem 
                label="Monthly Savings" 
                value={formatCurrency(result.mlPredictions.financial.monthly_savings_inr)} 
                color="#2ecc71"
              />
              <MetricItem 
                label="25-Year Total" 
                value={formatCurrency(result.mlPredictions.financial['25_year_savings_inr'])} 
                color="#16a085"
              />
            </div>
          </div>

          {/* Model Info Badge */}
          {result.modelInfo && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: '#555'
            }}>
              <strong>Model Details:</strong> {result.modelInfo.name} v{result.modelInfo.version} | 
              Accuracy: R² = {(result.modelInfo.accuracy.r2_score * 100).toFixed(2)}% | 
              MAPE = {result.modelInfo.accuracy.mape_percent.toFixed(2)}% | 
              Trained on: {result.modelInfo.trained_on}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MetricItem = ({ label, value, color }) => (
  <div style={{
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    borderLeft: `4px solid ${color}`
  }}>
    <div style={{ 
      fontSize: '0.85rem', 
      color: '#7f8c8d',
      marginBottom: '5px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {label}
    </div>
    <div style={{ 
      fontSize: '1.3rem', 
      fontWeight: 'bold',
      color: color
    }}>
      {value}
    </div>
  </div>
);

export default SolarResultCard;
