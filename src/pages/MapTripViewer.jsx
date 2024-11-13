import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import osmtogeojson from 'osmtogeojson';

const MapRoadFinder = () => {
  const [geojsonData, setGeojsonData] = React.useState(null);

  const getGeojsonData = (e) => {
    const url = `deckgl_trip_data.geojson`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        setGeojsonData(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  useEffect(() => {
    getGeojsonData()
  }, [])

  console.log(geojsonData);

  return (
    <MapContainer center={[28.613906, 77.209001]} zoom={11} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {geojsonData && <GeoJSON key={JSON.stringify(geojsonData)} data={geojsonData} style={{ color: 'blue', weight: 5 }} />}
    </MapContainer>
  );
};

export default MapRoadFinder;

