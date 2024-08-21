import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const customIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xml:space="preserve">
        <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
            <path d="M 45 90 C 30.086 71.757 15.174 46.299 15.174 29.826 S 28.527 0 45 0 s 29.826 13.353 29.826 29.826 S 59.914 71.757 45 90 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(220,32,40); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/>
            <circle cx="45" cy="29.380000000000003" r="13.5" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform="  matrix(1 0 0 1 0 0) "/>
            <path d="M 48.596 5.375 C 33.355 5.375 21 17.73 21 32.97 c 0 1.584 0.141 3.135 0.397 4.646 C 20.496 35.035 20 32.264 20 29.375 c 0 -13.807 11.193 -25 25 -25 c 2.889 0 5.661 0.496 8.242 1.397 C 51.731 5.516 50.18 5.375 48.596 5.375 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(231,77,70); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/>
        </g>
    </svg>`),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const center = [39.8283, -98.5795];

const CustomerMap = () => {
  const [locations, setLocations] = useState([]);
  const [coordinates, setCoordinates] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://rapidquest-4vwc.onrender.com/api/v1/customerDistribution"
        );
        const data = response.data;
        setLocations(data);

        const cachedCoords = JSON.parse(localStorage.getItem("coords")) || {};

        const citiesToFetch = data
          .filter((location) => !cachedCoords[location._id])
          .map((location) => location._id);

        const newCoords = {};
        for (const city of citiesToFetch) {
          const encodedCity = encodeURIComponent(city);
          const geoResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedCity}&key=${process.env.REACT_APP_GEOCODING_API_KEY}`
          );

          if (geoResponse.data.results.length > 0) {
            const { lat, lng } = geoResponse.data.results[0].geometry.location;
            newCoords[city] = { lat, lng };
          }
        }

        const updatedCoords = { ...cachedCoords, ...newCoords };
        setCoordinates(updatedCoords);
        localStorage.setItem("coords", JSON.stringify(updatedCoords));
      } catch (error) {
        console.error("Error fetching the data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={4}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locations.map((location) => {
        const { _id: city } = location;
        const coord = coordinates[city];
        if (!coord) return null;

        return (
          <Marker
            key={city}
            position={[coord.lat, coord.lng]}
            icon={customIcon}
          >
            <Popup>
              <div>
                <h4>{city}</h4>
                <p>Count: {location.count}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default CustomerMap;
