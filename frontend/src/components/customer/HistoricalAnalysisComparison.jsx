import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuthContext } from '../../context/AuthContext';

const HistoricalAnalysisComparison = () => {
  const { user } = useAuthContext();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId1, setSelectedId1] = useState('');
  const [selectedId2, setSelectedId2] = useState('');
  const [comparison, setComparison] = useState(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    try {
      const res = await axiosInstance.get(`/analysis-history?userId=${user._id}&limit=20`);
      setAnalyses(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch analyses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!selectedId1 || !selectedId2) return;
    
    setComparing(true);
    try {
      const res = await axiosInstance.get(`/analysis-history/compare?id1=${selectedId1}&id2=${selectedId2}`);
      setComparison(res.data.data);
    } catch (err) {
      console.error('Failed to compare analyses:', err);
    } finally {
      setComparing(false);
    }
  };

  const formatValue = (metric, value) => {
    if (value === undefined || value === null) return 'N/A';
    switch (metric) {
      case 'efficiency':
      case 'performanceRatio':
      case 'degradationRate':
      case 'temperatureCoefficient':
        return `${value.toFixed(2)}%`;
      case 'powerOutput':
        return `${value.toFixed(1)} W`;
      case 'systemHealthScore':
        return `${value.toFixed(1)}`;
      case 'energyYield':
        return `${value.toFixed(2)} kWh`;
      default:
        return value.toFixed(2);
    }
  };

  const metricLabels = {
    efficiency: 'Efficiency',
    powerOutput: 'Power Output',
    temperatureCoefficient: 'Temp. Coefficient',
    degradationRate: 'Degradation Rate',
    performanceRatio: 'Performance Ratio',
    systemHealthScore: 'Health Score',
    energyYield: 'Energy Yield'
  };

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Loading analysis history...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>📊 Historical Analysis Comparison</h3>

      {analyses.length < 2 ? (
        <div style={{
          background: '#fff3e0',
          padding: 20,
          borderRadius: 12,
          textAlign: 'center',
          color: '#f57c00'
        }}>
          <p style={{ margin: 0 }}>
            You need at least 2 analyses to compare. Run more solar analyses to unlock this feature!
          </p>
        </div>
      ) : (
        <>
          {/* Selection */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: 16,
            alignItems: 'end',
            marginBottom: 24
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#495057' }}>
                First Analysis
              </label>
              <select
                value={selectedId1}
                onChange={(e) => setSelectedId1(e.target.value)}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: '2px solid #3498db',
                  fontSize: '1rem'
                }}
              >
                <option value="">Select analysis...</option>
                {analyses.map(a => (
                  <option key={a._id} value={a._id} disabled={a._id === selectedId2}>
                    {new Date(a.analysisDate).toLocaleDateString()} - {a.location?.name || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ padding: '0 20px', fontSize: '1.5rem', color: '#7f8c8d' }}>
              vs
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#495057' }}>
                Second Analysis
              </label>
              <select
                value={selectedId2}
                onChange={(e) => setSelectedId2(e.target.value)}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: '2px solid #e74c3c',
                  fontSize: '1rem'
                }}
              >
                <option value="">Select analysis...</option>
                {analyses.map(a => (
                  <option key={a._id} value={a._id} disabled={a._id === selectedId1}>
                    {new Date(a.analysisDate).toLocaleDateString()} - {a.location?.name || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={!selectedId1 || !selectedId2 || comparing}
            style={{
              display: 'block',
              width: '100%',
              padding: '14px 24px',
              background: selectedId1 && selectedId2 ? '#3498db' : '#bdc3c7',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: selectedId1 && selectedId2 ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              fontSize: '1rem',
              marginBottom: 24
            }}
          >
            {comparing ? 'Comparing...' : '🔍 Compare Analyses'}
          </button>

          {/* Comparison Results */}
          {comparison && (
            <div>
              {/* Header with dates */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 20,
                marginBottom: 24
              }}>
                <div style={{
                  background: '#e3f2fd',
                  padding: 16,
                  borderRadius: 12,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#1976d2', marginBottom: 4 }}>First Analysis</div>
                  <div style={{ fontWeight: 700, color: '#2c3e50' }}>
                    {new Date(comparison.analysis1?.analysisDate).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                    {comparison.analysis1?.location?.name || 'Unknown Location'}
                  </div>
                </div>

                <div style={{
                  background: '#ffebee',
                  padding: 16,
                  borderRadius: 12,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#c62828', marginBottom: 4 }}>Second Analysis</div>
                  <div style={{ fontWeight: 700, color: '#2c3e50' }}>
                    {new Date(comparison.analysis2?.analysisDate).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                    {comparison.analysis2?.location?.name || 'Unknown Location'}
                  </div>
                </div>
              </div>

              {/* Metrics Comparison Table */}
              <div style={{
                background: 'white',
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid #e9ecef'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: 14, textAlign: 'left', fontWeight: 600 }}>Metric</th>
                      <th style={{ padding: 14, textAlign: 'center', fontWeight: 600, color: '#1976d2' }}>First</th>
                      <th style={{ padding: 14, textAlign: 'center', fontWeight: 600, color: '#c62828' }}>Second</th>
                      <th style={{ padding: 14, textAlign: 'center', fontWeight: 600 }}>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(comparison.differences || {}).map(([metric, data]) => (
                      <tr key={metric} style={{ borderTop: '1px solid #e9ecef' }}>
                        <td style={{ padding: 14, fontWeight: 600 }}>
                          {metricLabels[metric] || metric}
                        </td>
                        <td style={{ padding: 14, textAlign: 'center' }}>
                          {formatValue(metric, data.value1)}
                        </td>
                        <td style={{ padding: 14, textAlign: 'center' }}>
                          {formatValue(metric, data.value2)}
                        </td>
                        <td style={{ padding: 14, textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 12px',
                            borderRadius: 20,
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            background: data.improved ? '#e8f5e9' : data.difference === 0 ? '#f5f5f5' : '#ffebee',
                            color: data.improved ? '#2e7d32' : data.difference === 0 ? '#7f8c8d' : '#c62828'
                          }}>
                            {data.improved ? '↑' : data.difference === 0 ? '–' : '↓'}
                            {Math.abs(parseFloat(data.percentChange)).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Overall Summary */}
              <div style={{
                marginTop: 24,
                padding: 20,
                background: '#f8f9fa',
                borderRadius: 12
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#2c3e50' }}>Summary</h4>
                {(() => {
                  const improvements = Object.values(comparison.differences || {}).filter(d => d.improved).length;
                  const total = Object.keys(comparison.differences || {}).length;
                  const score = total > 0 ? Math.round((improvements / total) * 100) : 0;
                  
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: score >= 50 ? '#e8f5e9' : '#ffebee',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: score >= 50 ? '#2e7d32' : '#c62828'
                      }}>
                        {score}%
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#2c3e50', marginBottom: 4 }}>
                          {improvements} of {total} metrics improved
                        </div>
                        <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                          {score >= 70 ? 'Great progress! Your system is performing better.' :
                           score >= 50 ? 'Mixed results. Some areas need attention.' :
                           'Performance has declined. Consider maintenance or inspection.'}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Analysis History List */}
          <div style={{ marginTop: 30 }}>
            <h4 style={{ marginBottom: 16, color: '#2c3e50' }}>📜 Recent Analyses</h4>
            <div style={{ display: 'grid', gap: 12 }}>
              {analyses.slice(0, 5).map(analysis => (
                <div
                  key={analysis._id}
                  style={{
                    background: 'white',
                    padding: 16,
                    borderRadius: 10,
                    border: '1px solid #e9ecef',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#2c3e50', marginBottom: 4 }}>
                      {new Date(analysis.analysisDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                      📍 {analysis.location?.name || 'Unknown Location'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      padding: '4px 12px',
                      background: '#e8f5e9',
                      color: '#2e7d32',
                      borderRadius: 20,
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}>
                      {analysis.metrics?.efficiency?.toFixed(1) || 'N/A'}% Efficiency
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoricalAnalysisComparison;
