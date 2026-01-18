import React, { useEffect, useState } from 'react';
import { getSensorData } from '../../api/sensor.api';
import { generateSensorDataNow } from '../../api/sensorGenerate.api';
import { getPanels } from '../../api/panel.api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const SensorTrends = () => {
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

  const handleGenerateNow = async () => {
    setLoading(true);
    setError(null);
    try {
      await generateSensorDataNow();
      fetchData(selectedPanel);
    } catch (err) {
      setError('Failed to generate sensor data');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading sensor trends...</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;
  if (!sensorData.length) return <div>No sensor data available.</div>;

  // Sort sensor data by timestamp descending for table, ascending for chart
  const sortedData = [...sensorData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const chartData = [...sensorData]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-30)
    .map(d => ({ ...d, timestamp: new Date(d.timestamp).toLocaleTimeString() }));

  const metrics = [
    { key: 'temperature', label: 'Temperature (°C)', color: '#e57373' },
    { key: 'irradiance', label: 'Irradiance', color: '#fbc02d' },
    { key: 'dust', label: 'Dust', color: '#8d6e63' },
    { key: 'tilt', label: 'Tilt (°)', color: '#64b5f6' },
    { key: 'shading', label: 'Shading (%)', color: '#81c784' },
    { key: 'voltage', label: 'Voltage', color: '#ba68c8' },
    { key: 'current', label: 'Current', color: '#ff8a65' },
  ];

  return (
    <div style={{marginTop: 40}}>
      <div style={{marginBottom: 16}}>
        <label htmlFor="panelSelect" style={{marginRight: 8, fontWeight: 'bold'}}>Select Panel:</label>
        <select id="panelSelect" value={selectedPanel} onChange={e => setSelectedPanel(e.target.value)}>
          {panels.map(panel => (
            <option key={panel._id} value={panel._id}>{panel.name} ({panel.location})</option>
          ))}
        </select>
      </div>
      <button onClick={handleGenerateNow} style={{marginBottom:16,padding:'8px 16px',background:'#f39c12',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontWeight:'bold'}}>Get Latest Sensor Data</button>
      {/* Chart */}
      <div style={{marginBottom: 32}}>
        <h2>Sensor Data Trends (Charts)</h2>
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
      {/* Table */}
      <div style={{overflowX:'auto'}}>
        <table style={{minWidth:600, borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Temperature (°C)</th>
              <th>Irradiance</th>
              <th>Dust</th>
              <th>Tilt (°)</th>
              <th>Shading (%)</th>
              <th>Voltage</th>
              <th>Current</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.slice(0, 10).map((d, i) => (
              <tr key={d._id || i}>
                <td>{new Date(d.timestamp).toLocaleString()}</td>
                <td>{d.temperature ?? '-'}</td>
                <td>{d.irradiance ?? '-'}</td>
                <td>{d.dust ?? '-'}</td>
                <td>{d.tilt ?? '-'}</td>
                <td>{d.shading ?? '-'}</td>
                <td>{d.voltage ?? '-'}</td>
                <td>{d.current ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SensorTrends;
