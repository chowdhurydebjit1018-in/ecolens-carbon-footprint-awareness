import { env } from "../config/env";
import { getDistanceMi as fallbackGetDistanceMi } from "./routeFallback.service";
import { logger } from "../utils/logger";

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface RouteOption {
  distanceMeters: number;
  duration: string; // e.g. "1200s"
  polyline: { encodedPolyline: string };
  routeLabels: string[];
}

export interface ComputeRoutesResult {
  source: "google" | "fallback";
  routes?: RouteOption[];
  fallbackDistanceMi?: number;
}

const mapEmissionType = (vehicleType: string) => {
  switch (vehicleType) {
    case "petrol":
    case "petrol_car":
      return "GASOLINE";
    case "diesel":
    case "diesel_car":
      return "DIESEL";
    case "hybrid":
    case "hybrid_car":
      return "HYBRID";
    case "ev":
    case "ev_car":
      return "ELECTRIC";
    default:
      return "GASOLINE";
  }
};

export const getComputeRoutes = async (
  origin: LatLng,
  destination: LatLng,
  vehicleType: string
): Promise<ComputeRoutesResult> => {
  if (!env.GOOGLE_MAPS_API_KEY) {
    logger.warn("No GOOGLE_MAPS_API_KEY provided, using fallback distance calculation");
    return {
      source: "fallback",
      // the fallback will use text-based address if available, but we only have lat/lng here
      // we'll let the controller handle it by returning a 0 distance if fallback needs text
      fallbackDistanceMi: fallbackGetDistanceMi("fallback", "fallback") // The controller will manage fallback properly
    };
  }

  try {
    const url = "https://routes.googleapis.com/directions/v2:computeRoutes";
    const body = {
      origin: {
        location: {
          latLng: {
            latitude: origin.latitude,
            longitude: origin.longitude
          }
        }
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.latitude,
            longitude: destination.longitude
          }
        }
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE_OPTIMAL",
      computeAlternativeRoutes: true,
      requestedReferenceRoutes: ["FUEL_EFFICIENT"],
      routeModifiers: {
        vehicleInfo: {
          emissionType: mapEmissionType(vehicleType)
        }
      },
      polylineQuality: "HIGH_QUALITY",
      polylineEncoding: "ENCODED_POLYLINE"
    };

    const headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.routeLabels"
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok && data.routes && data.routes.length > 0) {
      return {
        source: "google",
        routes: data.routes
      };
    } else {
      logger.error("Google Routes API returned error or no routes", data);
      return { source: "fallback" };
    }
  } catch (error) {
    logger.error("Error fetching distance from Google Routes API", error);
    return { source: "fallback" };
  }
};
