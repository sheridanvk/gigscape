import React, { useCallback, useEffect, useMemo, useState } from "react";
import mapboxgl from "mapbox-gl";
import ky from "ky/umd";
import Header from "./Header";
import Event from "./Event";

// This is my access token, with read-only settings, which you have to include in client code to display map tiles.
// You can get your own at mapbox.com!
mapboxgl.accessToken =
  "pk.eyJ1Ijoic2hlcmlkYW52ayIsImEiOiJjajh2cDd3dWsweWhnMzNwMnNqaTlsbGljIn0.SzawANobBNZNsLfVkzhwAQ";

export default React.forwardRef(function Map(props, ref) {
  const [mapState, setMapState] = useState({ lng: 0.01, lat: 51.5, zoom: 10 });
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);

  // Setup
  const [mapElement, map] = useMemo(() => {
    const mapElement = document.createElement("main");
    mapElement.id = "map";

    const map = new mapboxgl.Map({
      container: mapElement,
      style: "mapbox://styles/mapbox/dark-v9",
      center: [mapState.lng, mapState.lat],
      zoom: mapState.zoom,
      minZoom: 10
    });

    return [mapElement, map];
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    map.on("moveend", async () => {
      setMapState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
      setActiveEvent(null);
    });
    map.on("mouseup", () => {
      setActiveEvent(null);
    });
    // eslint-disable-next-line
  }, []);

  // Append Mapbox element to React div
  const mapContainerRefCallback = useCallback(
    node => {
      if (ref) {
        ref.current = node;
      }

      if (node) {
        node.appendChild(mapElement);
        map.resize();
      }
    },
    [mapElement, ref, map]
  );

  // Display event listings

  useEffect(() => {
    async function getEventListings(lat, lng) {
      try {
        const eventsResponse = await ky
          .get(".netlify/functions/getConcerts", {
            searchParams: { lat, lng }
          })
          .json();
        setEvents(eventsResponse);
      } catch (error) {
        setEvents([]);
      }
    }
    getEventListings(mapState.lat, mapState.lng);
  }, [mapState]);

  useEffect(() => {
    events.forEach(event => {
      // create a HTML element for each feature
      const markerElement = document.createElement("div");
      markerElement.className = "marker";
      markerElement.addEventListener("click", () => {
        // we clear out the active event before setting it again to let the event component re-mount correctly
        setActiveEvent(null);
        setActiveEvent(event);
      });

      new mapboxgl.Marker(markerElement, {
        anchor: "bottom"
      })
        .setLngLat([event.location.lng, event.location.lat])
        .addTo(map);
    });
  }, [events, map]);

  return (
    <div id="mapContainer" ref={mapContainerRefCallback}>
      <Header map={map} accessToken={mapboxgl.accessToken}></Header>
      {activeEvent && <Event event={activeEvent} />}
    </div>
  );
});
