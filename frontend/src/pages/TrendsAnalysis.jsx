import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getComprehensiveAnalysis, getMaintenanceImpact } from '../api/trends.api';
import { getPanels } from '../api/panel.api';
import { useAuthContext } from '../context/AuthContext';
import PowerVsTimeChart from '../components/solar/PowerVsTimeChart';
import EfficiencyVsTemperatureChart from '../components/solar/EfficiencyVsTemperatureChart';
import MaintenanceImpactChart from '../components/solar/MaintenanceImpactChart';

const TrendsAnalysis = () => {
  const { user } = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [panels, setPanels] = useState([]);
  const [selectedPanel, setSelectedPanel] = useState(searchParams.get('panelId') || '');
  const [analysisData, setAnalysisData] = useState(null);
  const [maintenanceImpact, setMaintenanceImpact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(7);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPanels();
  }, []);

  useEffect(() => {
    if (selectedPanel) {
      fetchAnalysis();
    }
  }, [selectedPanel, days]);

  const fetchPanels = async () => {
    try {
      let res;
      if (user?.role === 'Customer') {
        res = await getPanels(user._id);
      } else {
        res = await getPanels(); // Admin and Installer get all panels
      }
      const panelsData = res.data?.data || [];
      setPanels(panelsData);
      // Auto-select first panel if none selected
      if (panelsData && panelsData.length > 0 && !selectedPanel) {
        setSelectedPanel(panelsData[0]._id);
      }
    } catch (err) {
      console.error('Error fetching panels:', err);
      setError('Failed to load panels');
    }
  };

  const fetchAnalysis = async () => {
    if (!selectedPanel) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await getComprehensiveAnalysis(selectedPanel, days);
      console.log('Analysis data received:', res.data);
      setAnalysisData(res.data);

      // Try to fetch maintenance impact if there are maintenance events in dust pattern
      if (res.data?.dustPattern?.maintenanceEvents?.length > 0) {
        const lastMaintenance = res.data.dustPattern.maintenanceEvents[0];
        try {
          const impactRes = await getMaintenanceImpact(selectedPanel, lastMaintenance.date, 7, 7);
          setMaintenanceImpact(impactRes.data);
        } catch (err) {
          console.error('Error fetching maintenance impact:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError('Failed to load analysis data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePanelChange = (e) => {
    const panelId = e.target.value;
    setSelectedPanel(panelId);
    setSearchParams({ panelId });
  };

  const handleDaysChange = (e) => {
    setDays(parseInt(e.target.value));
  };

  if (loading && !analysisData) {
    return (
      <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', color: '#0d47a1', textAlign: 'center' }}>
          <strong>Loading trends analysis...</strong>
        </div>
      </div>
    );
  }

  // Defensive checks for insufficient or missing data
  const hasEfficiencyDecay = analysisData && analysisData.efficiencyDecay && analysisData.efficiencyDecay.trend !== 'insufficient_data';
  const hasDustPattern = analysisData && analysisData.dustPattern && analysisData.dustPattern.pattern !== 'insufficient_data';
  const hasTempCorrelation = analysisData && analysisData.temperatureCorrelation && analysisData.temperatureCorrelation.correlation !== 'insufficient_data';
  const hasTimeSeries = analysisData && Array.isArray(analysisData.timeSeries) && analysisData.timeSeries.length > 0;

  console.log('Render state:', {
    selectedPanel,
    loading,
    error,
    hasAnalysisData: !!analysisData,
    hasTimeSeries,
    timeSeriesLength: analysisData?.timeSeries?.length
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px', minHeight: '60vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#2c3e50', margin: 0 }}>📊 Trends Analysis</h1>
        <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>Analyze panel performance over time</p>
      </div>

      {/* Controls */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
              Select Panel
            </label>
            <select 
              value={selectedPanel} 
              onChange={handlePanelChange}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            >
              <option value="">-- Select a panel --</option>
              {panels.map(panel => (
                <option key={panel._id} value={panel._id}>
                  {panel.name} - {panel.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
              Analysis Period (Days)
            </label>
            <select 
              value={days} 
              onChange={handleDaysChange}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            >
              <option value={7}>Last 7 Days</option>
              <option value={14}>Last 14 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={60}>Last 60 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {!selectedPanel && (
        <div style={{ backgroundColor: '#fff3e0', color: '#e65100', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          Please select a panel to view trends analysis
        </div>
      )}

      {selectedPanel && analysisData && (
        <>
          {/* Key Insights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            {/* Efficiency Decay */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50', marginBottom: '15px' }}>
                🔋 Efficiency Trend
              </div>
              {hasEfficiencyDecay ? (
                <>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: analysisData.efficiencyDecay.trend === 'declining' ? '#e74c3c' : '#27ae60', marginBottom: '10px' }}>
                    {analysisData.efficiencyDecay.trend === 'declining' ? '📉' : analysisData.efficiencyDecay.trend === 'improving' ? '📈' : '➡️'} 
                    {' '}{analysisData.efficiencyDecay.trend.toUpperCase()}
                  </div>
                  <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                    Current: {analysisData.efficiencyDecay.currentEfficiency}% | 
                    Initial: {analysisData.efficiencyDecay.initialEfficiency}%
                  </div>
                  {analysisData.efficiencyDecay.decayRate !== 0 && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <strong>Decay Rate:</strong> {Math.abs(analysisData.efficiencyDecay.decayRate)}% over {days} days
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: '#bdbdbd', fontSize: '1rem', marginTop: '10px' }}>
                  Not enough data to analyze efficiency trend.
                </div>
              )}
            </div>

            {/* Dust Pattern */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50', marginBottom: '15px' }}>
                🌫️ Dust Pattern
              </div>
              {hasDustPattern ? (
                <>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: analysisData.dustPattern.pattern === 'increasing' ? '#e74c3c' : '#27ae60', marginBottom: '10px' }}>
                    {analysisData.dustPattern.pattern === 'increasing' ? '📈' : analysisData.dustPattern.pattern === 'decreasing' ? '📉' : '➡️'}
                    {' '}{analysisData.dustPattern.pattern.toUpperCase()}
                  </div>
                  <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                    Current Level: {analysisData.dustPattern.currentLevel} | 
                    Average: {analysisData.dustPattern.averageLevel}
                  </div>
                  {analysisData.dustPattern.maintenanceEvents && analysisData.dustPattern.maintenanceEvents.length > 0 && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '6px', fontSize: '0.85rem', color: '#27ae60' }}>
                      <strong>✓ {analysisData.dustPattern.maintenanceEvents.length} maintenance event(s) detected</strong>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: '#bdbdbd', fontSize: '1rem', marginTop: '10px' }}>
                  Not enough data to analyze dust pattern.
                </div>
              )}
            </div>

            {/* Temperature Correlation */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50', marginBottom: '15px' }}>
                🌡️ Temp-Efficiency Link
              </div>
              {hasTempCorrelation ? (
                <>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db', marginBottom: '10px' }}>
                    {analysisData.temperatureCorrelation.correlation.toUpperCase()}
                  </div>
                  <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                    Correlation: {analysisData.temperatureCorrelation.correlationType}
                  </div>
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <strong>Coefficient:</strong> {analysisData.temperatureCorrelation.coefficient}
                    <br />
                    <strong>Temp Range:</strong> {analysisData.temperatureCorrelation.temperatureRange.min}°C - {analysisData.temperatureCorrelation.temperatureRange.max}°C
                  </div>
                </>
              ) : (
                <div style={{ color: '#bdbdbd', fontSize: '1rem', marginTop: '10px' }}>
                  Not enough data to analyze temperature-efficiency correlation.
                </div>
              )}
            </div>
          </div>

          {/* Charts Section */}
          <div style={{ display: 'grid', gap: '30px' }}>
            {/* Power vs Time */}
            {hasTimeSeries ? (
              <PowerVsTimeChart timeSeriesData={analysisData.timeSeries} />
            ) : (
              <div style={{ textAlign: 'center', color: '#bdbdbd', padding: '40px' }}>No time-series data available.</div>
            )}

            {/* Efficiency vs Temperature */}
            {hasTimeSeries ? (
              <EfficiencyVsTemperatureChart timeSeriesData={analysisData.timeSeries} />
            ) : (
              <div style={{ textAlign: 'center', color: '#bdbdbd', padding: '40px' }}>No temperature-efficiency data available.</div>
            )}

            {/* Maintenance Impact */}
            {maintenanceImpact && maintenanceImpact.status === 'analyzed' ? (
              <MaintenanceImpactChart maintenanceImpact={maintenanceImpact} />
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default TrendsAnalysis;
