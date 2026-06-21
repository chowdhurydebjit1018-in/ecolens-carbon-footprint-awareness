import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { UserProfile } from "../types";
import { User, LogOut, Navigation, Sparkles, Percent, Compass, CheckCircle2, MapPin } from "lucide-react";

interface ProfileProps {
  profile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
}

export default function Profile({ profile, onProfileUpdated }: ProfileProps) {
  const [name, setName] = useState(profile.name);
  const [city, setCity] = useState(profile.city);
  const [lifestyleType, setLifestyleType] = useState<UserProfile["lifestyleType"]>(profile.lifestyleType);
  const [primaryTransport, setPrimaryTransport] = useState<UserProfile["primaryTransport"]>(profile.primaryTransport);
  const [goalPercent, setGoalPercent] = useState(profile.goalPercent);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setSuccess(false);
    setError(null);

    const updatedProfile: UserProfile = {
      ...profile,
      name: name.trim(),
      city,
      lifestyleType,
      primaryTransport,
      goalPercent: Number(goalPercent),
    };

    try {
      await updateDoc(doc(db, "users", profile.userId), {
        name: name.trim(),
        city,
        lifestyleType,
        primaryTransport,
        goalPercent: Number(goalPercent),
      });

      onProfileUpdated(updatedProfile);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError("Failed to update profile values on database.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error("Sign out fail:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-900" id="profile-heading">
            My Environmental Profile
          </h1>
          <p className="text-xs text-gray-400">Configure your local parameters and CO₂ target goals.</p>
        </div>
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold px-3 py-1.5 transition flex items-center gap-1.5"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <form onSubmit={handleUpdate} className="space-y-5 mt-5">
        {success && (
          <div className="flex items-center space-x-2 bg-emerald-50 p-2 text-emerald-800 text-xs rounded-lg border border-emerald-100">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Profile metrics saved successfully!</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 p-2 text-red-700 text-xs rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Preferred Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> Preferred name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-905 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Navigation className="h-3.5 w-3.5" /> City
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-905 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
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
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Lifestyle segment
            </label>
            <select
              value={lifestyleType}
              onChange={(e) => setLifestyleType(e.target.value as any)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-905 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              <option value="professional">Professional (Regular Commute)</option>
              <option value="student">Student (Campus Commuter)</option>
              <option value="home">Home / Remote Worker</option>
              <option value="hostel">Hostel Resident</option>
            </select>
          </div>

          {/* Transport mode */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Primary Commute Mode</label>
            <select
              value={primaryTransport}
              onChange={(e) => setPrimaryTransport(e.target.value as any)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-905 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              <option value="car">Gasoline / Diesel Car</option>
              <option value="bike">Motorcycle / Motorbike</option>
              <option value="metro">Metro / Subway</option>
              <option value="bus">Standard Municipal Bus</option>
              <option value="train font-bold">Regional Train / Rapid Transit</option>
              <option value="cycle">Bicycle / Scooter</option>
              <option value="walk">Walking / Runner</option>
            </select>
          </div>
        </div>

        {/* Goal reductions target */}
        <div className="space-y-2 border-t border-gray-100 pt-4 mt-2">
          <label className="block text-xs font-semibold text-gray-450 uppercase tracking-wider mb-1 flex justify-between">
            <span className="flex items-center gap-1">
              <Percent className="h-3.5 w-3.5 text-emerald-500" /> Carbon savings goal
            </span>
            <span className="font-bold text-emerald-600">{goalPercent}% carbon offset target</span>
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 text-sm transition flex items-center justify-center disabled:bg-emerald-400"
        >
          {loading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          ) : (
            <span>Update Profile Parameters</span>
          )}
        </button>
      </form>
    </div>
  );
}
