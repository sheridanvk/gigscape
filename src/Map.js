import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import Header from "./Header";
import Event from "./Event";
import { useQuery } from "react-query";

// This is my access token, with read-only settings, which you have to include in client code to display map tiles.
// You can get your own at mapbox.com!
mapboxgl.accessToken =
  "pk.eyJ1Ijoic2hlcmlkYW52ayIsImEiOiJjajh2cDd3dWsweWhnMzNwMnNqaTlsbGljIn0.SzawANobBNZNsLfVkzhwAQ";

const dateToday = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const result = new Date(today.getTime() - offset * 60 * 1000);
  return result.toISOString().split("T")[0];
};

export default function Map({ initialLocation }) {
  const mapElement = useRef(null);
  const map = useRef(null);
  const [lat, setLat] = useState(initialLocation.lat || 51.5);
  const [lng, setLng] = useState(initialLocation.lng || 0.01);
  const [zoom, setZoom] = useState(10);
  const [activeEvent, setActiveEvent] = useState(null);

  // Setup
  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapElement.current,
      style: "mapbox://styles/mapbox/dark-v9",
      center: [lng, lat],
      zoom: zoom,
      minZoom: 10,
    });
    map.current.on("moveend", () => {
      setLng(map.current.getCenter().lng.toFixed(1));
      setLat(map.current.getCenter().lat.toFixed(1));
      setZoom(map.current.getZoom().toFixed(2));
      setActiveEvent(null);
    });
    map.current.on("mouseup", () => {
      setActiveEvent(null);
    });
  });

  // Display event listings

  const { isLoading, data: events } = useQuery(
    `eventListings-${lat}-${lng}-${dateToday()}`,
    async () =>
      (
        await axios.get(".netlify/functions/getConcerts", {
          params: { lat: lat, lng: lng },
        })
      ).data
  );

  useEffect(() => {
    if (!isLoading && events) {
      events.forEach((event) => {
        // create a HTML element for each feature
        const markerElement = document.createElement("div");
        markerElement.className = "marker";
        markerElement.addEventListener("click", () => {
          // we clear out the active event before setting it again to let the event component re-mount correctly
          setActiveEvent(null);
          setActiveEvent(event);
        });

        new mapboxgl.Marker(markerElement, {
          anchor: "bottom",
        })
          .setLngLat([event.location.lng, event.location.lat])
          .addTo(map.current);
      });
    }
  }, [events]);

  return (
    <div id="mapContainer" ref={mapElement}>
      {map.current && (
        <Header map={map.current} accessToken={mapboxgl.accessToken}></Header>
      )}
      {activeEvent && <Event event={activeEvent} />}
    </div>
  );
}
