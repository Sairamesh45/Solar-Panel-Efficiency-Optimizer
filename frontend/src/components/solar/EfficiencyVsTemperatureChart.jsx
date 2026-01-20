import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const EfficiencyVsTemperatureChart = ({ timeSeriesData }) => {
  console.log('EfficiencyVsTemperatureChart received data:', timeSeriesData);
  
  if (!timeSeriesData || timeSeriesData.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 40px',
        background: '#f8f9fa',
        borderRadius: '16px',
        border: '1px solid #e9ecef'
      }}>
        <p style={{ color: '#7f8c8d', margin: 0 }}>No temperature-efficiency data available</p>
      </div>
    );
  }

  // Filter out data points with null/undefined values
  const validData = timeSeriesData.filter(d => 
    d && 
    typeof d.temperature === 'number' && !isNaN(d.temperature) &&
    typeof d.efficiency === 'number' && !isNaN(d.efficiency)
  );

  console.log('Valid data points:', validData.length, 'out of', timeSeriesData.length);

  if (validData.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 40px',
        background: '#f8f9fa',
        borderRadius: '16px',
        border: '1px solid #e9ecef'
      }}>
        <p style={{ color: '#7f8c8d', margin: 0 }}>No valid temperature-efficiency readings found</p>
      </div>
    );
  }

  const scatterData = validData.map(d => ({
    x: d.temperature,
    y: d.efficiency
  }));

  const data = {
    datasets: [
      {
        label: 'Efficiency vs Temperature',
        data: scatterData,
        backgroundColor: 'rgba(52, 152, 219, 0.6)',
        borderColor: '#3498db',
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#e74c3c'
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
        text: 'Panel Efficiency vs Temperature Correlation',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        callbacks: {
          label: function(context) {
            return [
              `Temperature: ${context.parsed.x.toFixed(1)}°C`,
              `Efficiency: ${context.parsed.y.toFixed(2)}%`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Temperature (°C)',
          font: { size: 12, weight: 'bold' }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Efficiency (%)',
          font: { size: 12, weight: 'bold' }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  return (
    <div style={{ 
      height: '400px', 
      padding: '30px', 
      backgroundColor: 'white', 
      borderRadius: '16px', 
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid #e9ecef'
    }}>
      <Scatter data={data} options={options} />
    </div>
  );
};

export default EfficiencyVsTemperatureChart;
