export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  city: string;
  lifestyleType: "student" | "professional" | "hostel" | "home";
  primaryTransport: "walk" | "cycle" | "bike" | "car" | "bus" | "train" | "metro";
  goalPercent: number;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  category: "transport" | "electricity" | "food" | "shopping" | "waste";
  activityType: string;
  quantity: number;
  unit: string;
  emissionKg: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export interface Badge {
  badgeId: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name or emoji name
  earnedAt?: string; // If undefined, the badge is locked
  requirement?: string;
}

export interface Recommendation {
  title: string;
  impactKgCO2e: number;
  difficulty: "easy" | "medium" | "hard";
  reason: string;
}

export interface AIInsight {
  summary: string;
  topCause: string;
  recommendations: Recommendation[];
}

export interface RouteOption {
  name: string;
  durationMin: number;
  distanceMi: number;
  emissionKg: number;
  routeType: "fastest" | "eco";
  description: string;
}

export interface RouteComparison {
  fastest: RouteOption;
  eco: RouteOption;
  co2SavedKg: number;
  co2SavedPercent: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  recommendations?: Recommendation[];
}
