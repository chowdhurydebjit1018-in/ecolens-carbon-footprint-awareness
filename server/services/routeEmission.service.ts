const vehicleEmissionFactors: Record<string, number> = {
  petrol: 0.17,
  diesel: 0.19,
  hybrid: 0.11,
  ev: 0.04,
  petrol_car: 0.17,
  diesel_car: 0.19,
  hybrid_car: 0.11,
  ev_car: 0.04
};

export const calculateRouteEmission = (distanceKm: number, vehicleType: string): number => {
  // These are awareness-level estimates, not certified carbon accuracy.
  const factor = vehicleEmissionFactors[vehicleType] || vehicleEmissionFactors.petrol;
  const emissionKg = distanceKm * factor;
  return Number(emissionKg.toFixed(2));
};
