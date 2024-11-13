import React, { useState, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { IconLayer } from "@deck.gl/layers";
import StaticMap from "react-map-gl";
import maplibregl from "maplibre-gl";
import Papa from "papaparse";

const MapBusesViewer = () => {
  const [viewState, setViewState] = useState({
    longitude: 77.209001,
    latitude:28.613906,
    zoom: 9,
  });

  const [markers, setMarkers] = useState([]);
  const max_markers = 50; // Set your desired maximum number of markers here

  function fetchCSVData() {
    return new Promise((resolve, reject) => {
      fetch("gtfs_realtime_data.csv") // Adjust the path to your CSV file
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.text();
        })
        .then((csvData) => {
          const parsedData = Papa.parse(csvData, { header: true });
          const locationArray = parsedData.data.map((row) => ({
            latitude: parseFloat(row.position_lat) || 0,
            longitude: parseFloat(row.position_lon) || 0,
          }));

          resolve(locationArray);
        })
        .catch((error) => reject(error));
    });
  }

  useEffect(() => {
    fetchCSVData().then((data) => {
      const selectedMarkers = [];
      const totalMarkers = data.length;

      // Shuffle the data array (Fisher-Yates shuffle algorithm)
      for (let i = totalMarkers - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [data[i], data[j]] = [data[j], data[i]];
      }

      for (let i = 0; i < totalMarkers; i++) {
        if (selectedMarkers.length >= max_markers) break;

        const shouldDisplayMarker = Math.random() < 0.5; // 50% chance to display the marker
        if (shouldDisplayMarker) {
          selectedMarkers.push({
            position: [data[i].longitude, data[i].latitude],
            size: 300,
          });
        }
      }

      setMarkers(selectedMarkers);
    });
  }, []);

  const iconLayer = new IconLayer({
    id: "icon-layer",
    data: markers,
    pickable: true,
    iconAtlas: "truck.png", // Path to your custom icon image
    iconMapping: {
      marker: { x: 0, y: 0, width: 50, height: 50 }, // Icon mapping
    },
    getIcon: (d) => "marker",
    sizeScale: 3,
    getPosition: (d) => d.position,
    getSize: (d) => d.size / 15, // Adjust size scale based on zoom level
  });

  return (
    <>
      <div
        style={{
          position: "relative",
          width: "80%",
          height: "60vh",
          overflow: "hidden",
          margin: "auto",
          borderRadius: "10px",
          border: "1px solid rgb(111 111 111)",
        }}
      >
        <DeckGL
          style={{ overflow: "hidden" }}
          viewState={viewState}
          onViewStateChange={({ viewState }) => setViewState(viewState)}
          controller={true}
          layers={[iconLayer]}
        >
          <StaticMap
            mapLib={maplibregl}
            mapStyle="https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json"
            transformRequest={(url) => {
              return {
                url: url.includes("?")
                  ? `${url}&api_key=MTaKhXqkZwxQn4MQfUeSynGw092Nfkf6RIJbx2YH`
                  : `${url}?api_key=MTaKhXqkZwxQn4MQfUeSynGw092Nfkf6RIJbx2YH`,
              };
            }}
          />
        </DeckGL>
      </div>
    </>
  );
};

export default MapBusesViewer;
