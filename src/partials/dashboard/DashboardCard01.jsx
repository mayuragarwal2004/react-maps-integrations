import React from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Circle, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import EditMenu from '../../components/DropdownEditMenu';

// Import utilities
import { tailwindConfig, hexToRGB } from '../../utils/Utils';

function DashboardCard01() {

  // Example data for stores
  const storeData = [
    { lat: 28.6139, lng: 77.2090, sales: 22000, performance: "Good", region: "North" }, // New Delhi
    { lat: 19.0760, lng: 72.8777, sales: 25000, performance: "Excellent", region: "West" }, // Mumbai
    { lat: 12.9716, lng: 77.5946, sales: 19000, performance: "Good", region: "South" }, // Bangalore
    { lat: 13.0827, lng: 80.2707, sales: 17000, performance: "Average", region: "South" }, // Chennai
    { lat: 22.5726, lng: 88.3639, sales: 16000, performance: "Average", region: "East" }, // Kolkata
    { lat: 17.3850, lng: 78.4867, sales: 18000, performance: "Good", region: "South" }, // Hyderabad
    { lat: 23.0225, lng: 72.5714, sales: 20000, performance: "Excellent", region: "West" }, // Ahmedabad
    { lat: 26.9124, lng: 75.7873, sales: 15000, performance: "Average", region: "North" }  // Jaipur
];

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-6  bg-white dark:bg-gray-800 shadow-sm rounded-xl w-full">
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Sales Density Map</h2>
          <EditMenu align="right" className="relative inline-flex">
            <li>
              <Link className="font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 flex py-1 px-3" to="#0">
                Option 1
              </Link>
            </li>
            <li>
              <Link className="font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 flex py-1 px-3" to="#0">
                Option 2
              </Link>
            </li>
            <li>
              <Link className="font-medium text-sm text-red-500 hover:text-red-600 flex py-1 px-3" to="#0">
                Remove
              </Link>
            </li>
          </EditMenu>
        </header>
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Sales Overview</div>
        <div className="flex items-start mb-4">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">$87,000</div>
          <div className="text-sm font-medium text-green-700 px-1.5 bg-green-500/20 rounded-full">+15%</div>
        </div>
      </div>
      <div className="grow max-sm:max-h-[128px] xl:max-h-[128px]">
        <MapContainer center={[20.5937, 78.9629]} zoom={4} scrollWheelZoom={false} style={{ height: '300px', borderRadius: '0 0 10px 10px' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          {storeData.map((store, idx) => (
            <Circle
              key={idx}
              center={[store.lat, store.lng]}
              radius={store.sales *5} // Adjust radius for visual effect
              fillColor={store.performance === "Excellent" ? "green" : store.performance === "Good" ? "blue" : "red"}
              color={store.performance === "Excellent" ? "green" : store.performance === "Good" ? "blue" : "red"}
              fillOpacity={0.5}
              stroke={false}
            >
              <Tooltip>
                <div>
                  <strong>Region:</strong> {store.region} <br />
                  <strong>Sales:</strong> ${store.sales} <br />
                  <strong>Performance:</strong> {store.performance}
                </div>
              </Tooltip>
            </Circle>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default DashboardCard01;
