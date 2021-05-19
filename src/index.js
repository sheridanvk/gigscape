import React, { useRef } from "react";
import ReactDOM from "react-dom";
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
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Map />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>
  );
};

ReactDOM.render(<Application />, document.getElementById("app"));
