import { ApiClient } from "./client";

export interface RouteLocation {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

export interface RouteRequest {
  origin: RouteLocation;
  destination: RouteLocation;
  vehicleType: "petrol" | "diesel" | "hybrid" | "ev" | string;
}

export interface RouteData {
  distanceKm: number;
  durationMinutes: number;
  estimatedEmissionKg: number;
  encodedPolyline?: string;
}

export interface RouteComparisonResponse {
  source: "google-routes" | "fallback";
  origin: RouteLocation;
  destination: RouteLocation;
  fastestRoute: RouteData;
  ecoRoute: RouteData;
  estimatedSavingKg: number;
  estimatedSavingPercent: number;
  assumptions: string[];
}

export const fetchRouteComparison = async (request: RouteRequest): Promise<RouteComparisonResponse> => {
  return ApiClient.post<RouteComparisonResponse>("/routes/eco", request);
};
