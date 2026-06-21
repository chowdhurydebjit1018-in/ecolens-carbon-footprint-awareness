import React from "react";
import { Activity, Badge } from "../types";
import { checkUnlockedBadges } from "../lib/badgeTriggers";
import { Award, Compass, Star, CheckCircle, TrendingDown, Clock, ShieldCheck, MapPin, TrendingUp, CalendarDays } from "lucide-react";
import { getTrendDirection } from "../lib/metricsService";

interface ProgressProps {
  activities: Activity[];
}

export default function Progress({ activities }: ProgressProps) {
  // Compute badges dynamically
  const badgesWithStatus = checkUnlockedBadges(activities);
  const earnedBadgesCount = badgesWithStatus.filter((b) => b.earnedAt).length;

  // Total reduced footprint math
  const typicalDailyBaseline = 12.5; // kg
  const daysWithRecordsCount = Math.max(new Set(activities.map((a) => a.date)).size, 1);
  const totalEmissions = activities.reduce((acc, curr) => acc + curr.emissionKg, 0);
  const avgDailyEmissions = activities.length > 0 ? (totalEmissions / daysWithRecordsCount) : 0;
  const carbonSavedKg = Math.max(0, (typicalDailyBaseline - avgDailyEmissions) * daysWithRecordsCount);

  // Journey & Trend calculations
  const trend = getTrendDirection(activities);
  
  let lowestDay = { date: "N/A", emission: Infinity };
  const dailyTotals = activities.reduce((acc, curr) => {
    acc[curr.date] = (acc[curr.date] || 0) + curr.emissionKg;
    return acc;
  }, {} as Record<string, number>);

  for (const [date, val] of Object.entries(dailyTotals)) {
    if (val < lowestDay.emission) {
      lowestDay = { date, emission: val };
    }
  }
  if (lowestDay.emission === Infinity) lowestDay = { date: "No data", emission: 0 };

  const journeyLevel = activities.length === 0 ? 0 :
                       activities.length < 5 ? 1 :
                       carbonSavedKg > 0 ? 2 :
                       earnedBadgesCount >= 2 ? 3 : 4;

  const journeySteps = [
    { name: "Awareness", status: journeyLevel > 0 ? "✓" : "⟳" },
    { name: "Tracking", status: journeyLevel > 1 ? "✓" : journeyLevel === 1 ? "⟳" : "🔒" },
    { name: "Optimization", status: journeyLevel > 2 ? "✓" : journeyLevel === 2 ? "⟳" : "🔒" },
    { name: "Reduction", status: journeyLevel > 3 ? "✓" : journeyLevel === 3 ? "⟳" : "🔒" },
    { name: "Champion", status: journeyLevel >= 4 ? "✓" : "🔒" },
  ];

  // Category statistics helper
  const loggedCatCounts = {
    transport: activities.filter((a) => a.category === "transport").length,
    electricity: activities.filter((a) => a.category === "electricity").length,
    food: activities.filter((a) => a.category === "food").length,
    shopping: activities.filter((a) => a.category === "shopping").length,
    waste: activities.filter((a) => a.category === "waste").length,
  };

  // Calculate past week details for graph
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const chartData = past7Days.map((dateStr) => {
    const sum = activities
      .filter((a) => a.date === dateStr)
      .reduce((s, curr) => s + curr.emissionKg, 0);
    const dateObj = new Date(dateStr + "T00:00:0s");
    const label = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    return { label, value: sum };
  });

  const maxChartValue = Math.max(...chartData.map((d) => d.value), 10);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900" id="progress-heading">
          Eco Progress & Achievements
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Follow your environmental carbon reduction milestones and watch your sustainability level expand.
        </p>
      </div>

      {/* Gamification Milestone Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total carbon offset */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cumulative Saved</span>
            <span className="text-xl font-extrabold text-gray-900">{carbonSavedKg.toFixed(1)} kg CO₂e</span>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Below Regional Baseline offsets</p>
          </div>
        </div>

        {/* Badges unlocked */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Eco-Achievements</span>
            <span className="text-xl font-extrabold text-gray-900">{earnedBadgesCount} / {badgesWithStatus.length}</span>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Badges unlocked to date</p>
          </div>
        </div>

        {/* User Level */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl shrink-0">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Carbon Level</span>
            <span className="text-xl font-extrabold text-gray-900">
              {earnedBadgesCount >= 5 ? "Net Zero Guardian" : earnedBadgesCount >= 2 ? "Forest Ranger" : "Eco Cadet"}
            </span>
            <p className="text-[10px] text-amber-600 font-medium mt-0.5">Log habits daily to level up</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sustainability Journey Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-1">
          <h3 className="text-base font-bold text-gray-900 mb-4">Your Sustainability Journey</h3>
          <div className="space-y-3">
            {journeySteps.map((step, idx) => (
              <div key={idx} className={`flex items-center gap-3 text-sm font-medium ${step.status === '✓' ? 'text-emerald-600' : step.status === '⟳' ? 'text-amber-600' : 'text-gray-400'}`}>
                <span className="w-5 text-center font-bold">{step.status}</span>
                <span>{step.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emission Trend Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-1 flex flex-col justify-center">
          <h3 className="text-base font-bold text-gray-900 mb-2">Monthly Carbon Trend</h3>
          <div className="flex items-end space-x-2 mt-4">
            <span className="text-3xl font-extrabold text-gray-900">{trend.currentWeek.toFixed(1)}</span>
            <span className="text-sm font-medium text-gray-500 mb-1">kg this week</span>
          </div>
          <div className={`mt-4 inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg w-fit ${trend.direction === 'down' ? 'bg-emerald-50 text-emerald-700' : trend.direction === 'up' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'}`}>
            {trend.direction === 'down' ? <TrendingDown className="h-4 w-4" /> : trend.direction === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4 opacity-0" />}
            {trend.percentage}% {trend.direction === 'down' ? 'Improvement' : trend.direction === 'up' ? 'Increase' : 'No Change'} vs last week
          </div>
        </div>

        {/* Personal Best */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-1 flex flex-col justify-center text-center">
          <div className="mx-auto p-4 bg-emerald-50 rounded-full text-emerald-600 w-16 h-16 flex items-center justify-center mb-4">
            <Award className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Lowest Carbon Day</h3>
          <div className="mt-2 flex flex-col gap-1 text-sm text-gray-600">
            <span className="font-semibold text-lg text-emerald-700">{lowestDay.emission === 0 && lowestDay.date === "No data" ? "--" : `${lowestDay.emission.toFixed(1)} kg CO₂e`}</span>
            <span className="flex items-center justify-center gap-1.5 mt-1 text-xs">
              <CalendarDays className="h-3.5 w-3.5" />
              {lowestDay.date !== "No data" ? new Date(lowestDay.date).toLocaleDateString() : "Log activities to see"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Badge Showroom Panel (Col 8) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-12">
          <h3 className="text-base font-bold text-gray-900">Carbon Badge Showroom</h3>
          <p className="text-xs text-gray-500 mb-6">Complete green actions across transit, energy, diet, and waste categories to unlock carbon badges.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {badgesWithStatus.map((badge) => {
              const unlocked = !!badge.earnedAt;
              const formattedUnlockDate = badge.earnedAt 
                ? new Date(badge.earnedAt + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })
                : null;

              return (
                <div
                  key={badge.badgeId}
                  className={`p-4 rounded-xl border transition flex gap-3.5 relative ${
                    unlocked 
                      ? "bg-emerald-50/40 border-emerald-250 hover:shadow-sm" 
                      : "bg-gray-50/50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="text-3xl shrink-0 select-none flex items-center justify-center bg-white h-12 w-12 rounded-xl shadow-sm border border-gray-100">
                    {badge.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className={`text-xs font-bold ${unlocked ? "text-emerald-950" : "text-gray-400"}`}>
                        {badge.title}
                      </h4>
                      {unlocked && <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed max-w-[180px]">{badge.description}</p>
                    <span className="block text-[9px] font-bold text-gray-400/80 uppercase tracking-widest pt-1">
                      {unlocked ? `Unlocked on ${formattedUnlockDate}` : `Task: ${badge.requirement}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category mastery progress (Col 12) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-12">
          <h3 className="text-base font-bold text-gray-950 mb-4">Habit Logging Level</h3>
          <p className="text-xs text-gray-500 mb-6 font-medium">Progress showing habits recorded per sector in search of the Carbon Champion crown badge.</p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {Object.entries(loggedCatCounts).map(([cat, val]) => {
              const max = 5;
              const percent = Math.min(100, (val / max) * 100);

              const colorMap = {
                transport: "bg-teal-500 text-teal-800 border-teal-100",
                electricity: "bg-amber-500 text-amber-800 border-amber-100",
                food: "bg-emerald-500 text-emerald-800 border-emerald-100",
                shopping: "bg-blue-500 text-blue-800 border-blue-100",
                waste: "bg-purple-500 text-purple-800 border-purple-100",
              };

              const currentBg = colorMap[cat as keyof typeof colorMap] || "bg-gray-500";

              return (
                <div key={cat} className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 text-center">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400 truncate capitalize">{cat}</span>
                  <span className="block text-xl font-extrabold text-gray-950 mt-1 font-mono">{val} / {max}</span>
                  
                  {/* Progress Indicator */}
                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-3 overflow-hidden">
                    <div className={`h-full ${currentBg} rounded-full`} style={{ width: `${percent}%` }}></div>
                  </div>
                  <span className="block text-[9px] text-gray-400 font-medium mt-1">
                    {val >= max ? "Mastered!" : "In Progress"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
