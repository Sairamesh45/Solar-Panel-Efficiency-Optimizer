import React, { useState, useEffect } from 'react';
import { getPanels } from '../api/panel.api';
import { generateAnalytics, getCumulativeAnalytics } from '../api/analytics.api';
import CostSavingsCard from '../components/common/CostSavingsCard';
import CarbonFootprintCard from '../components/common/CarbonFootprintCard';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const [panels, setPanels] = useState([]);
  const [selectedPanel, setSelectedPanel] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [cumulative, setCumulative] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [systemCost, setSystemCost] = useState('');
  const [electricityTariff, setElectricityTariff] = useState('6.5');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      fetchPanels();
    } catch (err) {
      console.error('Error in fetchPanels useEffect:', err);
      setHasError(true);
    }
  }, []);

  useEffect(() => {
    try {
      if (selectedPanel) {
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Error in fetchAnalytics useEffect:', err);
      setHasError(true);
    }
  }, [selectedPanel, dateRange]);

  useEffect(() => {
    try {
      fetchCumulativeAnalytics();
    } catch (err) {
      console.error('Error in fetchCumulativeAnalytics useEffect:', err);
    }
  }, [selectedPanel]);

  const fetchPanels = async () => {
    try {
      const response = await getPanels();
      if (response?.success && response?.data) {
        setPanels(response.data);
        if (response.data.length > 0) {
          setSelectedPanel(response.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching panels:', err);
      setError('Failed to load panels. Please check if the backend is running.');
    }
  };

  const fetchAnalytics = async () => {
    if (!selectedPanel) return;

    try {
      setLoading(true);
      setError('');

      const response = await generateAnalytics({
        panelId: selectedPanel,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        systemCost: systemCost || 0,
        electricityTariff: electricityTariff || 6.5
      });

      if (response.success) {
        setAnalytics(response.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics');
      setLoading(false);
    }
  };

  const fetchCumulativeAnalytics = async () => {
    try {
      const response = await getCumulativeAnalytics(selectedPanel || null);
      if (response.success) {
        setCumulative(response.data);
      }
    } catch (err) {
      console.error('Error fetching cumulative analytics:', err);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics();
    fetchCumulativeAnalytics();
  };

  if (hasError) {
    return (
      <div className="analytics-page">
        <div className="error-banner">
          <span>⚠️</span>
          <span>Something went wrong loading the analytics page. Please check the console for details.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <header className="page-header">
        <h1>Analytics</h1>
        {error && <div className="error-message">{error}</div>}
      </header>

      <div className="controls-bar">
        <select
          value={selectedPanel}
          onChange={(e) => setSelectedPanel(e.target.value)}
          disabled={panels.length === 0}
          className="control-input"
        >
          {panels.length === 0 && <option>No panels</option>}
          {panels.map(panel => (
            <option key={panel._id} value={panel._id}>
              {panel.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          max={dateRange.endDate}
          className="control-input"
        />

        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          min={dateRange.startDate}
          max={new Date().toISOString().split('T')[0]}
          className="control-input"
        />

        <input
          type="number"
          value={systemCost}
          onChange={(e) => setSystemCost(e.target.value)}
          placeholder="System Cost (₹)"
          min="0"
          className="control-input"
        />

        <input
          type="number"
          value={electricityTariff}
          onChange={(e) => setElectricityTariff(e.target.value)}
          placeholder="Tariff"
          step="0.1"
          min="0"
          className="control-input"
        />

        <button onClick={handleRefresh} disabled={loading} className="refresh-btn">
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {cumulative && (
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-value">{cumulative.totalEnergyProduced?.toFixed(0) || '0'}</div>
            <div className="stat-label">kWh Generated</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">₹{cumulative.totalSavings?.toLocaleString() || '0'}</div>
            <div className="stat-label">Total Savings</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{cumulative.totalCO2Avoided?.toFixed(0) || '0'}</div>
            <div className="stat-label">kg CO₂ Saved</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{cumulative.averageROI?.toFixed(1) || '0'}%</div>
            <div className="stat-label">Average ROI</div>
          </div>
        </div>
      )}

      <div className="cards-grid">
        <CostSavingsCard data={analytics} loading={loading} />
        <CarbonFootprintCard data={analytics} loading={loading} />
      </div>
    </div>
  );
};

export default AnalyticsPage;
