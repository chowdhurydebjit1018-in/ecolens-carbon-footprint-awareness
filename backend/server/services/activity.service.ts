import { adminDb } from "../config/firebaseAdmin";
import { EMISSION_FACTORS } from "../data/emissionFactors";
import { ValidationError } from "../utils/errors";

export interface ActivityInput {
  date: string;
  category: string;
  activityType: string;
  quantity: number;
  unit: string;
  notes?: string;
  clientRequestId: string;
}

const mockActivitiesStore: Record<string, any[]> = {};

export const createActivity = async (userId: string, input: ActivityInput) => {
  const { date, category, activityType, quantity } = input;

  let normalizedCategory = category;
  if (category === "energy") {
    normalizedCategory = "electricity";
  }

  let normalizedUnit = input.unit.toLowerCase();
  if (["serving", "servings", "meals", "meal"].includes(normalizedUnit)) {
    normalizedUnit = "meal";
  } else if (normalizedUnit === "kwh") {
    normalizedUnit = "kWh";
  }

  function normalizeActivityDate(d: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    if (/^\d{2}-\d{2}-\d{4}$/.test(d)) {
      const [day, month, year] = d.split("-");
      return `${year}-${month}-${day}`;
    }
    throw new ValidationError("Invalid date format. Expected YYYY-MM-DD.");
  }
  const normalizedDate = normalizeActivityDate(date);

  // 1. Data Integrity and Validation
  if (!EMISSION_FACTORS[normalizedCategory]) {
    throw new ValidationError(`Invalid category: ${category}`);
  }

  const factorData = EMISSION_FACTORS[normalizedCategory][activityType];
  if (!factorData) {
    throw new ValidationError(`Invalid activityType: ${activityType} for category ${category}`);
  }

  if (normalizedUnit !== factorData.unit) {
    throw new ValidationError(`Invalid unit: expected ${factorData.unit} but got ${input.unit}`);
  }

  if (quantity < 0) {
    throw new ValidationError("Quantity cannot be negative");
  }

  // 2. Server-Side Emission Calculation (Prevent Frontend Spoofing)
  const emissionKg = quantity * factorData.factor;
  const unit = factorData.unit;

  const activityData: any = {
    userId,
    date: normalizedDate,
    category: normalizedCategory,
    activityType,
    quantity,
    unit,
    emissionKg: Number(emissionKg.toFixed(2)),
    createdAt: new Date().toISOString(), // Use server timestamp
    clientRequestId: input.clientRequestId,
  };

  if (input.notes) {
    activityData.notes = input.notes.trim();
  }

  let docId = `temp_${Date.now()}`;
  try {
    if (!adminDb) {
      throw new Error("Firestore is not initialized.");
    }
    const docRef = await adminDb.collection("users").doc(userId).collection("activities").add(activityData);
    docId = docRef.id;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to write to Firestore (missing credentials?), returning mock ID:", error);
      if (!mockActivitiesStore[userId]) mockActivitiesStore[userId] = [];
      mockActivitiesStore[userId].unshift({ id: docId, ...activityData });
    } else {
      throw error;
    }
  }
  
  return {
    id: docId,
    ...activityData,
  };
};

export const getUserActivities = async (userId: string) => {
  try {
    if (!adminDb) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Firestore not initialized, returning mock activities list.");
      }
      return mockActivitiesStore[userId] || [];
    }

    const snapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("activities")
      .orderBy("date", "desc")
      .orderBy("createdAt", "desc")
      .limit(150)
      .get();

    const activities: any[] = [];
    snapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() });
    });

    return activities;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to fetch from Firestore, returning empty list:", error);
      return [];
    } else {
      throw error;
    }
  }
};

export const deleteActivity = async (userId: string, activityId: string) => {
  if (mockActivitiesStore[userId]) {
    mockActivitiesStore[userId] = mockActivitiesStore[userId].filter(a => a.id !== activityId);
  }

  try {
    if (adminDb) {
      await adminDb.collection("users").doc(userId).collection("activities").doc(activityId).delete();
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to delete from Firestore:", error);
    } else {
      throw error;
    }
  }
};
