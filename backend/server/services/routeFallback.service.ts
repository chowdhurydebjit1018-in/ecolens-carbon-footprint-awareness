import { BayAreaCoordinates } from "../data/routeFallbackLocations";

export function getDistanceMi(origin: string, destination: string): number {
  const o = origin.toLowerCase().trim();
  const d = destination.toLowerCase().trim();

  // Try exact lookup
  let oCoords = BayAreaCoordinates[o];
  let dCoords = BayAreaCoordinates[d];

  // Partial match fallback
  if (!oCoords) {
    const key = Object.keys(BayAreaCoordinates).find(k => o.includes(k));
    if (key) oCoords = BayAreaCoordinates[key];
  }
  if (!dCoords) {
    const key = Object.keys(BayAreaCoordinates).find(k => d.includes(k));
    if (key) dCoords = BayAreaCoordinates[key];
  }

  if (oCoords && dCoords) {
    // Haversine formula
    const R = 3958.8; // Radius of Earth in miles
    const dLat = ((dCoords.lat - oCoords.lat) * Math.PI) / 180;
    const dLon = ((dCoords.lng - oCoords.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((oCoords.lat * Math.PI) / 180) *
        Math.cos((dCoords.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const directDist = R * c;
    // Add transit/driving routing factor of ~1.25x
    return Number((directDist * 1.25).toFixed(1));
  }

  // Fallback distance based on string length hash if fully custom locations
  const sum = origin.length + destination.length;
  return Number((10 + (sum % 40) + Math.random() * 2).toFixed(1));
}
