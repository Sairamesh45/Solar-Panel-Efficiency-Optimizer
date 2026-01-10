import React, { useEffect, useState } from 'react';
import { getSensorData } from '../../api/sensor.api';
import { getPanels } from '../../api/panel.api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const metrics = [
  { key: 'temperature', label: 'Temperature (°C)', color: '#e57373' },
  { key: 'irradiance', label: 'Irradiance', color: '#fbc02d' },
  { key: 'dust', label: 'Dust', color: '#8d6e63' },
  { key: 'tilt', label: 'Tilt (°)', color: '#64b5f6' },
  { key: 'shading', label: 'Shading (%)', color: '#81c784' },
  { key: 'voltage', label: 'Voltage', color: '#ba68c8' },
  { key: 'current', label: 'Current', color: '#ff8a65' },
];

const SensorCharts = () => {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [panels, setPanels] = useState([]);
  const [selectedPanel, setSelectedPanel] = useState('');

  // Fetch panels for dropdown
  useEffect(() => {
    getPanels().then(res => {
      setPanels(res.data.data || []);
      if (res.data.data && res.data.data.length > 0) {
        setSelectedPanel(res.data.data[0]._id);
      }
    });
  }, []);

  const fetchData = (panelId) => {
    setLoading(true);
    getSensorData({ panelId })
      .then(res => {
        setSensorData(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch sensor data');
        setLoading(false);
      });
  };

  // Fetch data initially and set up polling for live updates
  useEffect(() => {
    if (!selectedPanel) return;
    fetchData(selectedPanel);
    const interval = setInterval(() => {
      fetchData(selectedPanel);
    }, 15000); // 15 seconds
    return () => clearInterval(interval);
  }, [selectedPanel]);

  if (loading) return <div>Loading sensor charts...</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;
  if (!sensorData.length) return <div>No sensor data available.</div>;

  // Prepare data: show last 30 records, format timestamp
  const chartData = sensorData.slice(-30).map(d => ({
    ...d,
    timestamp: new Date(d.timestamp).toLocaleTimeString()
  }));

  return (
    <div style={{marginTop: 40}}>
      <h2>Sensor Data Trends (Charts)</h2>
      <div style={{marginBottom: 16}}>
        <label htmlFor="panelSelectChart" style={{marginRight: 8, fontWeight: 'bold'}}>Select Panel:</label>
        <select id="panelSelectChart" value={selectedPanel} onChange={e => setSelectedPanel(e.target.value)}>
          {panels.map(panel => (
            <option key={panel._id} value={panel._id}>{panel.name} ({panel.location})</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" minTickGap={20} />
          <YAxis />
          <Tooltip />
          <Legend />
          {metrics.map(m => (
            <Line key={m.key} type="monotone" dataKey={m.key} stroke={m.color} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensorCharts;
