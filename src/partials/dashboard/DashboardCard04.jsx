import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend);

// Utility function to convert color to rgba format
const hexToRGB = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Tailwind color configuration
const tailwindConfig = {
  theme: {
    colors: {
      sky: {
        500: '#0EA5E9',
        600: '#0284C7',
      },
      violet: {
        500: '#8B5CF6',
        600: '#7C3AED',
      },
      gray: {
        100: '#F3F4F6',
        700: '#374151',
      },
    },
  },
};

function DashboardCard04() {

  const chartData = {
    labels: [
      '12-01-2022', '01-01-2023', '02-01-2023',
      '03-01-2023', '04-01-2023', '05-01-2023',
    ],
    datasets: [
      {
        label: 'Maharashtra',
        data: [800, 1600, 900, 1300, 1950, 1700],
        borderColor: tailwindConfig.theme.colors.sky[500],
        backgroundColor: hexToRGB(tailwindConfig.theme.colors.sky[500], 0.2),
        borderWidth: 2,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: tailwindConfig.theme.colors.sky[500],
        pointHoverRadius: 6,
      },
      {
        label: 'Karnataka',
        data: [4900, 2600, 5350, 4800, 5200, 4800],
        borderColor: tailwindConfig.theme.colors.violet[500],
        backgroundColor: hexToRGB(tailwindConfig.theme.colors.violet[500], 0.2),
        borderWidth: 2,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: tailwindConfig.theme.colors.violet[500],
        pointHoverRadius: 6,
      },
      {
        label: 'Delhi',
        data: [2800, 3000, 3500, 3100, 3900, 3300],
        borderColor: '#F59E0B', // Custom color for Delhi
        backgroundColor: hexToRGB('#F59E0B', 0.2),
        borderWidth: 2,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#F59E0B',
        pointHoverRadius: 6,
      },
      {
        label: 'Tamil Nadu',
        data: [2000, 2500, 2300, 2900, 3100, 2700],
        borderColor: '#EC4899', // Custom color for Tamil Nadu
        backgroundColor: hexToRGB('#EC4899', 0.2),
        borderWidth: 2,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#EC4899',
        pointHoverRadius: 6,
      }
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: tailwindConfig.theme.colors.gray[700], // Legend text color
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: tailwindConfig.theme.colors.gray[700], // X-axis title color
        },
        ticks: {
          color: tailwindConfig.theme.colors.gray[700], // X-axis ticks color
        },
      },
      y: {
        title: {
          display: true,
          text: 'Sales',
          color: tailwindConfig.theme.colors.gray[700], // Y-axis title color
        },
        ticks: {
          color: tailwindConfig.theme.colors.gray[700], // Y-axis ticks color
        },
      }
    },
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-apn-8 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">State Sales Trends</h2>
      </header>
    
      <div className="flex-1 p-5">
        {/* Line chart */}
        <div className="relative h-full">
          <Line data={chartData} options={options} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>

    </div>
  );
}

export default DashboardCard04;
