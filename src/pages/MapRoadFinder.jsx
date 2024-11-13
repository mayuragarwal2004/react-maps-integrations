import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, GeoJSON, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import osmtogeojson from 'osmtogeojson';
import * as turf from '@turf/turf';

const MapRoadFinder = () => {
  const [geojsonData, setGeojsonData] = useState(null);
  const [polygon, setPolygon] = useState(null);
  const [enableRoadFinding, setEnableRoadFinding] = useState(false);
  const [fetchWithoutPolygon, setFetchWithoutPolygon] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [outputData, setOutputData] = useState('');

  console.log(geojsonData);
  

  useEffect(() => {
    if (geojsonData) {
      setOutputData(formatOutputData(geojsonData));
    }
  }, [geojsonData, selectedFormat]);
  const handleMapClick = (e) => {
    if (!enableRoadFinding) return;
  
    console.log('Processing started');
  
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
  
    // Query to find the road at the clicked location
    const initialQuery = `
      [out:json];
      way(around:3, ${lat}, ${lng})["highway"];
      out body;
    `;
    const initialUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(initialQuery)}`;
  
    fetch(initialUrl)
      .then(response => response.json())
      .then(data => {
        if (data.elements.length > 0) {
          const road = data.elements[0];
          const highwayTag = road.tags.highway;
  
          // Query to find all connected road segments with the same highway tag
          const fullRoadQuery = `
            [out:json];
            (
              way(around:3, ${lat}, ${lng})["highway"="${highwayTag}"];
              >;
            );
            out body;
            >;
            out skel qt;
          `;
          const fullRoadUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(fullRoadQuery)}`;
  
          fetch(fullRoadUrl)
            .then(response => response.json())
            .then(fullRoadData => {
              const geojson = osmtogeojson(fullRoadData);
              if (polygon && !fetchWithoutPolygon) {
                const filteredGeojson = filterGeojsonWithinPolygon(geojson, polygon);
                setGeojsonData(filteredGeojson);
              } else {
                setGeojsonData(geojson);
              }
              console.log('Processing done');
            })
            .catch(error => {
              console.error('Error fetching full road data:', error);
            });
        }
      })
      .catch(error => {
        console.error('Error fetching road segment:', error);
      });
  };
  

  const filterGeojsonWithinPolygon = (geojson, polygon) => {
    const polygonFeature = polygon.toGeoJSON();
    const filteredFeatures = geojson.features.filter(feature => {
      return turf.booleanWithin(feature, polygonFeature);
    });
    return {
      type: 'FeatureCollection',
      features: filteredFeatures,
    };
  };
  
  const formatOutputData = (geojson) => {
    const coordinates = geojson.features.flatMap(feature => {
      if (feature.geometry.type === 'LineString' || feature.geometry.type === 'Polygon') {
        return feature.geometry.coordinates.map(([lon, lat]) => ({
          lat,
          lon,
          name: feature.properties.name || 'Unnamed Road',
          roadId: feature.id || 'Unknown ID' // Include the road ID
        }));
      } else if (feature.geometry.type === 'MultiLineString' || feature.geometry.type === 'MultiPolygon') {
        return feature.geometry.coordinates.flatMap(coords =>
          coords.map(([lon, lat]) => ({
            lat,
            lon,
            name: feature.properties.name || 'Unnamed Road',
            roadId: feature.id || 'Unknown ID' // Include the road ID
          }))
        );
      } else {
        return [];
      }
    });
  
    if (selectedFormat === 'csv') {
      return coordinates.map(({ lat, lon, name, roadId }) => `${lat},${lon},${name},${roadId}`).join('\n');
    }
  
    if (selectedFormat === 'json_lat_lon') {
      return JSON.stringify(coordinates.map(({ lat, lon, roadId }) => [lat, lon, roadId]));
    }
  
    if (selectedFormat === 'json_lon_lat') {
      return JSON.stringify(coordinates.map(({ lon, lat, roadId }) => [lon, lat, roadId]));
    }
  
    if (selectedFormat === 'json_objects') {
      return JSON.stringify(coordinates.map(({ lat, lon, name, roadId }) => ({
        latitude: lat,
        longitude: lon,
        roadname: name,
        roadId: roadId
      })));
    }
  
    return '';
  };
  
  
  

  const handlePolygonDraw = (e) => {
    setPolygon(e.layer);
  };

  const handlePolygonClear = () => {
    setGeojsonData(null);
    setPolygon(null);
  };

  const toggleRoadFinding = () => {
    setEnableRoadFinding(!enableRoadFinding);
  };

  const toggleFetchWithoutPolygon = () => {
    setFetchWithoutPolygon(!fetchWithoutPolygon);
  };

  const handleFormatChange = (e) => {
    setSelectedFormat(e.target.value);
  };

  const ClickHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  return (
    <>
      <div>
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={handlePolygonClear}
        >
          Clear Polygon
        </button>
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={toggleRoadFinding}
        >
          {enableRoadFinding ? "Disable Road Finding" : "Enable Road Finding"}
        </button>
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={toggleFetchWithoutPolygon}
        >
          {fetchWithoutPolygon ? "Fetch With Polygon" : "Fetch Without Polygon"}
        </button>
      </div>
      <MapContainer center={[18.482337, 73.873065]} zoom={13} style={{ height: '50vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handlePolygonDraw}
            onDeleted={handlePolygonClear}
            draw={{
              rectangle: false,
              circle: false,
              marker: false,
              circlemarker: false,
              polyline: false,
            }}
          />
        </FeatureGroup>
        <ClickHandler />
        {geojsonData && <GeoJSON key={JSON.stringify(geojsonData)} data={geojsonData} style={{ color: 'blue', weight: 5 }} />}
      </MapContainer>
      <div>
        <select value={selectedFormat} onChange={handleFormatChange} className="mb-2 p-2 rounded-lg border">
          <option value="csv">CSV</option>
          <option value="json_lat_lon">JSON Array [lat, lon]</option>
          <option value="json_lon_lat">JSON Array [lon, lat]</option>
          <option value="json_objects">Array of Objects</option>
        </select>
        <textarea
          readOnly
          value={outputData}
          rows="6"
          className="w-full p-2 rounded-lg border"
        />
      </div>
    </>
  );
};

export default MapRoadFinder;
