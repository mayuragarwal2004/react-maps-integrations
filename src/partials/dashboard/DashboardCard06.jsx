import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

function GoodsTable() {
  // Sample data for the table
  const goodsData = [
    {
      id: 1,
      name: 'Redmi Buds 4 Active - Bass Black, 12mm Drivers(Premium Sound Quality)',
      restockTime: '2 days',
      restockDate: '2024-08-20',
      requestSent: true,
    },
    {
      id: 2,
      name: 'Pears Pure & Gentle Shower Gel SuperSaver XL Pump Bottle',
      restockTime: '3 days',
      restockDate: '2024-08-21',
      requestSent: false,
    },
    {
      id: 3,
      name: 'Voltas 1.4 Ton 3 Star Inverter Split AC (Copper, Adjustable Cooling, Anti-dust Filter, 2023 Model, 173V Vectra Platina, White)',
      restockTime: '1 day',
      restockDate: '2024-08-22',
      requestSent: true,
    },
    // Add more products as needed
  ];

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr>
            <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-left text-sm font-medium text-gray-800 dark:text-gray-100 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-left text-sm font-medium text-gray-800 dark:text-gray-100 uppercase tracking-wider">
              Product Name
            </th>
            <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-left text-sm font-medium text-gray-800 dark:text-gray-100 uppercase tracking-wider">
              Restock Time
            </th>
            <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-left text-sm font-medium text-gray-800 dark:text-gray-100 uppercase tracking-wider">
              Restock Date
            </th>
            <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-center text-sm font-medium text-gray-800 dark:text-gray-100 uppercase tracking-wider">
              Request Sent
            </th>
          </tr>
        </thead>
        <tbody>
          {goodsData.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100">
                {item.id}
              </td>
              <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100">
                {item.name}
              </td>
              <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100">
                {item.restockTime}
              </td>
              <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100">
                {item.restockDate}
              </td>
              <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-center text-sm text-gray-800 dark:text-gray-100">
                {item.requestSent ? (
                  <FaCheck className="text-green-500" />
                ) : (
                  <FaTimes className="text-red-500" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GoodsTable;
