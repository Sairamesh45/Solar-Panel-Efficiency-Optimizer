import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MaintenanceImpactChart = ({ maintenanceImpact }) => {
  if (!maintenanceImpact || maintenanceImpact.status !== 'analyzed') {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#95a5a6' }}>
        <p>No maintenance impact data available</p>
        <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
          Schedule maintenance to see before/after comparison
        </p>
      </div>
    );
  }

  const { before, after, improvement } = maintenanceImpact;

  const data = {
    labels: ['Power (W)', 'Efficiency (%)', 'Dust Level'],
    datasets: [
      {
        label: 'Before Maintenance',
        data: [before.power, before.efficiency, before.dust],
        backgroundColor: 'rgba(231, 76, 60, 0.7)',
        borderColor: '#e74c3c',
        borderWidth: 2
      },
      {
        label: 'After Maintenance',
        data: [after.power, after.efficiency, after.dust],
        backgroundColor: 'rgba(46, 204, 113, 0.7)',
        borderColor: '#2ecc71',
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12 }
        }
      },
      title: {
        display: true,
        text: 'Maintenance Impact Analysis',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value',
          font: { size: 12, weight: 'bold' }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '20px' }}>
      <div style={{ height: '400px', marginBottom: '20px' }}>
        <Bar data={data} options={options} />
      </div>
      
      {/* Improvement Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
        <div style={{ padding: '15px', backgroundColor: improvement.power > 0 ? '#e8f5e9' : '#ffebee', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '5px' }}>Power Improvement</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: improvement.power > 0 ? '#27ae60' : '#e74c3c' }}>
            {improvement.power > 0 ? '+' : ''}{improvement.power}%
          </div>
        </div>
        
        <div style={{ padding: '15px', backgroundColor: improvement.efficiency > 0 ? '#e8f5e9' : '#ffebee', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '5px' }}>Efficiency Improvement</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: improvement.efficiency > 0 ? '#27ae60' : '#e74c3c' }}>
            {improvement.efficiency > 0 ? '+' : ''}{improvement.efficiency}%
          </div>
        </div>
        
        <div style={{ padding: '15px', backgroundColor: improvement.dust > 0 ? '#e8f5e9' : '#ffebee', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '5px' }}>Dust Reduction</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: improvement.dust > 0 ? '#27ae60' : '#e74c3c' }}>
            {improvement.dust > 0 ? '-' : '+'}{Math.abs(improvement.dust)}%
          </div>
        </div>
      </div>

      {/* Maintenance Date */}
      <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
        <strong>Maintenance Date:</strong> {new Date(maintenanceImpact.maintenanceDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </div>
  );
};

export default MaintenanceImpactChart;
