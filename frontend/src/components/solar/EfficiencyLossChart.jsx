import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CHART_COLORS } from '../../utils/constants';

ChartJS.register(ArcElement, Tooltip, Legend);

const EfficiencyLossChart = ({ lossBreakdown }) => {
  if (!lossBreakdown) return null;

  const data = {
    labels: ['Dust Loss', 'Shading Loss', 'Age Degradation', 'Temperature Loss'],
    datasets: [
      {
        label: 'Efficiency Loss (%)',
        data: [
          lossBreakdown.dust || 0,
          lossBreakdown.shading || 0,
          lossBreakdown.age || 0,
          lossBreakdown.temperature || 0,
        ],
        backgroundColor: [
          CHART_COLORS.dust,
          CHART_COLORS.shading,
          CHART_COLORS.age,
          CHART_COLORS.temperature,
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed}%`;
          },
        },
      },
    },
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: '25px', 
      borderRadius: '12px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
      height: '350px'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50', textAlign: 'center' }}>
        📊 Efficiency Loss Breakdown
      </h3>
      <div style={{ height: '260px', position: 'relative' }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default EfficiencyLossChart;
