import React, { useState, useEffect } from "react";
import { Activity, UserProfile, AIInsight } from "../types";
import { ApiClient } from "../api/client";
import { EMISSION_FACTORS } from "../lib/emissionFactors";
import { 
  Sparkles, 
  TrendingDown, 
  Activity as LogIcon, 
  Target, 
  RefreshCw, 
  AlertTriangle, 
  Compass, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  MapPin
} from "lucide-react";
import { getTopEmissionCategory, getReductionOpportunity, getCarbonSaved, getDashboardMetrics } from "../lib/metricsService";

interface DashboardProps {
  activities: Activity[];
  profile: UserProfile;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ activities, profile, onNavigate }: DashboardProps) {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [missionComplete, setMissionComplete] = useState(false);

  // Fetch all centralized metrics
  const metrics = getDashboardMetrics(activities, profile);
  const {
    weeklyEmission,
    monthlyEmission,
    totalEmissions,
    categoryEmissions,
    topCategory: topCategoryData,
    carbonSaved: carbonSavedStats,
    ecoScore,
    avgDailyEmissions,
    trend,
    activityCount
  } = metrics;

  // Calculate past week's emissions
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const dailyTrendData = past7Days.map((dateStr) => {
    const dayEmissions = activities
      .filter((a) => a.date === dateStr)
      .reduce((sum, current) => sum + current.emissionKg, 0);
    
    // format date label: eg "Jun 18"
    const dateObj = new Date(dateStr + "T00:00:00");
    const label = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { label, emissions: Number(dayEmissions.toFixed(1)) };
  });

  const typicalDailyBaseline = 12.5; // kg CO2e per day
  const userGoalDailyTarget = typicalDailyBaseline * (1 - (profile.goalPercent / 100));
  const daysWithRecordsCount = Math.max(new Set(activities.map((a) => a.date)).size, 1);

  const reductionOpp = getReductionOpportunity(insight);

  // Set style colors according to score range
  const getScoreColor = (sc: number) => {
    if (activityCount < 3) return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-500", ring: "text-gray-300" };
    if (sc >= 90) return { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", ring: "text-emerald-600" };
    if (sc >= 75) return { bg: "bg-teal-50", border: "border-teal-100", text: "text-teal-700", ring: "text-teal-600" };
    if (sc >= 50) return { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", ring: "text-amber-600" };
    if (sc >= 25) return { bg: "bg-orange-50", border: "border-orange-100", text: "text-orange-700", ring: "text-orange-500" };
    return { bg: "bg-red-50", border: "border-red-100", text: "text-red-700", ring: "text-red-600" };
  };
  const scoreTheme = getScoreColor(ecoScore);

  // Fetch AI Insights
  const fetchAIInsights = async () => {
    setLoadingAI(true);
    setAiError(null);
    try {
      const data = await ApiClient.post<AIInsight>("/gemini/insights", { activities, profile });
      setInsight(data);
    } catch (err: any) {
      console.error(err);
      setAiError("EcoLens AI assistant is temporarily preparing models. Log more activities to check again!");
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    // Fetch initial recommendations if activities exist
    if (activities.length > 0) {
      fetchAIInsights();
    }
  }, [activities.length]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900" id="dash-heading">
            Eco Dashboard
          </h1>
          <p className="text-sm text-gray-500 flex items-center mt-1 gap-1">
            <MapPin className="h-4 w-4 text-emerald-600" />
            Analyzing {profile.city || "your region"} footprint • Baseline adjusted for <strong>{profile.lifestyleType}</strong> lifestyle
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <button
            onClick={() => onNavigate("log")}
            className="inline-flex items-center space-x-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold transition"
          >
            <LogIcon className="h-4 w-4" />
            <span>Log Habits</span>
          </button>
        </div>
      </div>

      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className={`p-6 rounded-2xl border ${scoreTheme.border} ${scoreTheme.bg} flex flex-col justify-between shadow-sm`}>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Eco-Score</span>
            <div className="flex items-center space-x-4 mt-2">
              <div className="relative flex items-center justify-center">
                {/* Score Circular gauge */}
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="transparent" />
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="28" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    fill="transparent" 
                    strokeDasharray={175} 
                    strokeDashoffset={175 - (175 * (activityCount < 3 ? 0 : ecoScore)) / 100}
                    className={`${scoreTheme.ring} transition-all duration-1000 ease-out`}
                  />
                </svg>
                <span className="absolute text-lg font-bold text-gray-800">
                  {activityCount < 3 ? "--" : ecoScore}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-950">
                  {activityCount < 3 ? "Building Baseline" : ecoScore >= 90 ? "Exemplary" : ecoScore >= 75 ? "Strong" : ecoScore >= 50 ? "Improving" : ecoScore >= 25 ? "Needs Focus" : "High Impact Area"}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {activityCount < 3 ? "Log 3+ activities to unlock a reliable score." : "Excellent carbon conservation habits."}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Daily Average</span>
            <span className="font-semibold text-gray-800">{avgDailyEmissions.toFixed(1)} kg CO₂e</span>
          </div>
        </div>

        {/* Current Emission Balance */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Weekly Total Logged</span>
            <div className="mt-2 flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold text-gray-900">{weeklyEmission.toFixed(1)}</span>
              <span className="text-sm font-medium text-gray-500">kg CO₂e</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Across {activities.length} custom activity logs.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Carbon saved vs typical</span>
            <span className="flex items-center text-emerald-600 font-semibold gap-0.5">
              <TrendingDown className="h-3.5 w-3.5" />
              {Math.max(0, (typicalDailyBaseline - avgDailyEmissions) * daysWithRecordsCount).toFixed(1)} kg
            </span>
          </div>
        </div>

        {/* Target Progress Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Monthly Target Buffer</span>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <span className="text-xl font-bold text-gray-900">{monthlyEmission.toFixed(1)}</span>
                <span className="text-xs text-gray-400"> / {(userGoalDailyTarget * 30).toFixed(1)} CO₂e avg</span>
              </div>
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                <Target className="h-3.5 w-3.5" />
                <span>-{profile.goalPercent}% Goal</span>
              </div>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  monthlyEmission <= (userGoalDailyTarget * 30) ? "bg-emerald-500" : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, (monthlyEmission / ((userGoalDailyTarget * 30) || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Status</span>
            <span className={`font-semibold ${monthlyEmission <= (userGoalDailyTarget * 30) ? "text-emerald-600" : "text-amber-600"}`}>
              {monthlyEmission <= (userGoalDailyTarget * 30) ? "Surpassing Goal Goals!" : "Running Above Targets"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Content: Trend & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Weekly Trend: Custom SVG Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-7">
          <h3 className="text-base font-bold text-gray-900">Weekly Emission Tracker</h3>
          <p className="text-xs text-gray-500 mb-6">Carbon habits trends across the last seven days.</p>

          <div className="h-48 w-full mt-4">
            {activities.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl">
                <Compass className="h-8 w-8 text-gray-300" />
                <span className="text-sm font-medium text-gray-800 mt-2">Start tracking your carbon activities to discover<br/>your biggest emission sources and personalized<br/>reduction opportunities.</span>
                <button
                  onClick={() => onNavigate("log")}
                  className="mt-4 inline-flex items-center space-x-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold transition"
                >
                  <LogIcon className="h-4 w-4" />
                  <span>Log First Activity</span>
                </button>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col justify-end space-y-2">
                {/* Beautiful custom-rendered inline bar display */}
                <div className="flex items-end justify-between h-36 px-2">
                  {dailyTrendData.map((day, idx) => {
                    const maxVal = Math.max(...dailyTrendData.map(d => d.emissions), typicalDailyBaseline, 10);
                    const barHeightPct = (day.emissions / maxVal) * 100;
                    const baselineHeightPct = (typicalDailyBaseline / maxVal) * 100;

                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white rounded text-[10px] px-2 py-0.5 pointer-events-none whitespace-nowrap z-10">
                          {day.emissions} kg CO₂e
                        </div>
                        {/* Interactive Graph Column bar */}
                        <div className="w-6 sm:w-8 md:w-10 bg-emerald-100 rounded-t-md hover:bg-emerald-200 transition-all cursor-pointer relative" style={{ height: `${Math.max(4, barHeightPct)}%` }}>
                          <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-md" style={{ height: `${Math.min(100, (day.emissions / typicalDailyBaseline) * 100)}%` }}></div>
                        </div>
                        <span className="text-[10px] font-medium text-gray-400 mt-2 text-center truncate w-full">{day.label}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Horizontal Baseline markers */}
                <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> User Logging
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400"></span> Regional Baseline (~12.5kg)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI EcoLens Insights Widget */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-6 rounded-2xl shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-md bg-emerald-500 text-white animate-pulse">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-white text-base">EcoLens AI Insights</h3>
              </div>
              <button 
                onClick={fetchAIInsights} 
                disabled={loadingAI || activities.length === 0}
                className="hover:bg-emerald-800/50 p-1.5 rounded-md transition text-emerald-300 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loadingAI ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingAI ? (
              <div className="space-y-4 mt-6">
                <div className="h-4 bg-emerald-800/40 rounded animate-pulse w-3/4"></div>
                <div className="h-16 bg-emerald-800/30 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-emerald-800/40 rounded animate-pulse w-2/3"></div>
              </div>
            ) : aiError ? (
              <div className="mt-6 flex items-start gap-2 bg-emerald-800/40 p-3 rounded-lg border border-emerald-700/30">
                <AlertTriangle className="h-5 w-5 shrink-0 text-emerald-300" />
                <p className="text-xs text-emerald-200 leading-relaxed">{aiError}</p>
              </div>
            ) : insight ? (
              <div className="space-y-4 mt-6">
                <div>
                  <span className="text-[10px] tracking-wider uppercase opacity-60 text-emerald-300">Executive Diagnostics</span>
                  <p className="text-sm font-medium leading-relaxed text-emerald-100 mt-1">{insight.summary}</p>
                </div>

                <div className="bg-emerald-850/60 p-3 rounded-xl border border-emerald-800/40">
                  <span className="text-[10px] tracking-wider uppercase opacity-60 text-emerald-300">Top Influence Sector</span>
                  <p className="text-sm font-semibold text-white mt-0.5">{insight.topCause}</p>
                </div>

                {insight.recommendations && insight.recommendations.length > 0 && (
                  <div>
                    <span className="text-[10px] tracking-wider uppercase opacity-60 text-emerald-300">Target Action Item</span>
                    <div className="bg-emerald-800/30 p-3 rounded-xl flex items-center justify-between border border-emerald-800/20 mt-1">
                      <div>
                        <h4 className="text-xs font-bold text-white">{insight.recommendations[0].title}</h4>
                        <p className="text-[10px] text-emerald-300 mt-0.5">Difficulty: {insight.recommendations[0].difficulty}</p>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-400 bg-emerald-900/50 px-2 py-1 rounded">
                        -{insight.recommendations[0].impactKgCO2e} kg
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-8 text-center text-emerald-200">
                <Compass className="h-10 w-10 mx-auto opacity-40 mb-2" />
                <p className="text-xs">Provide baseline data by logging carbon activities on the log tab and EcoLens AI will formulate personalized carbon reductions!</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => onNavigate("guide")}
            className="mt-6 w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-1.5 transition text-xs"
          >
            <span>Ask EcoGuide Advisor</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Category Distribution & Brief Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-2">Footprint by Category</h3>
          <p className="text-xs text-gray-500 mb-4">Cumulative emissions distribution by segment.</p>

          <div className="space-y-4 mt-6">
            {(Object.entries(categoryEmissions) as [keyof typeof categoryEmissions, number][]).map(([cat, val]) => {
              const totalSum = Math.max(Object.values(categoryEmissions).reduce((a, b) => a + b, 0), 1);
              const pct = (val / totalSum) * 100;

              const labelMap = {
                transport: { name: "Transport & Transit", color: "bg-teal-500", rawColor: "text-teal-600" },
                electricity: { name: "Home Electricity", color: "bg-amber-500", rawColor: "text-amber-600" },
                food: { name: "Food & Nutrition", color: "bg-emerald-500", rawColor: "text-emerald-600" },
                shopping: { name: "Retail Shopping", color: "bg-blue-500", rawColor: "text-blue-600" },
                waste: { name: "Waste Disposal", color: "bg-purple-500", rawColor: "text-purple-600" },
              };

              const current = labelMap[cat] || { name: cat, color: "bg-gray-500", rawColor: "text-gray-600" };

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-700">{current.name}</span>
                    <span className="font-semibold text-gray-900">{val.toFixed(1)} kg ({Math.round(pct)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${current.color} rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Emission Source Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Top Emission Source</h3>
            {topCategoryData.totalEmission > 0 ? (
              <div className="mt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900 capitalize text-lg">{topCategoryData.category}</span>
                    <span className="text-xs text-gray-500">{topCategoryData.weeklyContribution} kg CO₂e this week</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-700 font-medium leading-relaxed">
                    <strong className="text-gray-900">{topCategoryData.percentage}%</strong> of your footprint. 
                    Most emissions currently come from {topCategoryData.category}-related activities.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Compass className="h-8 w-8 text-gray-300 mb-3" />
                <span className="text-sm font-semibold text-gray-700">No top source yet.</span>
                <p className="text-xs text-gray-500 mt-1">Log your first activity to identify your biggest emission source.</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Stats & Quick Tip */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Sustainable Milestones</h3>
            <p className="text-xs text-gray-500 mb-4">Milestone targets of the global Net Zero target framework.</p>

            <div className="space-y-3.5 mt-4">
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                <p>Ensure transit emissions represent less than 3.0 kg CO₂e per day.</p>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                <p>Integrate at least 3 vegan / meat-free meal servings a week to cut dietary load by 40%.</p>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                <p>Replace non-recycled waste by switching plastic and metallic food packings onto glass.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100/50 flex gap-3 text-xs text-emerald-800">
            <Sparkles className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="leading-relaxed">
              <strong>Tip of the Week:</strong> Driving smoothly without rapid acceleration saves up to 20% on vehicle carbon outputs. Explore the <strong>Eco-Friendly Routes</strong> tool in your sidebar to calculate driving efficiency!
            </p>
          </div>
        </div>

      </div>

        {/* Today's Mission */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-between md:col-span-2 mt-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-emerald-100" />
                <h3 className="text-base font-bold">Today's Mission</h3>
              </div>
              <p className="text-lg font-semibold mt-2">Take one trip under 2 km without a vehicle</p>
            </div>
            <div className="text-right bg-black/10 px-3 py-2 rounded-xl backdrop-blur-sm">
              <span className="block text-[10px] uppercase tracking-wider text-emerald-100 mb-0.5">Potential Saving</span>
              <span className="font-extrabold text-white">0.8 kg CO₂e</span>
            </div>
          </div>
          <div className="mt-6">
            <button 
              onClick={() => setMissionComplete(true)}
              disabled={missionComplete}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-sm ${
                missionComplete 
                  ? "bg-emerald-800 text-emerald-100 cursor-default" 
                  : "bg-white text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {missionComplete ? "Completed!" : "Mark Complete"}
            </button>
          </div>
        </div>
    </div>
  );
}
