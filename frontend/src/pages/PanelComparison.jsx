import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const PanelComparison = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [availablePanels, setAvailablePanels] = useState([]);
  const [selectedPanels, setSelectedPanels] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailablePanels();
  }, [user]);

  const fetchAvailablePanels = async () => {
    try {
      const res = await axiosInstance.get('/panel', {
        params: user?.role === 'Customer' ? { userId: user._id } : {}
      });
      setAvailablePanels(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch panels');
    }
  };

  // Always use panel._id (ObjectId) for selection
  const handleSelectPanel = (panelId) => {
    setSelectedPanels(prev => {
      if (prev.includes(panelId)) {
        return prev.filter(id => id !== panelId);
      } else if (prev.length < 5) {
        return [...prev, panelId];
      }
      return prev;
    });
  };

  const handleCompare = async () => {
    if (selectedPanels.length < 2) {
      setError('Please select at least 2 panels to compare');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/panel/compare', {
        params: { panelIds: selectedPanels.join(',') }
      });
      setComparisonData(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch comparison data');
    } finally {
      setLoading(false);
    }
  };

  const getEfficiencyColor = (value) => {
    if (value >= 80) return '#27ae60';
    if (value >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const getDowntimeColor = (value) => {
    if (value <= 10) return '#27ae60';
    if (value <= 30) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: '#2c3e50', margin: 0 }}>📊 Panel Comparison</h1>
          <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>Compare performance across multiple solar panels</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 20px',
            background: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Back
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '15px',
          background: '#ffcdd2',
          color: '#c62828',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Panel Selection */}
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Select Panels to Compare (2-5)</h2>
        
        {availablePanels.length === 0 ? (
          <p style={{ color: '#95a5a6' }}>No panels available</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            {availablePanels.map(panel => (
              <div
                key={panel._id}
                onClick={() => handleSelectPanel(panel._id)}
                style={{
                  padding: '15px',
                  border: selectedPanels.includes(panel._id) ? '3px solid #3498db' : '2px solid #ecf0f1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: selectedPanels.includes(panel._id) ? '#e3f2fd' : 'white',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' }}>
                  {selectedPanels.includes(panel._id) && '✓ '}{panel.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>📍 {panel.location}</div>
                <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>⚡ {panel.specifications?.wattage}W</div>
                <div style={{ fontSize: '0.7rem', color: '#bbb', marginTop: '4px' }}>ID: {panel._id}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleCompare}
            disabled={selectedPanels.length < 2 || loading}
            style={{
              padding: '12px 24px',
              background: selectedPanels.length < 2 ? '#95a5a6' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: selectedPanels.length < 2 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            {loading ? 'Comparing...' : `Compare ${selectedPanels.length} Panels`}
          </button>
          {selectedPanels.length > 0 && (
            <button
              onClick={() => setSelectedPanels([])}
              style={{
                padding: '12px 24px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {/* Comparison Results */}
      {comparisonData.length > 0 && (
        <>
          {/* Summary Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
          }}>
            <div style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '10px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🏆</div>
              <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '5px' }}>Best Efficiency</div>
              <div style={{ fontWeight: 'bold', color: '#27ae60', fontSize: '1.2rem' }}>
                {comparisonData.reduce((best, p) => p.metrics.overallEfficiency > best.metrics.overallEfficiency ? p : best).panel.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#27ae60' }}>
                {Math.round(comparisonData.reduce((best, p) => Math.max(best, p.metrics.overallEfficiency), 0))}%
              </div>
            </div>

            <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '10px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '5px' }}>⚡</div>
              <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '5px' }}>Highest Output</div>
              <div style={{ fontWeight: 'bold', color: '#f39c12', fontSize: '1.2rem' }}>
                {comparisonData.reduce((best, p) => p.metrics.avgPowerOutput > best.metrics.avgPowerOutput ? p : best).panel.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#f39c12' }}>
                {Math.round(comparisonData.reduce((best, p) => Math.max(best, p.metrics.avgPowerOutput), 0))}W
              </div>
            </div>

            <div style={{ backgroundColor: '#ffcdd2', padding: '20px', borderRadius: '10px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '5px' }}>⚠️</div>
              <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '5px' }}>Most Downtime</div>
              <div style={{ fontWeight: 'bold', color: '#e74c3c', fontSize: '1.2rem' }}>
                {comparisonData.reduce((worst, p) => p.metrics.downtimePercentage > worst.metrics.downtimePercentage ? p : worst).panel.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#e74c3c' }}>
                {Math.round(comparisonData.reduce((worst, p) => Math.max(worst, p.metrics.downtimePercentage), 0))}%
              </div>
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflowX: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Detailed Metrics</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Metric</th>
                  {comparisonData.map((data, idx) => (
                    <th key={idx} style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {data.panel.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>📍 Location</td>
                  {comparisonData.map((data, idx) => (
                    <td key={idx} style={{ padding: '12px', textAlign: 'center' }}>{data.panel.location}</td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>⚡ Wattage</td>
                  {comparisonData.map((data, idx) => (
                    <td key={idx} style={{ padding: '12px', textAlign: 'center' }}>{data.panel.wattage}W</td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>🏢 Brand</td>
                  {comparisonData.map((data, idx) => (
                    <td key={idx} style={{ padding: '12px', textAlign: 'center' }}>{data.panel.brand || 'N/A'}</td>
                  ))}
                </tr>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>🎯 Overall Efficiency</td>
                  {comparisonData.map((data, idx) => (
                    <td key={idx} style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: getEfficiencyColor(data.metrics.overallEfficiency)
                    }}>
                      {Math.round(data.metrics.overallEfficiency)}%
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>🔋 Avg Power Output</td>
                  {comparisonData.map((data, idx) => (
                    <td key={idx} style={{ padding: '12px', textAlign: 'center' }}>
                      {Math.round(data.metrics.avgPowerOutput)}W
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>🌡️ Avg Temperature</td>
                  {comparisonData.map((data, idx) => (
                    <td key={idx} style={{ padding: '12px', textAlign: 'center' }}>
                      {data.metrics.avgTemperature}°C
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>💨 Avg Dust Level</td>
                  {comparisonData.map((data, idx) => (
                    <td key={idx} style={{ padding: '12px', textAlign: 'center' }}>
                      {data.metrics.avgDust}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>☁️ Avg Shading</td>
                  {comparisonData.map((data, idx) => (
                    <td key={idx} style={{ padding: '12px', textAlign: 'center' }}>
                      {data.metrics.avgShading}%
                    </td>
                  ))}
                </tr>
                <tr style={{ backgroundColor: '#fff3e0', borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>⏱️ Downtime</td>
                  {comparisonData.map((data, idx) => (
                    <td key={idx} style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: getDowntimeColor(data.metrics.downtimePercentage)
                    }}>
                      {Math.round(data.metrics.downtimePercentage)}%
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>📊 Total Readings</td>
                  {comparisonData.map((data, idx) => (
                    <td key={idx} style={{ padding: '12px', textAlign: 'center' }}>
                      {data.metrics.totalReadings}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '12px', fontWeight: '500' }}>⚠️ Critical Readings</td>
                  {comparisonData.map((data, idx) => (
                    <td key={idx} style={{ padding: '12px', textAlign: 'center', color: '#e74c3c', fontWeight: 'bold' }}>
                      {data.metrics.criticalReadings}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Visual Comparison */}
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginTop: '30px'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Visual Comparison</h2>
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Efficiency Bars */}
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#2c3e50', marginBottom: '10px' }}>Overall Efficiency</h3>
                {comparisonData.map((data, idx) => (
                  <div key={idx} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{data.panel.name}</span>
                      <span style={{ fontSize: '0.9rem', color: getEfficiencyColor(data.metrics.overallEfficiency), fontWeight: 'bold' }}>
                        {Math.round(data.metrics.overallEfficiency)}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '20px', backgroundColor: '#ecf0f1', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${data.metrics.overallEfficiency}%`,
                        height: '100%',
                        backgroundColor: getEfficiencyColor(data.metrics.overallEfficiency),
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Power Output Bars */}
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#2c3e50', marginBottom: '10px' }}>Average Power Output</h3>
                {(() => {
                  const maxPower = Math.max(...comparisonData.map(d => d.metrics.avgPowerOutput));
                  return comparisonData.map((data, idx) => (
                    <div key={idx} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{data.panel.name}</span>
                        <span style={{ fontSize: '0.9rem', color: '#3498db', fontWeight: 'bold' }}>
                          {Math.round(data.metrics.avgPowerOutput)}W
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '20px', backgroundColor: '#ecf0f1', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${(data.metrics.avgPowerOutput / maxPower) * 100}%`,
                          height: '100%',
                          backgroundColor: '#3498db',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </>
      )}

      {comparisonData.length === 0 && !loading && (
        <div style={{
          backgroundColor: 'white',
          padding: '60px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📊</div>
          <h3 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>No Comparison Data</h3>
          <p style={{ color: '#7f8c8d' }}>Select at least 2 panels and click "Compare" to see detailed metrics</p>
        </div>
      )}
    </div>
  );
};

export default PanelComparison;
