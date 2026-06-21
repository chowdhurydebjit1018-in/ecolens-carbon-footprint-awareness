import { Activity, Badge } from "../types";

export const INITIAL_BADGES: Badge[] = [
  {
    badgeId: "first_footprint",
    title: "First Footprint",
    description: "Logged your first carbon footprint category activity.",
    icon: "👣",
    requirement: "Log any activity",
  },
  {
    badgeId: "eco_commuter",
    title: "Eco Commuter",
    description: "Opted for walking, cycling, bus, train, or metro transit 3+ times.",
    icon: "🚶",
    requirement: "Log 3+ green transport items",
  },
  {
    badgeId: "green_diet",
    title: "Green Diet",
    description: "Incorporate eco-friendly food habits such as vegan or vegetarian meals.",
    icon: "🥗",
    requirement: "Log 3+ meat-free meals",
  },
  {
    badgeId: "power_saver",
    title: "Power Saver",
    description: "Logged energy savings or used clean solar power logs.",
    icon: "⚡",
    requirement: "Log solar or low grid electricity",
  },
  {
    badgeId: "waste_warrior",
    title: "Waste Warrior",
    description: "Mindful disposal of paper, plastic, food waste, or glass.",
    icon: "♻️",
    requirement: "Log 3+ conscious waste items",
  },
  {
    badgeId: "carbon_champion",
    title: "Carbon Champion",
    description: "Logged activities in all 5 categories: Transport, Energy, Food, Retail, Waste.",
    icon: "👑",
    requirement: "Log in all 5 categories",
  },
];

/**
 * Reviews a list of user activities and triggers corresponding unlocked badges.
 */
export function checkUnlockedBadges(activities: Activity[]): Badge[] {
  if (activities.length === 0) return INITIAL_BADGES;

  return INITIAL_BADGES.map((badge) => {
    let earnedAt: string | undefined = undefined;

    switch (badge.badgeId) {
      case "first_footprint":
        if (activities.length > 0) {
          earnedAt = activities[activities.length - 1].date;
        }
        break;

      case "eco_commuter":
        const transportLogs = activities.filter(
          (a) =>
            a.category === "transport" &&
            ["walk_run", "bicycle_ebike", "train", "metro_subway", "bus"].includes(a.activityType)
        );
        if (transportLogs.length >= 3) {
          earnedAt = transportLogs[2].date;
        }
        break;

      case "green_diet":
        const cleanFoodLogs = activities.filter(
          (a) => a.category === "food" && ["vegan_meal", "vegetarian_meal"].includes(a.activityType)
        );
        if (cleanFoodLogs.length >= 3) {
          earnedAt = cleanFoodLogs[2].date;
        }
        break;

      case "power_saver":
        const solarLogs = activities.filter((a) => a.category === "electricity");
        const hasSolarOrLowGrid = solarLogs.some(
          (a) => a.activityType === "led_bulb" || (a.activityType === "grid_electricity" && a.quantity < 10)
        );
        if (hasSolarOrLowGrid) {
          earnedAt = solarLogs[0].date;
        }
        break;

      case "waste_warrior":
        const wasteCount = activities.filter((a) => a.category === "waste").length;
        if (wasteCount >= 3) {
          earnedAt = activities.filter((a) => a.category === "waste")[2].date;
        }
        break;

      case "carbon_champion":
        const categories = new Set(activities.map((a) => a.category));
        if (categories.size === 5) {
          // Earned when the 5th unique category was registered
          earnedAt = activities[activities.length - 1].date;
        }
        break;
    }

    return {
      ...badge,
      earnedAt,
    };
  });
}
