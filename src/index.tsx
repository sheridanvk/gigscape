import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import axios, { AxiosError } from "axios";
import Map from "./Map";
import "mapbox-gl/dist/mapbox-gl.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { LatLngType } from "./types";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (_failureCount, error) =>
        (error as AxiosError).isAxiosError &&
        (error as AxiosError).response?.status === 404
          ? false
          : true,
      refetchOnWindowFocus: false,
      staleTime: 12 * 60 * 60 * 1000,
    },
  },
});

const Application = () => {
  const [initialLocation, setInitialLocation] =
    useState<LatLngType | null>(null);
  useEffect(() => {
    const fetchIPLocation = async () => {
      try {
        const { latitude: lat, longitude: lng } = (
          await axios.get("https://geolocation-db.com/json/")
        ).data;
        setInitialLocation({ lat, lng });
      } catch {
        console.error("No access to location services");
        setInitialLocation({ lat: 51.5, lng: 0.01 });
      }
    };

    fetchIPLocation();
  }, []);

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        {initialLocation && <Map initialLocation={initialLocation} />}
        {/* <Footer></Footer> */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>
  );
};

ReactDOM.render(<Application />, document.getElementById("app"));
