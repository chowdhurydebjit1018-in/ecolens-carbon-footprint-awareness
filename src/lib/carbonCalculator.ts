import { EMISSION_FACTORS } from "./emissionFactors";

/**
 * Calculates raw emission in kg CO2e.
 * Throws clean, testable errors for negative values.
 */
export function calculateEmission(quantity: number, factor: number): number {
  if (quantity < 0 || factor < 0) {
    throw new Error("Quantity and factor must be positive");
  }

  return Number((quantity * factor).toFixed(2));
}

/**
 * Validates whether an activity's category and type exist, and that quantity is positive.
 */
export function validateActivityInput(
  category: string,
  activityType: string,
  quantity: number
): { isValid: boolean; error?: string } {
  if (!quantity || quantity <= 0) {
    return { isValid: false, error: "Quantity must be greater than 0" };
  }

  const categoryData = EMISSION_FACTORS[category];
  if (!categoryData) {
    return { isValid: false, error: "Invalid emission category" };
  }

  const factorData = categoryData[activityType];
  if (!factorData) {
    return { isValid: false, error: "Invalid activity type" };
  }

  return { isValid: true };
}

/**
 * Look up the emission factor for a specific category and type.
 */
export function getEmissionFactor(category: string, activityType: string): number {
  const categoryData = EMISSION_FACTORS[category];
  if (!categoryData) return 0;
  
  const factorData = categoryData[activityType];
  if (!factorData) return 0;

  return factorData.factor;
}

/**
 * Look up the unit for a specific category and type.
 */
export function getEmissionUnit(category: string, activityType: string): string {
  const categoryData = EMISSION_FACTORS[category];
  if (!categoryData) return "";
  
  const factorData = categoryData[activityType];
  if (!factorData) return "";

  return factorData.unit;
}
