import React from "react";
import { Timer, Leaf, Sparkles } from "lucide-react";
import { RouteComparisonResponse } from "../../api/routes.api";

interface RouteComparisonResultProps {
  comparison: RouteComparisonResponse;
}

export default function RouteComparisonResult({ comparison }: RouteComparisonResultProps) {
  return (
    <div className="space-y-6">
      {/* Savings Hero Banner */}
      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">Commute Carbon Budget</span>
          <h3 className="text-xl font-extrabold text-emerald-950 mt-1 flex items-center gap-1">
            <Leaf className="h-5 w-5 text-emerald-600 shrink-0" />
            Saved {comparison.estimatedSavingKg} kg CO₂e on this trip
          </h3>
          <p className="text-xs text-emerald-800/80 mt-1 max-w-md">
            Opting for the Eco-Optimized path allows steady cruising speeds, lowering fuel consumption rate.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 bg-emerald-600 text-white p-4 rounded-xl text-center shrink-0">
          <span className="block text-2xl font-black">{comparison.estimatedSavingPercent}%</span>
          <span className="text-[9px] uppercase tracking-wider font-bold">Carbon Saved</span>
        </div>
      </div>

      {/* Compare Routes list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fastest Route Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Normal Route</span>
              <span className="text-xl font-extrabold text-gray-900 font-mono">{comparison.fastestRoute.estimatedEmissionKg.toFixed(2)} kg</span>
            </div>
            <h4 className="text-xs font-bold text-gray-900 mt-4">Standard Freeway Route</h4>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">Standard Route with typical highway speeds. Subject to congested stop-and-go traffic segments.</p>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-6 grid grid-cols-2 gap-2 text-center text-xs text-gray-600">
            <div>
              <span className="block text-xs font-semibold text-gray-400">Distance</span>
              <span className="font-bold text-gray-800">{comparison.fastestRoute.distanceKm} km</span>
            </div>
            <div className="border-l border-gray-100">
              <span className="block text-xs font-semibold text-gray-400 flex items-center justify-center gap-1">
                <Timer className="h-3.5 w-3.5 text-gray-400" /> Duration
              </span>
              <span className="font-bold text-gray-800">{comparison.fastestRoute.durationMinutes} mins</span>
            </div>
          </div>
        </div>

        {/* Eco Friendly Route Card */}
        <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] uppercase font-bold tracking-wider px-3 py-1 rounded-bl-xl">
            Highly Recommended
          </div>

          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">EcoRoute EcoPath</span>
              <span className="text-xl font-extrabold text-emerald-600 font-mono">{comparison.ecoRoute.estimatedEmissionKg.toFixed(2)} kg</span>
            </div>
            <h4 className="text-xs font-bold text-gray-900 mt-4">Eco-Optimized Route</h4>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">Optimal-grade route bypassing major gridlock. Features steady cruising speeds that maximize engine and battery efficiency.</p>
          </div>

          <div className="border-t border-emerald-100 pt-4 mt-6 grid grid-cols-2 gap-2 text-center text-xs text-gray-650">
            <div>
              <span className="block text-xs font-semibold text-gray-400">Distance</span>
              <span className="font-bold text-emerald-800">{comparison.ecoRoute.distanceKm} km</span>
            </div>
            <div className="border-l border-emerald-100">
              <span className="block text-xs font-semibold text-gray-400 flex items-center justify-center gap-1">
                <Timer className="h-3.5 w-3.5 text-emerald-500" /> Duration
              </span>
              <span className="font-bold text-emerald-805">{comparison.ecoRoute.durationMinutes} mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Equivalents */}
      <div className="bg-white p-4 rounded-xl text-xs text-gray-600 leading-relaxed border border-gray-100">
        <span className="font-semibold text-gray-800 block mb-2">Equivalent to:</span>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-emerald-50 p-2 rounded text-emerald-800">
            <strong className="text-sm block">{Math.round(comparison.estimatedSavingKg * 121.6)}</strong> phone charges
          </div>
          <div className="bg-emerald-50 p-2 rounded text-emerald-800">
            <strong className="text-sm block">{Math.round(comparison.estimatedSavingKg * 1.5)}</strong> LED bulb hours
          </div>
          <div className="bg-emerald-50 p-2 rounded text-emerald-800">
            <strong className="text-sm block">{Math.round(comparison.estimatedSavingKg * 2.1)}</strong> tree absorption days
          </div>
        </div>
      </div>

      {/* Informative advice */}
      {comparison.assumptions && comparison.assumptions.length > 0 && (
        <div className="bg-amber-50 p-4 rounded-xl text-xs text-amber-800 leading-relaxed border border-amber-100 flex flex-col gap-2">
          {comparison.assumptions.map((note, idx) => (
             <p key={idx}><strong>Note:</strong> {note}</p>
          ))}
        </div>
      )}
      <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 leading-relaxed border border-gray-100 flex items-start gap-2">
        <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          <strong>Eco-Driving Savings Strategy:</strong> By staying strictly on green-recommended highway arterial lines we avoid dense localized bumper-to-bumper city blocks. This keeps engines cooling optimally, saving up to 1.1 kg of carbon per 10 km of travel.
        </p>
      </div>
    </div>
  );
}
