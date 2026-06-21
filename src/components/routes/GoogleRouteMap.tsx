import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { RouteLocation, RouteComparisonResponse } from "../../api/routes.api";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1rem"
};

const defaultCenter = {
  lat: 37.7749, // SF
  lng: -122.4194
};

interface GoogleRouteMapProps {
  origin: RouteLocation | null;
  destination: RouteLocation | null;
  comparison: RouteComparisonResponse | null;
}

export default function GoogleRouteMap({ origin, destination, comparison }: GoogleRouteMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (map && origin && destination) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: origin.latitude, lng: origin.longitude });
      bounds.extend({ lat: destination.latitude, lng: destination.longitude });
      map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    }
  }, [map, origin, destination, comparison]);

  // Decode polylines
  const fastestPath = comparison?.fastestRoute?.encodedPolyline
    ? google.maps.geometry.encoding.decodePath(comparison.fastestRoute.encodedPolyline)
    : [];

  const ecoPath = comparison?.ecoRoute?.encodedPolyline
    ? google.maps.geometry.encoding.decodePath(comparison.ecoRoute.encodedPolyline)
    : [];

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={origin ? { lat: origin.latitude, lng: origin.longitude } : defaultCenter}
      zoom={11}
      onLoad={setMap}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
      }}
    >
      {origin && <Marker position={{ lat: origin.latitude, lng: origin.longitude }} label="A" />}
      {destination && <Marker position={{ lat: destination.latitude, lng: destination.longitude }} label="B" />}

      {/* Fastest Route (Gray/Blue) */}
      {fastestPath.length > 0 && (
        <Polyline
          path={fastestPath}
          options={{
            strokeColor: "#64748b", // slate-500
            strokeOpacity: 0.8,
            strokeWeight: 6,
            zIndex: 1
          }}
        />
      )}

      {/* Eco Route (Emerald) */}
      {ecoPath.length > 0 && comparison?.ecoRoute?.encodedPolyline !== comparison?.fastestRoute?.encodedPolyline && (
        <Polyline
          path={ecoPath}
          options={{
            strokeColor: "#10b981", // emerald-500
            strokeOpacity: 1.0,
            strokeWeight: 6,
            zIndex: 2
          }}
        />
      )}
    </GoogleMap>
  );
}
