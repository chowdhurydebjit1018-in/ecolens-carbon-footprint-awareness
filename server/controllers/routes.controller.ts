import { Request, Response, NextFunction } from "express";
import { getComputeRoutes, RouteOption } from "../services/googleMaps.service";
import { calculateRouteEmission } from "../services/routeEmission.service";
import { getDistanceMi as fallbackGetDistanceMi } from "../services/routeFallback.service";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getEcoRoute = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { origin, destination, vehicleType } = req.body;

  if (!origin || !destination || !origin.latitude || !destination.latitude) {
    return sendError(res, 400, "bad_request", "Origin and destination objects with coordinates are required", req.id as string);
  }

  const result = await getComputeRoutes(
    { latitude: origin.latitude, longitude: origin.longitude },
    { latitude: destination.latitude, longitude: destination.longitude },
    vehicleType || "petrol"
  );

  let fastestRouteObj: any;
  let ecoRouteObj: any;
  let assumptions: string[] = [];

  const processRoute = (route: RouteOption, isEco: boolean) => {
    const distanceKm = route.distanceMeters / 1000;
    let emissionKg = calculateRouteEmission(distanceKm, vehicleType);
    if (isEco) {
      // Simulate smoother driving savings if it's the exact same distance
      emissionKg = emissionKg * 0.8;
    }
    const durationS = parseInt(route.duration.replace("s", ""), 10);
    return {
      distanceKm: Number(distanceKm.toFixed(1)),
      durationMinutes: Math.round(durationS / 60),
      estimatedEmissionKg: Number(emissionKg.toFixed(2)),
      encodedPolyline: route.polyline?.encodedPolyline
    };
  };

  if (result.source === "google" && result.routes && result.routes.length > 0) {
    const routes = result.routes;
    
    // Default route = first route without FUEL_EFFICIENT (or just the first one if all have it)
    const fastest = routes.find(r => !r.routeLabels?.includes("FUEL_EFFICIENT")) || routes[0];
    
    // Eco route = route with FUEL_EFFICIENT
    let eco = routes.find(r => r.routeLabels?.includes("FUEL_EFFICIENT"));

    if (!eco) {
      if (routes.length > 1) {
        assumptions.push("No official fuel-efficient route returned. Showing lowest emission alternative.");
        eco = routes.reduce((prev, curr) => {
          return (curr.distanceMeters < prev.distanceMeters) ? curr : prev;
        });
      } else {
        assumptions.push("Only one route returned by Google. Estimated an eco alternative based on steady-speed driving over a 5% longer distance.");
      }
    }

    fastestRouteObj = processRoute(fastest, false);
    
    if (eco && eco !== fastest) {
      ecoRouteObj = processRoute(eco, true); // apply 20% reduction if it's actually eco
    } else {
      // Create synthetic eco route
      const distKm = (fastest.distanceMeters / 1000) * 1.05;
      const durationS = parseInt(fastest.duration.replace("s", ""), 10);
      ecoRouteObj = {
        distanceKm: Number(distKm.toFixed(1)),
        durationMinutes: Math.round((durationS / 60) * 1.05),
        estimatedEmissionKg: Number((calculateRouteEmission(distKm, vehicleType) * 0.8).toFixed(2)),
        encodedPolyline: fastest.polyline?.encodedPolyline // Use same polyline
      };
    }
  } else {
    // Fallback
    assumptions.push("Live Google route data is temporarily unavailable. Showing an estimated regional comparison.");
    const distanceMi = fallbackGetDistanceMi(origin.address || "unknown", destination.address || "unknown");
    const distanceKm = distanceMi * 1.60934;
    
    const normalDuration = Math.round((distanceMi / 45) * 60 + 3);
    const normalEmission = calculateRouteEmission(distanceKm, vehicleType);

    fastestRouteObj = {
      distanceKm: Number(distanceKm.toFixed(1)),
      durationMinutes: normalDuration,
      estimatedEmissionKg: normalEmission
    };

    const ecoDistKm = distanceKm * 1.05;
    ecoRouteObj = {
      distanceKm: Number(ecoDistKm.toFixed(1)),
      durationMinutes: Math.round((ecoDistKm / 1.60934 / 40) * 60),
      estimatedEmissionKg: Number((calculateRouteEmission(ecoDistKm, vehicleType) * 0.8).toFixed(2))
    };
  }

  const estimatedSavingKg = Number((fastestRouteObj.estimatedEmissionKg - ecoRouteObj.estimatedEmissionKg).toFixed(2));
  const estimatedSavingPercent = fastestRouteObj.estimatedEmissionKg > 0 
    ? Number(((estimatedSavingKg / fastestRouteObj.estimatedEmissionKg) * 100).toFixed(0)) 
    : 0;

  const responseData = {
    source: result.source === "google" ? "google-routes" : "fallback",
    origin: {
      address: origin.address || "Unknown Origin",
      latitude: origin.latitude,
      longitude: origin.longitude
    },
    destination: {
      address: destination.address || "Unknown Destination",
      latitude: destination.latitude,
      longitude: destination.longitude
    },
    fastestRoute: fastestRouteObj,
    ecoRoute: ecoRouteObj,
    estimatedSavingKg: Math.max(0, estimatedSavingKg),
    estimatedSavingPercent: Math.max(0, estimatedSavingPercent),
    assumptions
  };

  return sendSuccess(res, responseData);
});
