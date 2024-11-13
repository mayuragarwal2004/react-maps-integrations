import React, { useState, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer, IconLayer } from "@deck.gl/layers";
import StaticMap from "react-map-gl";
import maplibregl from "maplibre-gl";

function decodePolyline(str, resolution = 1) {
  let index = 0,
    lat = 0,
    lng = 0,
    coordinates = [];

  // Iterate over the polyline string to decode each coordinate
  while (index < str.length) {
    let shift = 0,
      result = 0;
    let b;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    // Store the coordinate (divide by 1e5 to get the actual coordinate)
    if ((coordinates.length + 1) % resolution === 0) {
      coordinates.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
  }

  // Ensure the last point is included
  if (
    coordinates.length === 0 ||
    coordinates[coordinates.length - 1].latitude !== lat / 1e5 ||
    coordinates[coordinates.length - 1].longitude !== lng / 1e5
  ) {
    coordinates.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return coordinates;
}

const MapAnalytics = () => {
  const [viewState, setViewState] = useState({
    longitude: 73.873065,
    latitude: 18.482337,
    zoom: 12,
  });

  const zoomToSizeMapping = {
    // 1: 100000,
    // 2: 55000,
    // 3: 50000,
    // 4: 40000,
    // 5: 20000,
    // 6: 10000,
    // 7: 4000,
    // 8: 2000,
    // 9: 900,
    // 10: 500,
    // 11: 300,
    // 12: 200,
    // 13: 100,
    // 14: 50,
    // 15: 30,
    // 16: 30,
    // 17: 15,
    // 18: 10,
    // 19: 7,
    // 20: 3,
  };

  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [route, setRoute] = useState([]);
  const [totalSteps, setTotalSteps] = useState(50);
  const [selectingStart, setSelectingStart] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [jsonArray, setJsonArray] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [outputText, setOutputText] = useState("");

  const formatData = (routeData) => {
    switch (selectedFormat) {
      case "csv":
        return routeData
          .map(
            (point) =>
              `${point.latitude},${point.longitude},${point.roadName || ""}`
          )
          .join("\n");

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

  const handleMapClick = (event) => {
    const [longitude, latitude] = event.coordinate;

    if (selectingStart) {
      setStartPoint([longitude, latitude]);
      setSelectingStart(false);
    } else if (selectingEnd) {
      setEndPoint([longitude, latitude]);
      setSelectingEnd(false);
    }
  };

  // useEffect(() => {
  //   if (startPoint && endPoint) {
  //     const fetchRoute = async () => {
  //       const response = await fetch(
  //         `https://api.olamaps.io/routing/v1/directions?origin=${startPoint[1]},${startPoint[0]}&destination=${endPoint[1]},${endPoint[0]}&api_key=MTaKhXqkZwxQn4MQfUeSynGw092Nfkf6RIJbx2YH`,
  //         {
  //           method: "POST",
  //         }
  //       );
  //       const data = await response.json();
  //       const coordinates = data.routes[0].legs[0].steps.map((step) => [
  //         step.end_location.lng,
  //         step.end_location.lat,
  //       ]);

  //       setRoute(coordinates);
  //     };

  //     fetchRoute();
  //   }
  // }, [startPoint, endPoint]);

  useEffect(() => {
    // console.log("hello 1");

    if (startPoint && endPoint) {
      // console.log("hello 2");
      const fetchRoute = async () => {
        const response = await fetch(
          `https://api.olamaps.io/routing/v1/directions?origin=${startPoint[1]},${startPoint[0]}&destination=${endPoint[1]},${endPoint[0]}&api_key=MTaKhXqkZwxQn4MQfUeSynGw092Nfkf6RIJbx2YH`,
          {
            method: "POST",
          }
        );
        const data = await response.json();
        console.log({ main: decodePolyline(data.routes[0].overview_polyline) });

        const decodedRoute = decodePolyline(data.routes[0].overview_polyline)

        setMarkers([
          {
            position: startPoint,
            type: "start",
            size: zoomToSizeMapping[Math.floor(viewState.zoom)] || 300,
            icon: "marker",
          },
          {
            position: endPoint,
            type: "end",
            icon: "marker",
            size: zoomToSizeMapping[Math.floor(viewState.zoom)] || 300,
          },
          ...decodedRoute.map((point) => ({
            position: [point.longitude, point.latitude],
            type: "route",
            icon: "marker",
            size: zoomToSizeMapping[Math.floor(viewState.zoom)] || 300,
          })),
        ]);

        setOutputText(formatData(decodedRoute));

        setJsonArray(
          JSON.stringify(decodePolyline(data.routes[0].overview_polyline))
        );
        // const coordinates = data.routes[0].legs[0].steps.map((step) => [
        //   step.end_location.lng,
        //   step.end_location.lat,
        //   step.distance,
        // ]);

        // console.log({ coordinates });

        // return coordinates;
      };

      const generatePointsArray = (
        startPointLocal,
        endPointLocal,
        distanceLocal
      ) => {
        let pointsArray = [];
        let step = 0;
        const totalStepsLocal = (totalSteps * distanceLocal) / 100;
        while (step < totalStepsLocal) {
          const t = step / totalStepsLocal;
          const interpolatedPosition = [
            startPointLocal[0] + t * (endPointLocal[0] - startPointLocal[0]),
            startPointLocal[1] + t * (endPointLocal[1] - startPointLocal[1]),
          ];
          pointsArray.push(interpolatedPosition);
          step++;
        }
        // console.log({ pointsArray });

        return pointsArray;
      };

      const mainRunner = async () => {
        let routeData = await fetchRoute();
        // console.log({ routeData });

        let step = 0;
        let jsonArrayLocal = [];

        // console.log("hello 3");

        for (let i = 0; i < routeData.length - 1; i++) {
          const startPointLocal = routeData[i];
          const endPointLocal = routeData[i + 1];
          const distanceLocal = routeData[i][2];
          // console.log({ startPointLocal, endPointLocal, distanceLocal });

          let generatedPointsArrayLocal = generatePointsArray(
            startPointLocal,
            endPointLocal,
            distanceLocal
          );

          // console.log({ generatedPointsArrayLocal });

          jsonArrayLocal = [...jsonArrayLocal, ...generatedPointsArrayLocal];

          // console.log("hello 7");
          // console.log({ jsonArrayLocal });
        }

        setMarkers([
          {
            position: startPoint,
            type: "start",
            size: zoomToSizeMapping[Math.floor(viewState.zoom)] || 300,
            icon: "marker",
          },
          {
            position: endPoint,
            type: "end",
            icon: "marker",
            size: zoomToSizeMapping[Math.floor(viewState.zoom)] || 300,
          },
          ...jsonArrayLocal.map((point) => ({
            position: point,
            type: "route",
            icon: "marker",
            size: zoomToSizeMapping[Math.floor(viewState.zoom)] || 300,
          })),
        ]);

        setJsonArray(JSON.stringify(jsonArrayLocal));
      };

      fetchRoute();
    }
  }, [startPoint, endPoint, totalSteps]);

  const handleViewStateChange = ({ viewState }) => {
    setViewState(viewState);
    return;
    const newSize = zoomToSizeMapping[Math.floor(viewState.zoom)] || 300;
    setMarkers((prev) =>
      prev.map((marker) => ({
        ...marker,
        size: newSize,
      }))
    );
  };

  useEffect(() => {
    if (startPoint) {
      setMarkers((prev) => [
        ...prev.filter((marker) => marker.type !== "start"),
        {
          position: startPoint,
          type: "start",
          size: zoomToSizeMapping[Math.floor(viewState.zoom)] || 300,
          icon: "marker",
        },
      ]);
    }
  }, [startPoint]);

  useEffect(() => {
    if (endPoint) {
      setMarkers((prev) => [
        ...prev.filter((marker) => marker.type !== "end"),
        {
          position: endPoint,
          type: "end",
          icon: "marker",
          size: zoomToSizeMapping[Math.floor(viewState.zoom)] || 300,
        },
      ]);
    }
  }, [endPoint]);

  useEffect(() => {
    if (jsonArray.length === 0) return;
  }, [jsonArray]);

  // console.log({ jsonArray });

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

  // console.log({
  //   markers,
  //   startPoint,
  //   endPoint,
  //   route,
  //   totalSteps,
  //   jsonArray,
  // });

  return (
    <>
      <div style={{ padding: "10px" }}>
        <div>
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={() => setSelectingStart(true)}
          >
            Choose Starting Point
          </button>
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={() => setSelectingEnd(true)}
          >
            Choose End Point
          </button>
          <input
            type="number"
            value={totalSteps}
            onChange={(e) => setTotalSteps(Number(e.target.value))}
            placeholder="Total Steps"
            style={{ marginLeft: "10px", width: "100px" }}
          />
        </div>
        <div>
          {/* input start point and end point manually */}
          <label>Start Point:</label>
          <input
            type="text"
            value={startPoint && startPoint[0]}
            onChange={(e) => {
              setStartPoint([
                Number(e.target.value),
                startPoint ? startPoint[1] : 0,
              ]);
            }}
            placeholder="Start Point"
            style={{ width: "100%" }}
          />
          <input
            type="text"
            value={startPoint && startPoint[1]}
            onChange={(e) => {
              setStartPoint([
                startPoint ? startPoint[0] : 0,
                Number(e.target.value),
              ]);
            }}
            placeholder="Start Point"
            style={{ width: "100%" }}
          />
          <label>End Point:</label>
          <input
            type="text"
            value={endPoint && endPoint[0]}
            onChange={(e) => {
              setEndPoint([Number(e.target.value), endPoint ? endPoint[1] : 0]);
            }}
            placeholder="End Point"
            style={{ width: "100%" }}
          />
          <input
            type="text"
            value={endPoint && endPoint[1]}
            onChange={(e) => {
              setEndPoint([endPoint ? endPoint[0] : 0, Number(e.target.value)]);
            }}
            placeholder="End Point"
            style={{ width: "100%" }}
          />
        </div>
      </div>
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
          onClick={handleMapClick}
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
      <div style={{ padding: "10px", marginTop: "10px" }}>
        <label>Generated Route JSON Array:</label>
        <textarea
          readOnly
          value={outputText}
          rows={10}
          style={{ width: "100%", marginTop: "10px" }}
        />
      </div>
    </>
  );
};

export default MapAnalytics;
