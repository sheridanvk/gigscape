import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Map from "./Map";
import "mapbox-gl/dist/mapbox-gl.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (_failureCount, error) =>
        error.response.status === 404 ? false : true,
      refetchOnWindowFocus: false,
      staleTime: 12 * 60 * 60 * 1000,
    },
  },
});

const Application = () => {
  const [initialLocation, setInitialLocation] = useState(null);
  useEffect(() => {
    const fetchIPLocation = async () => {
      const { latitude: lat, longitude: lng } = (
        await axios.get("http://geolocation-db.com/json/")
      ).data;
      setInitialLocation({ lat, lng });
    };

    fetchIPLocation();
  }, []);

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        {initialLocation && <Map initialLocation={initialLocation} />}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>
  );
};

ReactDOM.render(<Application />, document.getElementById("app"));
