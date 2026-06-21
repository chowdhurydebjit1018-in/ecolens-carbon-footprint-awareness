import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { UserProfile } from "../types";
import { Compass, Sparkles, Navigation, User, Percent } from "lucide-react";

interface OnboardingProps {
  userId: string;
  email: string;
  onCompleted: (profile: UserProfile) => void;
}

export default function Onboarding({ userId, email, onCompleted }: OnboardingProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("Downtown Area");
  const [lifestyleType, setLifestyleType] = useState<UserProfile["lifestyleType"]>("professional");
  const [primaryTransport, setPrimaryTransport] = useState<UserProfile["primaryTransport"]>("car");
  const [goalPercent, setGoalPercent] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please suggest your name");
      return;
    }
    setError(null);
    setLoading(true);

    const profile: UserProfile = {
      userId,
      email,
      name: name.trim(),
      city,
      lifestyleType,
      primaryTransport,
      goalPercent: Number(goalPercent),
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "users", userId), profile);
      onCompleted(profile);
    } catch (err: any) {
      console.error(err);
      setError("Failed to initialize your profile in database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 pb-6 border-b border-gray-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Compass className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Welcome to EcoLens!</h2>
            <p className="text-xs text-gray-500">Let's set up your personal carbon baseline profiling</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {error && (
            <div className="bg-red-50 p-3 rounded-lg text-red-700 text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preferred Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <User className="h-4 w-4 text-gray-400" />
                First Name / Nickname
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Eco Explorer"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Navigation className="h-4 w-4 text-gray-400" />
                City Location (Local Region preferred)
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Downtown Area">Downtown Area</option>
                <option value="North District">North District</option>
                <option value="South District">South District</option>
                <option value="West District">West District</option>
                <option value="East District">East District</option>
                <option value="Suburbs">Suburbs</option>
                <option value="Rural Area">Rural Area</option>
                <option value="Airport Commuter">Airport Commuter</option>
                <option value="Other">Other / Custom</option>
              </select>
            </div>

            {/* Lifestyle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-gray-400" />
                Lifestyle Segment
              </label>
              <select
                value={lifestyleType}
                onChange={(e) => setLifestyleType(e.target.value as any)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="professional">Professional (Regular Commuter, Officeworker)</option>
                <option value="student">Student (Campus Commuter, Shared housing)</option>
                <option value="home">Home / Remote Worker (Low Transit, High House Energy)</option>
                <option value="hostel">Hostel (Shared Dormitory, Minimal House Energy)</option>
              </select>
            </div>

            {/* Primary Transportation */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Primary Commute Mode</label>
              <select
                value={primaryTransport}
                onChange={(e) => setPrimaryTransport(e.target.value as any)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="car">Gasoline / Diesel Car</option>
                <option value="bike">Motorcycle / Motorbike</option>
                <option value="metro">Metro / Subway</option>
                <option value="bus">Standard Municipal Bus</option>
                <option value="train">Regional Train / Rapid Transit</option>
                <option value="cycle">Bicycle / Electric Scooter</option>
                <option value="walk">Walking / Runner</option>
              </select>
            </div>
          </div>

          {/* Goal reduction target */}
          <div className="space-y-2 border-t border-gray-100 pt-5">
            <label className="block text-sm font-medium text-gray-700 flex justify-between">
              <span className="flex items-center gap-1.5">
                <Percent className="h-4 w-4 text-emerald-500" />
                Your Monthly CO₂e Reduction Target
              </span>
              <span className="font-semibold text-emerald-600">{goalPercent}% carbon reduction</span>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={goalPercent}
              onChange={(e) => setGoalPercent(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
            />
            <div className="flex justify-between text-xs text-gray-400 px-1">
              <span>Moderate (5%)</span>
              <span>Ambitious (20%)</span>
              <span>Net Zero Path (50%)</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 transition text-sm flex items-center justify-center space-x-2 disabled:bg-emerald-400"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              <span>Launch My EcoLens Journey</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
