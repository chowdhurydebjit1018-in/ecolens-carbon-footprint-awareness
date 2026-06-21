import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, UserProfile } from "../types";
import { EMISSION_FACTORS } from "../lib/emissionFactors";
import { calculateEmission, validateActivityInput } from "../lib/carbonCalculator";
import { getTopEmissionCategory } from "../lib/metricsService";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ApiClient } from "../api/client";
import { 
  PlusCircle, 
  Trash2, 
  Compass, 
  Calendar, 
  FileText, 
  Sparkles, 
  Info, 
  ShoppingBag, 
  Flame, 
  Car, 
  Smile,
  Zap,
  Egg,
  Trash,
  Check
} from "lucide-react";

interface LogActivityProps {
  userId: string;
  activities: Activity[];
  onActivitiesChanged: (items: Activity[]) => void;
}

function normalizeActivityDate(input: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  if (/^\d{2}-\d{2}-\d{4}$/.test(input)) {
    const [day, month, year] = input.split("-");
    return `${year}-${month}-${day}`;
  }
  throw new Error("Invalid date format");
}

export default function LogActivity({ userId, activities, onActivitiesChanged }: LogActivityProps) {
  const [category, setCategory] = useState<"transport" | "electricity" | "food" | "shopping" | "waste">("transport");
  const [activityType, setActivityType] = useState("petrol_car");
  const [quantity, setQuantity] = useState<number>(10);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successLogged, setSuccessLogged] = useState(false);

  // Set default activity type when category updates
  useEffect(() => {
    const list = Object.keys(EMISSION_FACTORS[category]);
    if (list.length > 0) {
      setActivityType(list[0]);
    }
  }, [category]);

  const selectList = EMISSION_FACTORS[category] || {};
  const currentFactorObj = (selectList[activityType] || { label: "", factor: 0, unit: "" }) as any;
  const currentFactorValue = currentFactorObj.factor;
  const unit = currentFactorObj.unit || "";
  const currentLabel = currentFactorObj.label || "";

  // Dynamic Emission Preview math
  const liveEmission = Number((Math.max(0, quantity || 0) * currentFactorValue).toFixed(2));

  // Equivalent Metrics:
  // 1 kg CO2e ~= 120 phone charges, 150 lightbulb hours, 0.12 tree absorb-years, 8 km on ordinary car
  const phoneCharges = Math.round(liveEmission * 122);
  const lightbulbHours = Math.round(liveEmission * 145);
  const treeAbsorptionDays = Math.round(liveEmission * 30); // ~30 days of standard tree absorbing carbon

  const impactLevel = liveEmission < 1 ? { label: "Low Impact", color: "text-emerald-600 bg-emerald-50 border-emerald-100", dot: "🟢" } :
                      liveEmission < 5 ? { label: "Medium Impact", color: "text-amber-600 bg-amber-50 border-amber-100", dot: "🟡" } :
                      { label: "High Impact", color: "text-red-600 bg-red-50 border-red-100", dot: "🔴" };

  const topCategoryData = getTopEmissionCategory(activities);
  const isTopCategory = topCategoryData.category === category;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateActivityInput(category, activityType, quantity);
    if (!validation.isValid) {
      setError(validation.error || "Invalid entry input. Please correct the fields.");
      return;
    }

    setLoading(true);

    try {
      const normalizedDate = normalizeActivityDate(date);
      const clientRequestId = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const savedDoc = await ApiClient.post<Activity>("/activities", {
        category,
        activityType,
        quantity,
        unit,
        date: normalizedDate,
        clientRequestId,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });

      // Put to front of list
      onActivitiesChanged([savedDoc, ...activities]);
      
      // Reset variables
      setQuantity(10);
      setNotes("");
      setSuccessLogged(true);
      setTimeout(() => {
        setSuccessLogged(false);
      }, 2200);
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to log activity via /activities:", err.message);
      }
      setError(err.message || "Failed to sync your activity log with the cloud database. Check your network.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await ApiClient.delete(`/activities/${id}`);
      onActivitiesChanged(); // Triggers App.tsx to fetch activities
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete activity log from database.");
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "transport": return <Car className="h-4 w-4 text-teal-600" />;
      case "electricity": return <Zap className="h-4 w-4 text-amber-600" />;
      case "food": return <Egg className="h-4 w-4 text-emerald-600" />;
      case "shopping": return <ShoppingBag className="h-4 w-4 text-blue-600" />;
      case "waste": return <Trash className="h-4 w-4 text-purple-600" />;
      default: return <Compass className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStyleTheme = (cat: string) => {
    switch (cat) {
      case "transport": return "bg-teal-50 border-teal-100 text-teal-800";
      case "electricity": return "bg-amber-50 border-amber-100 text-amber-800";
      case "food": return "bg-emerald-50 border-emerald-100 text-emerald-800";
      case "shopping": return "bg-blue-50 border-blue-100 text-blue-800";
      case "waste": return "bg-purple-50 border-purple-100 text-purple-800";
      default: return "bg-gray-50 border-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900" id="log-heading">
          Log Daily Activities
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Record your day-to-day transit, energy usage, retail selections, and waste disposal patterns to see immediate feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Activity form entry (Col 5) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-5 h-fit">
          <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">Record a Habit</h2>

          <form onSubmit={handleAdd} className="mt-5 space-y-4">
            {error && (
              <div className="bg-red-50 p-2.5 rounded-lg text-red-700 text-xs border border-red-100">
                {error}
              </div>
            )}

            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Category
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(["transport", "electricity", "food", "shopping", "waste"] as const).map((cat) => {
                  const isActive = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-2 text-[10px] font-bold rounded-lg border flex flex-col items-center justify-center gap-1 transition ${
                        isActive 
                          ? "bg-emerald-50 border-emerald-400 text-emerald-800 ring-1 ring-emerald-400" 
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {getCategoryIcon(cat)}
                      <span className="capitalize">{cat === "electricity" ? "Energy" : cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Activity Type Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Activity type
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                {Object.entries(selectList).map(([key, item]: any) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                <label>Quantity</label>
                <span className="text-emerald-700 lowercase font-medium">({unit})</span>
              </div>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === "" ? 0 : Number(e.target.value))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Row with Date & Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" /> Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-gray-400" /> Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. carpool"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Dynamic Footprint Preview Block */}
            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50 space-y-3 mt-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-gray-500 font-medium">Estimated Footprint</span>
                <div className="text-emerald-800 text-lg font-extrabold flex items-baseline gap-0.5">
                  <motion.span
                    key={liveEmission}
                    initial={{ scale: 0.9, opacity: 0.8 }}
                    animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="inline-block"
                  >
                    {liveEmission.toFixed(2)}
                  </motion.span>
                  <span className="text-[10px] font-semibold text-emerald-600">kg CO₂e</span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-100/30 grid grid-cols-3 gap-2 text-center text-[10px] text-gray-600">
                <div className="bg-white p-2 rounded-lg border border-gray-100">
                  <span className="block font-bold text-gray-800">{phoneCharges}</span>
                  <span className="text-[9px] text-gray-400">Phone Charges</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-100">
                  <span className="block font-bold text-gray-800">{lightbulbHours}h</span>
                  <span className="text-[9px] text-gray-400">Led Light Bulb</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-100">
                  <span className="block font-bold text-gray-800">{treeAbsorptionDays}d</span>
                  <span className="text-[9px] text-gray-400">Tree Absorption</span>
                </div>
              </div>
            </div>

            {/* Why This Matters */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-blue-500" />
                Why This Matters
              </h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                {isTopCategory ? `${category.charAt(0).toUpperCase() + category.slice(1)} is currently your largest emission source. ` : ""}
                {category === 'transport' && "Reducing one similar trip every week could save approximately 88 kg CO₂e annually."}
                {category === 'electricity' && "Switching to energy-efficient habits can drastically cut down long-term emissions."}
                {category === 'food' && "Food choices, particularly red meat, hold a massive carbon footprint. Plant-based meals lower your impact."}
                {category === 'shopping' && "Retail items carry hidden manufacturing and shipping emissions. Buying less, but better, helps."}
                {category === 'waste' && "Recycling properly prevents potent methane emissions from landfills."}
              </p>
              
              <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${impactLevel.color}`}>
                <span>{impactLevel.dot}</span>
                <span>{impactLevel.label}</span>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading || successLogged ? 1 : 1.02 }}
              whileTap={{ scale: loading || successLogged ? 1 : 0.97 }}
              className={`mt-4 w-full rounded-lg font-bold py-2.5 text-sm flex items-center justify-center space-x-2 disabled:cursor-not-allowed transition-colors duration-300 ${
                successLogged
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-100"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-emerald-400"
              }`}
            >
              {loading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : successLogged ? (
                <motion.div 
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 450, damping: 20 }}
                  className="flex items-center space-x-2"
                >
                  <motion.div
                    initial={{ rotate: -180, scale: 0.2 }}
                    animate={{ rotate: 360, scale: 1 }}
                    transition={{ type: "spring", stiffness: 350, damping: 15 }}
                  >
                    <Check className="h-5 w-5 text-white stroke-[3.5px]" />
                  </motion.div>
                  <span className="text-white font-extrabold tracking-wide">Saved & Sync'd!</span>
                </motion.div>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  <span>Log Activity</span>
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* Activity logs listing (Col 7) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-7 flex flex-col h-[520px]">
          <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">Logged Habits History</h2>

          {activities.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-xl mt-5">
              <Compass className="h-10 w-10 text-gray-300" />
              <span className="text-sm font-semibold text-gray-800 mt-2">Your sustainability journey begins here.</span>
              <p className="text-xs text-gray-500 max-w-xs mt-2 leading-relaxed">
                Log your first activity to unlock:<br/>
                • Eco Score<br/>
                • Personalized AI insights<br/>
                • Carbon reduction plans<br/>
                • Sustainability badges
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3.5">
              <AnimatePresence initial={false}>
                {activities.map((act) => {
                  const isGreen = act.emissionKg < 1;
                  const formattedDate = new Date(act.date + "T00:00:00").toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, height: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, height: "auto", y: 0, scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.9, y: 20, transition: { duration: 0.25 } }}
                      transition={{ type: "spring", stiffness: 350, damping: 26 }}
                      className="origin-top"
                    >
                      <div className="group flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-emerald-100 hover:shadow-sm transition mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2.5 rounded-xl border ${getStyleTheme(act.category)}`}>
                            {getCategoryIcon(act.category)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-gray-900 capitalize">
                                {EMISSION_FACTORS[act.category]?.[act.activityType]?.label || act.activityType}
                              </h4>
                              <span className="text-[10px] text-gray-400 font-medium">({formattedDate})</span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                              Amount: {act.quantity} {act.unit}
                              {act.notes && <span className="text-emerald-600 block sm:inline sm:before:content-['•_'] font-normal italic">"{act.notes}"</span>}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <span className="block text-xs font-extrabold text-gray-950 font-mono">
                              {act.emissionKg.toFixed(1)}
                            </span>
                            <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 block font-mono">
                              kg CO₂e
                            </span>
                          </div>
                          <button
                            onClick={() => handleDelete(act.id)}
                            className="opacity-40 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1 rounded transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
