import { Activity, UserProfile, Recommendation, AIInsight } from "../types";

const TYPICAL_DAILY_BASELINE = 12.5; // kg CO2e per day (generalized)

export const getTopEmissionCategory = (activities: Activity[]) => {
  if (activities.length === 0) {
    return {
      category: "",
      percentage: 0,
      weeklyContribution: 0,
      totalEmission: 0,
      maxEmission: 0
    };
  }

  const categoryEmissions: Record<string, number> = {
    transport: 0,
    electricity: 0,
    food: 0,
    shopping: 0,
    waste: 0,
  };

  activities.forEach((act) => {
    if (Object.keys(categoryEmissions).includes(act.category)) {
      categoryEmissions[act.category] += act.emissionKg;
    }
  });

  let topCategory = "transport";
  let maxEmission = 0;
  let totalEmission = 0;

  for (const [category, emission] of Object.entries(categoryEmissions)) {
    totalEmission += emission;
    if (emission > maxEmission) {
      maxEmission = emission;
      topCategory = category;
    }
  }

  // If no emissions recorded in any category, maxEmission is 0.
  if (maxEmission === 0) {
    return {
      category: "",
      percentage: 0,
      weeklyContribution: 0,
      totalEmission: 0,
      maxEmission: 0
    };
  }

  const percentage = totalEmission > 0 ? (maxEmission / totalEmission) * 100 : 0;

  // Filter for weekly contribution
  const weeklyEmission = getWeeklyEmission(activities.filter(a => a.category === topCategory));

  return {
    category: topCategory,
    percentage: Math.round(percentage),
    weeklyContribution: Number(weeklyEmission.toFixed(1)),
    totalEmission: totalEmission,
    maxEmission: maxEmission
  };
};

export const getWeeklyEmission = (activities: Activity[]) => {
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  });

  return activities
    .filter((a) => past7Days.includes(a.date))
    .reduce((sum, current) => sum + current.emissionKg, 0);
};

export const getMonthlyEmission = (activities: Activity[]) => {
  const past30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  });

  return activities
    .filter((a) => past30Days.includes(a.date))
    .reduce((sum, current) => sum + current.emissionKg, 0);
};

export const getCarbonSaved = (activities: Activity[], profile: UserProfile) => {
  const daysWithRecordsCount = Math.max(new Set(activities.map((a) => a.date)).size, 1);
  const totalEmissions = activities.reduce((acc, curr) => acc + curr.emissionKg, 0);
  const avgDailyEmissions = activities.length > 0 ? (totalEmissions / daysWithRecordsCount) : 0;
  
  const savedKg = Math.max(0, (TYPICAL_DAILY_BASELINE - avgDailyEmissions) * daysWithRecordsCount);
  
  // Calculate this month's savings specifically
  const monthlyActivities = activities.filter(a => {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return new Date(a.date) >= d;
  });
  const monthlyDays = Math.max(new Set(monthlyActivities.map((a) => a.date)).size, 1);
  const monthlyEmissions = monthlyActivities.reduce((acc, curr) => acc + curr.emissionKg, 0);
  const monthlyAvg = monthlyActivities.length > 0 ? (monthlyEmissions / monthlyDays) : 0;
  const monthlySavedKg = Math.max(0, (TYPICAL_DAILY_BASELINE - monthlyAvg) * monthlyDays);

  return {
    totalSavedKg: Number(savedKg.toFixed(1)),
    monthlySavedKg: Number(monthlySavedKg.toFixed(1)),
    equivalents: {
      phoneCharges: Math.round(monthlySavedKg * 121.6), // ~121.6 charges per kg CO2
      treeDays: Math.round(monthlySavedKg * 2.1), // ~2.1 days of absorption per kg
      kmNotDriven: Math.round(monthlySavedKg * 4) // ~4 km per kg
    }
  };
};

export const getReductionOpportunity = (insight: AIInsight | null): Recommendation => {
  if (insight && insight.recommendations && insight.recommendations.length > 0) {
    return insight.recommendations[0];
  }
  return {
    title: "Replace two short car trips with walking.",
    impactKgCO2e: 1.8,
    difficulty: "easy",
    reason: "Walking short distances eliminates direct tailpipe emissions."
  };
};

export const getEcoScore = (activities: Activity[], profile: UserProfile) => {
  const totalEmissions = activities.reduce((acc, curr) => acc + curr.emissionKg, 0);
  const daysWithRecordsCount = Math.max(new Set(activities.map((a) => a.date)).size, 1);
  const avgDailyEmissions = activities.length > 0 ? (totalEmissions / daysWithRecordsCount) : 0;
  
  const userGoalDailyTarget = TYPICAL_DAILY_BASELINE * (1 - (profile.goalPercent / 100));

  let score = 100;
  if (avgDailyEmissions > 0) {
    const ratio = avgDailyEmissions / userGoalDailyTarget;
    if (ratio > 1) {
      score = Math.max(10, Math.round(100 - (ratio - 1) * 45));
    } else {
      score = Math.min(100, Math.round(100 - (ratio) * 15));
    }
  }
  return score;
};

export const getTrendDirection = (activities: Activity[]) => {
  const currentWeek = getWeeklyEmission(activities);
  
  const past8to14Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i + 7));
    return d.toISOString().split("T")[0];
  });

  const previousWeek = activities
    .filter((a) => past8to14Days.includes(a.date))
    .reduce((sum, current) => sum + current.emissionKg, 0);

  if (previousWeek === 0 && currentWeek === 0) return { direction: "neutral", percentage: 0, currentWeek, previousWeek };
  if (previousWeek === 0) return { direction: "up", percentage: 100, currentWeek, previousWeek };
  
  const percentage = Math.round(Math.abs((currentWeek - previousWeek) / previousWeek) * 100);
  const direction = currentWeek < previousWeek ? "down" : currentWeek > previousWeek ? "up" : "neutral";

  return { direction, percentage, currentWeek, previousWeek };
};

export const getDashboardMetrics = (activities: Activity[], profile: UserProfile) => {
  const weeklyEmission = getWeeklyEmission(activities);
  const monthlyEmission = getMonthlyEmission(activities);
  
  const categoryEmissions: Record<string, number> = {
    transport: 0,
    electricity: 0,
    food: 0,
    shopping: 0,
    waste: 0,
  };
  let totalEmissions = 0;
  
  activities.forEach((act) => {
    totalEmissions += act.emissionKg;
    if (Object.keys(categoryEmissions).includes(act.category)) {
      categoryEmissions[act.category] += act.emissionKg;
    }
  });

  const daysWithRecordsCount = Math.max(new Set(activities.map((a) => a.date)).size, 1);
  const avgDailyEmissions = activities.length > 0 ? (totalEmissions / daysWithRecordsCount) : 0;
  
  const topCategoryData = getTopEmissionCategory(activities);
  const carbonSavedStats = getCarbonSaved(activities, profile);
  const ecoScore = getEcoScore(activities, profile);
  const trend = getTrendDirection(activities);
  const activityCount = activities.length;

  return {
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
  };
};
