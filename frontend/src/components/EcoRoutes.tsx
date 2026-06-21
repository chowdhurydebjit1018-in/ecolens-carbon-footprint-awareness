import React, { useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { Search, AlertCircle, Navigation, Map as MapIcon } from "lucide-react";
import PlaceAutocompleteInput from "./routes/PlaceAutocompleteInput";
import GoogleRouteMap from "./routes/GoogleRouteMap";
import RouteComparisonResult from "./routes/RouteComparisonResult";
import { fetchRouteComparison, RouteComparisonResponse, RouteLocation } from "../api/routes.api";

const LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

export default function EcoRoutes() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY || "AIzaSyBVKAMtKn7-ogj8e5bKSfaHzUU1PmmDm5Y",
    libraries: LIBRARIES
  });

  const [origin, setOrigin] = useState<RouteLocation | null>(null);
  const [destination, setDestination] = useState<RouteLocation | null>(null);
  const [vehicleType, setVehicleType] = useState("petrol");
  
  const [comparison, setComparison] = useState<RouteComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) {
      setError("Please key in both origin and destination cities or locations from suggestions.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchRouteComparison({ origin, destination, vehicleType });
      setComparison(data);
    } catch (err: any) {
      console.error(err);
      setError("Route analysis service is temporarily preparing databases. Enter standard regional hubs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900" id="route-heading">
          Eco-Friendly Routes
        </h1>
        <div className="mt-1 flex items-center gap-3">
          <p className="text-sm text-gray-500">
            Plan carbon-optimized commutes using live traffic-aware estimates.
          </p>
          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md uppercase tracking-wider">
            {comparison 
              ? (comparison.source === "google-routes" ? "Live Google Route" : "Estimated Fallback Route") 
              : "Estimated Route"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Inputs (Col 4) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-4 h-fit">
          <h2 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100 uppercase tracking-wide">Search Directions</h2>

          <form onSubmit={handleSearch} className="mt-5 space-y-4">
            {error && (
              <div className="bg-amber-50 p-2.5 rounded-lg text-amber-700 text-xs border border-amber-100 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Origin & Destination */}
            {isLoaded ? (
              <>
                <PlaceAutocompleteInput
                  label="From"
                  placeholder="e.g. Downtown, Home"
                  iconColorClass="text-emerald-600"
                  value={origin}
                  onLocationSelect={setOrigin}
                />
                <PlaceAutocompleteInput
                  label="To"
                  placeholder="e.g. Airport, Work"
                  iconColorClass="text-red-500"
                  value={destination}
                  onLocationSelect={setDestination}
                />
              </>
            ) : (
              <div className="p-4 bg-gray-50 rounded text-xs text-center text-red-600">
                {loadError ? `Maps Load Error: ${loadError.message}` : "Loading Maps API..."}
              </div>
            )}

            {/* Vehicle Fuel Type Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Commuting Vehicle Fuel
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-905 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="petrol">Gasoline Petrol Car</option>
                <option value="diesel">Diesel Fuel Car</option>
                <option value="hybrid">Hybrid Vehicle</option>
                <option value="ev">Pure Electric (EV)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !origin || !destination}
              className="mt-4 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 transition text-sm flex items-center justify-center space-x-2 disabled:bg-emerald-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Get Routes</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Map Panel (Col 8) */}
        <div className="lg:col-span-8">
          <div className="h-[400px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col relative">
            {!isLoaded ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <MapIcon className="h-10 w-10 animate-pulse mb-2" />
                <p className="text-sm">Loading Live Map...</p>
              </div>
            ) : (
              <GoogleRouteMap origin={origin} destination={destination} comparison={comparison} />
            )}
            
            {comparison?.source === "fallback" && (
              <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                Fallback Routing Active
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Results */}
      {comparison ? (
        <div className="mt-8 pt-8 border-t border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Route Analysis Results</h2>
          <RouteComparisonResult comparison={comparison} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-8">
          <Navigation className="h-12 w-12 text-gray-300 animate-bounce" />
          <span className="text-base font-bold text-gray-700 mt-4">Check ecological routing</span>
          <p className="text-xs text-gray-400 max-w-md mt-1.5 leading-relaxed">
            Enter locations using the autocomplete search to find the most fuel-efficient live route for your commute. Google route-based carbon estimates are calculated precisely.
          </p>
        </div>
      )}
    </div>
  );
}
