import React, { useState, useEffect } from 'react';
import { getMLModelMetrics } from '../api/ml.api';
import { formatPercentage } from '../utils/formatters';

const MLModelMetrics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelData, setModelData] = useState(null);

  useEffect(() => {
    loadModelMetrics();
  }, []);

  const loadModelMetrics = async () => {
    try {
      setLoading(true);
      const response = await getMLModelMetrics();
      if (response.data.success) {
        setModelData(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Error loading ML metrics:', err);
      setError(err.response?.data?.message || 'Failed to load ML model metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '20px',
            animation: 'spin 2s linear infinite'
          }}>🤖</div>
          <p style={{ color: '#666', fontSize: '1.2rem' }}>Loading ML Model Metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fdedec', 
          color: '#e74c3c', 
          borderRadius: '10px',
          border: '1px solid #fab1a0'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>❌ Error Loading Model Metrics</h3>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!modelData) {
    return null;
  }

  const { metadata, best_model, efficiency_summary } = modelData;
  const { traditional_metrics, efficiency_metrics, sample_predictions } = best_model;

  const getScoreColor = (score) => {
    if (score >= 90) return '#27ae60';
    if (score >= 80) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px',
        borderRadius: '15px',
        color: 'white',
        marginBottom: '40px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
      }}>
        <h1 style={{ margin: '0 0 15px 0', fontSize: '2.8rem' }}>
          🤖 ML Model Performance Dashboard
        </h1>
        <p style={{ opacity: 0.95, fontSize: '1.2rem', margin: 0 }}>
          Advanced machine learning model trained to predict solar power output with high accuracy
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '25px', 
        marginBottom: '40px' 
      }}>
        {/* Model Name */}
        <div style={{ 
          background: 'linear-gradient(135deg, #e8f6ef 0%, #c8e6c9 100%)', 
          padding: '30px', 
          borderRadius: '15px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎯</div>
          <h3 style={{ color: '#27ae60', margin: '0 0 10px 0', fontSize: '1.3rem' }}>
            Best Model
          </h3>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#27ae60',
            textTransform: 'capitalize'
          }}>
            {best_model.model.replace(/_/g, ' ')}
          </div>
        </div>

        {/* R² Score */}
        <div style={{ 
          background: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)', 
          padding: '30px', 
          borderRadius: '15px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📈</div>
          <h3 style={{ color: '#2196F3', margin: '0 0 10px 0', fontSize: '1.3rem' }}>
            Average R² Score
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2196F3' }}>
            {((traditional_metrics.r2.dc_power_kw + traditional_metrics.r2.ac_power_kw + traditional_metrics.r2.energy_kwh) / 3).toFixed(6)}
          </div>
          <div style={{ color: '#555', fontSize: '0.9rem', marginTop: '5px' }}>
            {formatPercentage(((traditional_metrics.r2.dc_power_kw + traditional_metrics.r2.ac_power_kw + traditional_metrics.r2.energy_kwh) / 3) * 100)} variance explained
          </div>
        </div>

        {/* MAPE */}
        <div style={{ 
          background: 'linear-gradient(135deg, #fff9e6 0%, #ffe8a1 100%)', 
          padding: '30px', 
          borderRadius: '15px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎲</div>
          <h3 style={{ color: '#f39c12', margin: '0 0 10px 0', fontSize: '1.3rem' }}>
            Avg Error (MAPE)
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f39c12' }}>
            {((efficiency_metrics.mape.dc_power_kw + efficiency_metrics.mape.ac_power_kw + efficiency_metrics.mape.energy_kwh) / 3).toFixed(2)}%
          </div>
          <div style={{ color: '#555', fontSize: '0.9rem', marginTop: '5px' }}>
            Mean Absolute Percentage Error
          </div>
        </div>

        {/* Accuracy within 5% */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f3e5f5 0%, #ce93d8 100%)', 
          padding: '30px', 
          borderRadius: '15px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✨</div>
          <h3 style={{ color: '#9c27b0', margin: '0 0 10px 0', fontSize: '1.3rem' }}>
            High Accuracy Rate
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#9c27b0' }}>
            {efficiency_metrics.pred_within_5pct.dc_power_kw.toFixed(1)}%
          </div>
          <div style={{ color: '#555', fontSize: '0.9rem', marginTop: '5px' }}>
            Predictions within ±5%
          </div>
        </div>
      </div>

      {/* Detailed Metrics Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '2rem' }}>
          📊 Detailed Performance Metrics
        </h2>
        
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '15px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)' 
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '30px' 
          }}>
            {/* DC Power */}
            <div>
              <h3 style={{ color: '#3498db', marginBottom: '15px', fontSize: '1.4rem' }}>
                ⚡ DC Power Prediction
              </h3>
              <div style={{ fontSize: '0.95rem', lineHeight: '2' }}>
                <div><strong>MAE:</strong> {traditional_metrics.mae.dc_power_kw.toFixed(4)} kW</div>
                <div><strong>RMSE:</strong> {traditional_metrics.rmse.dc_power_kw.toFixed(4)} kW</div>
                <div><strong>R² Score:</strong> <span style={{ color: getScoreColor(traditional_metrics.r2.dc_power_kw * 100) }}>{traditional_metrics.r2.dc_power_kw.toFixed(6)}</span></div>
                <div><strong>MAPE:</strong> {efficiency_metrics.mape.dc_power_kw.toFixed(2)}%</div>
                <div><strong>Within ±5%:</strong> <span style={{ color: getScoreColor(efficiency_metrics.pred_within_5pct.dc_power_kw) }}>{efficiency_metrics.pred_within_5pct.dc_power_kw.toFixed(1)}%</span></div>
                <div><strong>Within ±10%:</strong> <span style={{ color: getScoreColor(efficiency_metrics.pred_within_10pct.dc_power_kw) }}>{efficiency_metrics.pred_within_10pct.dc_power_kw.toFixed(1)}%</span></div>
              </div>
            </div>

            {/* AC Power */}
            <div>
              <h3 style={{ color: '#e74c3c', marginBottom: '15px', fontSize: '1.4rem' }}>
                🔌 AC Power Prediction
              </h3>
              <div style={{ fontSize: '0.95rem', lineHeight: '2' }}>
                <div><strong>MAE:</strong> {traditional_metrics.mae.ac_power_kw.toFixed(4)} kW</div>
                <div><strong>RMSE:</strong> {traditional_metrics.rmse.ac_power_kw.toFixed(4)} kW</div>
                <div><strong>R² Score:</strong> <span style={{ color: getScoreColor(traditional_metrics.r2.ac_power_kw * 100) }}>{traditional_metrics.r2.ac_power_kw.toFixed(6)}</span></div>
                <div><strong>MAPE:</strong> {efficiency_metrics.mape.ac_power_kw.toFixed(2)}%</div>
                <div><strong>Within ±5%:</strong> <span style={{ color: getScoreColor(efficiency_metrics.pred_within_5pct.ac_power_kw) }}>{efficiency_metrics.pred_within_5pct.ac_power_kw.toFixed(1)}%</span></div>
                <div><strong>Within ±10%:</strong> <span style={{ color: getScoreColor(efficiency_metrics.pred_within_10pct.ac_power_kw) }}>{efficiency_metrics.pred_within_10pct.ac_power_kw.toFixed(1)}%</span></div>
              </div>
            </div>

            {/* Energy Output */}
            <div>
              <h3 style={{ color: '#27ae60', marginBottom: '15px', fontSize: '1.4rem' }}>
                💡 Energy Output Prediction
              </h3>
              <div style={{ fontSize: '0.95rem', lineHeight: '2' }}>
                <div><strong>MAE:</strong> {traditional_metrics.mae.energy_kwh.toFixed(4)} kWh</div>
                <div><strong>RMSE:</strong> {traditional_metrics.rmse.energy_kwh.toFixed(4)} kWh</div>
                <div><strong>R² Score:</strong> <span style={{ color: getScoreColor(traditional_metrics.r2.energy_kwh * 100) }}>{traditional_metrics.r2.energy_kwh.toFixed(6)}</span></div>
                <div><strong>MAPE:</strong> {efficiency_metrics.mape.energy_kwh.toFixed(2)}%</div>
                <div><strong>Within ±5%:</strong> <span style={{ color: getScoreColor(efficiency_metrics.pred_within_5pct.energy_kwh) }}>{efficiency_metrics.pred_within_5pct.energy_kwh.toFixed(1)}%</span></div>
                <div><strong>Within ±10%:</strong> <span style={{ color: getScoreColor(efficiency_metrics.pred_within_10pct.energy_kwh) }}>{efficiency_metrics.pred_within_10pct.energy_kwh.toFixed(1)}%</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Predictions */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '2rem' }}>
          🔮 Sample Predictions
        </h2>
        
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '15px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          overflowX: 'auto'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '0.9rem'
          }}>
            <thead>
              <tr style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>DateTime</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actual DC (kW)</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Pred DC (kW)</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Error %</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actual AC (kW)</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Pred AC (kW)</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Error %</th>
              </tr>
            </thead>
            <tbody>
              {sample_predictions.map((pred, idx) => (
                <tr key={idx} style={{ 
                  borderBottom: '1px solid #eee',
                  background: idx % 2 === 0 ? '#f9f9f9' : 'white'
                }}>
                  <td style={{ padding: '12px' }}>{new Date(pred.datetime).toLocaleString()}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{pred.actual_dc_power_kw.toFixed(4)}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{pred.pred_dc_power_kw.toFixed(4)}</td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'right',
                    color: pred.error_pct_dc_power_kw < 5 ? '#27ae60' : pred.error_pct_dc_power_kw < 10 ? '#f39c12' : '#e74c3c',
                    fontWeight: 'bold'
                  }}>
                    {pred.error_pct_dc_power_kw.toFixed(2)}%
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{pred.actual_ac_power_kw.toFixed(4)}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{pred.pred_ac_power_kw.toFixed(4)}</td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'right',
                    color: pred.error_pct_ac_power_kw < 5 ? '#27ae60' : pred.error_pct_ac_power_kw < 10 ? '#f39c12' : '#e74c3c',
                    fontWeight: 'bold'
                  }}>
                    {pred.error_pct_ac_power_kw.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Info */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
        padding: '30px', 
        borderRadius: '15px',
        marginBottom: '40px'
      }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '1.8rem' }}>
          📚 Training Dataset Information
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          fontSize: '0.95rem'
        }}>
          <div>
            <strong>Total Samples:</strong> {metadata.dataset_rows}
          </div>
          <div>
            <strong>Training Set:</strong> {metadata.train_rows}
          </div>
          <div>
            <strong>Test Set:</strong> {metadata.test_rows}
          </div>
          <div>
            <strong>Features:</strong> {metadata.num_features}
          </div>
          <div>
            <strong>Training Time:</strong> {best_model.training_time_seconds.toFixed(2)}s
          </div>
          <div>
            <strong>Targets:</strong> {metadata.targets.join(', ')}
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div style={{ 
        textAlign: 'center', 
        color: '#7f8c8d', 
        fontSize: '0.9rem',
        padding: '20px'
      }}>
        <p>
          This model was trained using historical solar panel performance data with advanced gradient boosting algorithms.
          The high R² scores indicate excellent predictive accuracy for real-world applications.
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MLModelMetrics;
