import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import styled from "styled-components";

const StyledHeader = styled.header`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 1em;
  pointer-events: none;
  position: absolute;
  width: 100%;
  z-index: 2;
`;

const StyledGeocoder = styled.div`
  max-width: 50%;
  & .mapboxgl-ctrl-geocoder,
  & .mapboxgl-ctrl-geocoder input[type="text"] {
    font-size: 16px;
    min-width: 100%;
  }
`;

const StyledLogo = styled.img`
  max-width: 145px;
`;

export default function Header({ accessToken, map }) {
  const geocoderRef = useRef();

  useEffect(() => {
    const geocoder = new MapboxGeocoder({
      accessToken: accessToken,
      flyTo: { duration: 0 },
      mapboxgl,
      placeholder: "Search for location"
    });

    geocoderRef.current.appendChild(geocoder.onAdd(map));
  }, [map, accessToken]);

  return (
    <StyledHeader>
      <StyledLogo
        src="/gigscape_logo.png"
      ></StyledLogo>
      <StyledGeocoder id="geocoder" ref={geocoderRef}></StyledGeocoder>
    </StyledHeader>
  );
}
