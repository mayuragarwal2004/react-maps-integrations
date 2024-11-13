import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the necessary components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

function DashboardCard03() {
  const chartData = {
    labels: [
      'Maharashtra',
      'Karnataka',
      'Uttar Pradesh',
      'Delhi',
      'Tamil Nadu',
      'Gujarat',
      'West Bengal',
      'Other'
    ],
    datasets: [
      {
        label: 'Market Segmentation',
        data: [20, 15, 25, 10, 10, 8, 7, 5],
        backgroundColor: [
          '#4F46E5', // Example color for Maharashtra
          '#0EA5E9', // Example color for Karnataka
          '#3B82F6', // Example color for Uttar Pradesh
          '#F59E0B', // Example color for Delhi
          '#EC4899', // Example color for Tamil Nadu
          '#10B981', // Example color for Gujarat
          '#6D28D9', // Example color for West Bengal
          '#9CA3AF', // Example color for Other
        ],
        hoverBackgroundColor: [
          '#4338CA', // Hover color for Maharashtra
          '#0284C7', // Hover color for Karnataka
          '#1D4ED8', // Hover color for Uttar Pradesh
          '#FBBF24', // Hover color for Delhi
          '#F87171', // Hover color for Tamil Nadu
          '#059669', // Hover color for Gujarat
          '#4C1D95', // Hover color for West Bengal
          '#6B7280', // Hover color for Other
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Market Segmentation</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <Pie data={chartData} width={389} height={260} />
    </div>
  );
}

export default DashboardCard03;