export interface Factor {
  label: string;
  factor: number;
  unit: string;
}

export type CategoryFactors = Record<string, Factor>;

export const EMISSION_FACTORS: Record<string, CategoryFactors> = {
  transport: {
    gasoline_car: { label: "Gasoline Car", factor: 0.18, unit: "km" },
    diesel_car: { label: "Diesel Car", factor: 0.17, unit: "km" },
    electric_vehicle: { label: "Electric Vehicle", factor: 0.05, unit: "km" },
    motorbike: { label: "Motorbike", factor: 0.12, unit: "km" },
    bus: { label: "Bus", factor: 0.08, unit: "km" },
    train: { label: "Train", factor: 0.04, unit: "km" },
    metro_subway: { label: "Metro/Subway", factor: 0.03, unit: "km" },
    bicycle_ebike: { label: "Bicycle/E-Bike", factor: 0.00, unit: "km" },
    walk_run: { label: "Walk/Run", factor: 0.00, unit: "km" },
  },
  electricity: {
    grid_electricity: { label: "Grid Electricity", factor: 0.45, unit: "kWh" },
    led_bulb: { label: "LED Bulb Usage", factor: 0.01, unit: "kWh" },
    fan_usage: { label: "Fan Usage", factor: 0.02, unit: "kWh" },
    ac_usage: { label: "AC Usage", factor: 1.5, unit: "kWh" },
    laptop_usage: { label: "Laptop Usage", factor: 0.05, unit: "kWh" },
    phone_charging: { label: "Phone Charging", factor: 0.005, unit: "kWh" },
  },
  food: {
    vegan_meal: { label: "Vegan Meal", factor: 0.6, unit: "meal" },
    vegetarian_meal: { label: "Vegetarian Meal", factor: 1.2, unit: "meal" },
    chicken_meal: { label: "Poultry/Chicken Meal", factor: 2.5, unit: "meal" },
    dairy_heavy_meal: { label: "Dairy-Heavy Meal", factor: 1.8, unit: "meal" },
    beef_meal: { label: "Beef/Lamb Meal", factor: 7.2, unit: "meal" },
    fast_food_meal: { label: "Fast Food Meal", factor: 3.5, unit: "meal" },
  },
  shopping: {
    clothing_item: { label: "Clothing Item", factor: 15.0, unit: "items" },
    electronics_item: { label: "Electronics Item", factor: 80.0, unit: "items" },
    online_order: { label: "Online Order", factor: 5.0, unit: "items" },
    reusable_product: { label: "Reusable Product", factor: 2.0, unit: "items" },
  },
  waste: {
    plastic_waste: { label: "Plastic Waste", factor: 2.0, unit: "kg" },
    food_waste: { label: "Food Waste", factor: 1.5, unit: "kg" },
    paper_waste: { label: "Paper/Cardboard Waste", factor: 0.8, unit: "kg" },
    glass_waste: { label: "Glass/Metal Waste", factor: 3.0, unit: "kg" },
    recycled_waste: { label: "Recycled Waste", factor: 0.2, unit: "kg" },
  },
};
