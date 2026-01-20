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

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      fontSize: '1.1rem',
      color: '#7f8c8d'
    }}>
      Loading sensor trends...
    </div>
  );
  
  if (error) return (
    <div style={{
      padding: '20px',
      background: '#fef5f5',
      color: '#e74c3c',
      borderRadius: '12px',
      border: '1px solid #f5c6cb',
      margin: '20px',
      textAlign: 'center'
    }}>
      <strong>Error:</strong> {error}
    </div>
  );
  
  if (!sensorData.length) return (
    <div style={{
      padding: '60px 20px',
      background: '#f8f9fa',
      borderRadius: '16px',
      border: '1px solid #e9ecef',
      margin: '20px',
      textAlign: 'center',
      color: '#7f8c8d'
    }}>
      No sensor data available.
    </div>
  );

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
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 20px' }}>
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '35px',
        borderRadius: '16px',
        color: 'white',
        marginBottom: '30px',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)'
      }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: '600' }}>
          Sensor Data Trends
        </h1>
        <p style={{ opacity: 0.95, fontSize: '1rem', margin: 0 }}>
          Real-time monitoring of solar panel sensors
        </p>
      </div>

      {/* Controls */}
      <div style={{
        background: 'white',
        padding: '20px 24px',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid #e9ecef',
        marginBottom: '30px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center'
      }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label htmlFor="panelSelect" style={{ 
            display: 'block',
            marginBottom: '8px', 
            fontWeight: '600',
            color: '#2c3e50',
            fontSize: '0.9rem'
          }}>
            Select Panel
          </label>
          <select 
            id="panelSelect" 
            value={selectedPanel} 
            onChange={e => setSelectedPanel(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '0.95rem',
              cursor: 'pointer',
              background: '#f8f9fa'
            }}
          >
            {panels.map(panel => (
              <option key={panel._id} value={panel._id}>{panel.name} ({panel.location})</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleGenerateNow}
          style={{
            padding: '11px 24px',
            background: '#f39c12',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
            alignSelf: 'flex-end'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#e67e22';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(243, 156, 18, 0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#f39c12';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Get Latest Sensor Data
        </button>
      </div>

      {/* Chart Section */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid #e9ecef',
        marginBottom: '30px'
      }}>
        <h2 style={{ 
          color: '#2c3e50', 
          marginTop: 0, 
          marginBottom: '24px',
          fontSize: '1.4rem',
          fontWeight: '600'
        }}>
          Sensor Data Trends (Charts)
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis 
              dataKey="timestamp" 
              minTickGap={20}
              style={{ fontSize: '0.85rem' }}
            />
            <YAxis style={{ fontSize: '0.85rem' }} />
            <Tooltip 
              contentStyle={{
                background: 'white',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '0.9rem' }} />
            {metrics.map(m => (
              <Line key={m.key} type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table Section */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid #e9ecef'
      }}>
        <h2 style={{ 
          color: '#2c3e50', 
          marginTop: 0, 
          marginBottom: '24px',
          fontSize: '1.4rem',
          fontWeight: '600'
        }}>
          Recent Sensor Readings
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '0.9rem'
          }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#2c3e50',
                  borderBottom: '2px solid #e9ecef',
                  whiteSpace: 'nowrap'
                }}>
                  Timestamp
                </th>
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#2c3e50',
                  borderBottom: '2px solid #e9ecef'
                }}>
                  Temperature (°C)
                </th>
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#2c3e50',
                  borderBottom: '2px solid #e9ecef'
                }}>
                  Irradiance
                </th>
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#2c3e50',
                  borderBottom: '2px solid #e9ecef'
                }}>
                  Dust
                </th>
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#2c3e50',
                  borderBottom: '2px solid #e9ecef'
                }}>
                  Tilt (°)
                </th>
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#2c3e50',
                  borderBottom: '2px solid #e9ecef'
                }}>
                  Shading (%)
                </th>
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#2c3e50',
                  borderBottom: '2px solid #e9ecef'
                }}>
                  Voltage
                </th>
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#2c3e50',
                  borderBottom: '2px solid #e9ecef'
                }}>
                  Current
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.slice(0, 10).map((d, i) => (
                <tr 
                  key={d._id || i}
                  style={{
                    transition: 'background 0.2s ease',
                    cursor: 'default'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e9ecef',
                    color: '#2c3e50',
                    whiteSpace: 'nowrap'
                  }}>
                    {new Date(d.timestamp).toLocaleString()}
                  </td>
                  <td style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e9ecef',
                    color: '#7f8c8d'
                  }}>
                    {d.temperature ?? '-'}
                  </td>
                  <td style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e9ecef',
                    color: '#7f8c8d'
                  }}>
                    {d.irradiance ?? '-'}
                  </td>
                  <td style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e9ecef',
                    color: '#7f8c8d'
                  }}>
                    {d.dust ?? '-'}
                  </td>
                  <td style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e9ecef',
                    color: '#7f8c8d'
                  }}>
                    {d.tilt ?? '-'}
                  </td>
                  <td style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e9ecef',
                    color: '#7f8c8d'
                  }}>
                    {d.shading ?? '-'}
                  </td>
                  <td style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e9ecef',
                    color: '#7f8c8d'
                  }}>
                    {d.voltage ?? '-'}
                  </td>
                  <td style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e9ecef',
                    color: '#7f8c8d'
                  }}>
                    {d.current ?? '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedData.length > 10 && (
          <div style={{
            marginTop: '16px',
            textAlign: 'center',
            color: '#7f8c8d',
            fontSize: '0.9rem'
          }}>
            Showing 10 of {sortedData.length} records
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorTrends;
