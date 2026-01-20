import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PowerVsTimeChart = ({ timeSeriesData }) => {
  console.log('PowerVsTimeChart received data:', timeSeriesData);
  
  if (!timeSeriesData || timeSeriesData.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 40px',
        background: '#f8f9fa',
        borderRadius: '16px',
        border: '1px solid #e9ecef'
      }}>
        <p style={{ color: '#7f8c8d', margin: 0 }}>No power data available for the selected period</p>
      </div>
    );
  }

  // Filter out data points with null/undefined power values
  const validData = timeSeriesData.filter(d => 
    d && typeof d.power === 'number' && !isNaN(d.power)
  );

  console.log('Valid data points:', validData.length, 'out of', timeSeriesData.length);

  // Detect unit: backend may return power in kW (small numbers) or W (larger numbers)
  const sampleMax = Math.max(...validData.map(d => Math.max(d.power || 0, d.maxPower || 0)));
  const isInKw = sampleMax > 0 && sampleMax < 50; // likely kW if max < 50
  const unit = isInKw ? 'kW' : 'W';
  const scale = isInKw ? 1000 : 1; // convert kW->W for display as Watts

  if (validData.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 40px',
        background: '#f8f9fa',
        borderRadius: '16px',
        border: '1px solid #e9ecef'
      }}>
        <p style={{ color: '#7f8c8d', margin: 0 }}>No valid power readings found</p>
      </div>
    );
  }

  const data = {
    labels: validData.map(d => {
      const date = new Date(d.timestamp);
      return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
    }),
    datasets: [
      {
        label: `Power Output (${unit})`,
        data: validData.map(d => (d.power || 0) * (isInKw ? scale : 1)),
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6
      },
      {
        label: `Max Power (${unit})`,
        data: validData.map(d => (d.maxPower || 0) * (isInKw ? scale : 1)),
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
    <div style={{ 
      height: '400px', 
      padding: '30px', 
      backgroundColor: 'white', 
      borderRadius: '16px', 
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid #e9ecef'
    }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default PowerVsTimeChart;
