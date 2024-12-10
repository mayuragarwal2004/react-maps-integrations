import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  GeoJSON,
  FeatureGroup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import osmtogeojson from "osmtogeojson";
import * as turf from "@turf/turf";

const MapRoadFinder = () => {
  const [geojsonData, setGeojsonData] = useState([]);
  const [polygon, setPolygon] = useState(null);
  const [enableRoadFinding, setEnableRoadFinding] = useState(false);
  const [fetchWithoutPolygon, setFetchWithoutPolygon] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [outputData, setOutputData] = useState("");
  const [points, setPoints] = useState([]);
  const [showPoints, setShowPoints] = useState(true);
  const [pointDist, setPointDist] = useState(20);
  const [pointDistInput, setPointDistInput] = useState(20);

  console.log(geojsonData);
  console.log({ points });

  useEffect(() => {
    if (geojsonData) {
      var points = generateOutputData(geojsonData);
      setPoints(points);
      setOutputData(formatData(points));
    }
  }, [geojsonData, selectedFormat, pointDist]);

  const handleMapClick = (e) => {
    if (!enableRoadFinding) return;

    console.log("Processing started");

    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Query to find the road at the clicked location
    const initialQuery = `
    [out:json];
    (
      way(around:3, ${lat}, ${lng});
      node(around:3, ${lat}, ${lng});
      relation(around:3, ${lat}, ${lng});
    );
    out body;
  `;
    const initialUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
      initialQuery
    )}`;

    fetch(initialUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.elements.length > 0) {
          const road = data.elements[0];
          const highwayTag = road.tags.highway;

          console.log("hi");
          console.log({ road: data.elements });
          console.log("hi");

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
          const fullRoadUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
            fullRoadQuery
          )}`;

          fetch(fullRoadUrl)
            .then((response) => response.json())
            .then((fullRoadData) => {
              const geojson = osmtogeojson(fullRoadData);
              if (polygon && !fetchWithoutPolygon) {
                const filteredGeojson = filterGeojsonWithinPolygon(
                  geojson,
                  polygon
                );
                if (index) {
                  console.log("Road segment already present");
                  setGeojsonData((prev) => prev.filter((_, i) => i !== index));
                } else {
                  console.log("Adding new road segment");
                  setGeojsonData((prev) => [...prev, filteredGeojson]);
                }
              } else {
                var index = undefined;
                for (var i = 0; i < geojsonData.length; i++) {
                  if (
                    JSON.stringify(geojsonData[i]).localeCompare(
                      JSON.stringify(geojson)
                    ) === 0
                  ) {
                    index = i;
                    break;
                  }
                }
                if (index) {
                  console.log("Road segment already present");
                  setGeojsonData((prev) => prev.filter((_, i) => i !== index));
                } else {
                  console.log("Adding new road segment");
                  setGeojsonData((prev) => [...prev, geojson]);
                }
              }
              console.log("Processing done");
            })
            .catch((error) => {
              console.error("Error fetching full road data:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Error fetching road segment:", error);
      });
  };

  const filterGeojsonWithinPolygon = (geojson, polygon) => {
    const polygonFeature = polygon.toGeoJSON();
    const filteredFeatures = geojson.features.filter((feature) => {
      return turf.booleanWithin(feature, polygonFeature);
    });
    return {
      type: "FeatureCollection",
      features: filteredFeatures,
    };
  };

  function interpolatePoints(lat1, lng1, lat2, lng2, distance) {
    const R = 6371000; // Radius of the Earth in meters
    const toRadians = (deg) => (deg * Math.PI) / 180;
    const toDegrees = (rad) => (rad * 180) / Math.PI;

    // Convert inputs to radians
    const φ1 = toRadians(lat1);
    const λ1 = toRadians(lng1);
    const φ2 = toRadians(lat2);
    const λ2 = toRadians(lng2);

    // Compute the total distance between the two points
    const Δφ = φ2 - φ1;
    const Δλ = λ2 - λ1;

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const totalDistance = R * c;

    if (totalDistance < distance) {
      return [
        { latitude: lat1, longitude: lng1 },
        { latitude: lat2, longitude: lng2 },
      ];
    }

    const numPoints = Math.ceil(totalDistance / distance);
    const points = [];

    for (let i = 0; i <= numPoints; i++) {
      const fraction = i / numPoints;
      const A = Math.sin((1 - fraction) * c) / Math.sin(c);
      const B = Math.sin(fraction * c) / Math.sin(c);

      const x =
        A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
      const y =
        A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
      const z = A * Math.sin(φ1) + B * Math.sin(φ2);

      const interpolatedLat = Math.atan2(z, Math.sqrt(x ** 2 + y ** 2));
      const interpolatedLng = Math.atan2(y, x);

      points.push({
        latitude: toDegrees(interpolatedLat).toFixed(7),
        longitude: toDegrees(interpolatedLng).toFixed(7),
      });
    }

    return points;
  }

  const generateOutputData = (geojson) => {
    const allCoordinates = [];
    for (var i = 0; i < geojson.length; i++) {
      const coordinates = geojson[i].features[0].geometry.coordinates.map(
        ([longitude, latitude]) => {
          return {
            latitude,
            longitude,
            roadName:
              geojson[i].features[0].properties.roadName || "Unnamed Road",
            roadId: geojson[i].features[0].id || "Unknown ID", // Include the road ID
          };
        }
      );
      const populatedCoordinates = [];
      for (var j = 0; j < coordinates.length - 1; j++) {
        populatedCoordinates.push(
          ...interpolatePoints(
            coordinates[j].latitude,
            coordinates[j].longitude,
            coordinates[j + 1].latitude,
            coordinates[j + 1].longitude,
            pointDist
          )
        );
      }
      console.log({ populatedCoordinates });
      allCoordinates.push(...populatedCoordinates);
    }
    console.log({ allCoordinates });

    return allCoordinates;
  };

  const formatData = (routeData) => {
    // return "";
    switch (selectedFormat) {
      case "csv":
        return (
          "latitude,longitude\n" +
          routeData
            .map((point) => `${point.latitude},${point.longitude}`)
            .join("\n")
        );

      case "jsonArrayLatLon":
        return JSON.stringify(
          routeData.map((point) => [point.latitude, point.longitude])
        );

      case "jsonArrayLonLat":
        return JSON.stringify(
          routeData.map((point) => [point.longitude, point.latitude])
        );

      case "jsonArrayObjects":
        return JSON.stringify(
          routeData.map((point) => ({
            latitude: point.latitude,
            longitude: point.longitude,
            roadName: point.roadName || "",
          }))
        );

      default:
        return "";
    }
  };

  const handlePolygonDraw = (e) => {
    setPolygon(e.layer);
  };

  const handlePolygonClear = () => {
    setGeojsonData([]);
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

  console.log({ geojsonData });

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
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={() => setShowPoints(!showPoints)}
        >
          {showPoints ? "Hide Points" : "Show Points"}
        </button>
        <input
          type="number"
          value={pointDistInput}
          onChange={(e) => setPointDistInput(e.target.value)}
          className="mb-2 p-2 rounded-lg border"
        />
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={() => setPointDist(pointDistInput)}
        >
          Apply
        </button>
      </div>
      <MapContainer
        center={[12.58589226, 77.04090194]}
        zoom={13}
        style={{ height: "50vh", width: "100%" }}
      >
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
        {geojsonData &&
          geojsonData.map((geojsonData_i) => {
            return (
              <GeoJSON
                key={JSON.stringify(geojsonData_i)}
                data={geojsonData_i}
                style={{ color: "blue", weight: 5 }}
              />
            );
          })}
        {showPoints && points.length > 0 && (
          <GeoJSON
            data={{
              type: "FeatureCollection",
              features: points.map((point) => ({
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [point.longitude, point.latitude],
                },
              })),
            }}
            style={() => ({
              color: "red",
            })}
          />
        )}
      </MapContainer>
      <div>
        <select
          value={selectedFormat}
          onChange={handleFormatChange}
          className="mb-2 p-2 rounded-lg border"
        >
          <option value="csv">CSV</option>
          <option value="jsonArrayLatLon">
            JSON Array [latitude, longitude]
          </option>
          <option value="jsonArrayLonLat">
            JSON Array [longitude, latitude]
          </option>
          <option value="jsonArrayObjects">Array of Objects</option>
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
