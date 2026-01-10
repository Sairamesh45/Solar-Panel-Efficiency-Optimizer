import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PowerVsTimeChart = ({ timeSeriesData }) => {
  if (!timeSeriesData || timeSeriesData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#95a5a6' }}>
        <p>No power data available</p>
      </div>
    );
  }

  const data = {
    labels: timeSeriesData.map(d => {
      const date = new Date(d.timestamp);
      return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
    }),
    datasets: [
      {
        label: 'Power Output (W)',
        data: timeSeriesData.map(d => d.power),
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6
      },
      {
        label: 'Max Power (W)',
        data: timeSeriesData.map(d => d.maxPower),
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.05)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointRadius: 0
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
        text: 'Power Output Over Time',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          font: { size: 10 }
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Power (Watts)',
          font: { size: 12, weight: 'bold' }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div style={{ height: '400px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default PowerVsTimeChart;
