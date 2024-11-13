import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the necessary components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

function DashboardCard02() {
  const chartData = {
    labels: ['Delhi', 'Mumbai', 'Pune'],
    datasets: [
      {
        label: 'Top Countries',
        data: [15, 30, 55],
        backgroundColor: [
          '#4F46E5', // Tailwind violet[500]
          '#0EA5E9', // Tailwind sky[500]
          '#3B82F6', // Tailwind violet[800]
        ],
        hoverBackgroundColor: [
          '#4338CA', // Tailwind violet[600]
          '#0284C7', // Tailwind sky[600]
          '#1D4ED8', // Tailwind violet[900]
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Top Countries</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <Doughnut data={chartData} width={389} height={260} />
    </div>
  );
}

export default DashboardCard02;
