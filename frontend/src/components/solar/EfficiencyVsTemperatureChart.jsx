import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const EfficiencyVsTemperatureChart = ({ timeSeriesData }) => {
  if (!timeSeriesData || timeSeriesData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#95a5a6' }}>
        <p>No temperature-efficiency data available</p>
      </div>
    );
  }

  const scatterData = timeSeriesData.map(d => ({
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
    <div style={{ height: '400px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <Scatter data={data} options={options} />
    </div>
  );
};

export default EfficiencyVsTemperatureChart;
