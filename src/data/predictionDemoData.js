// Simulation/cost calculations for the cancellation prediction response system

export function simulateProbability(reservation, { discountPercent = 0, breakfastCoupon = false } = {}) {
  let p = reservation.base_probability;
  p -= (discountPercent / 100) * 0.55;
  if (breakfastCoupon && reservation.meal === "SC") {
    p -= 0.12;
  }
  p = Math.min(0.97, Math.max(0.02, p));
  const label = p >= 0.5 ? "CANCEL" : "KEEP";
  return { probability: Number(p.toFixed(3)), label };
}

// Simple arithmetic comparison of coupon cost vs. revenue if the room is kept (no probability needed).
export function estimateCost(reservation, { discountPercent = 0, breakfastCoupon = false } = {}) {
  const discountCost = Math.round(reservation.adr * (discountPercent / 100)) * reservation.nights;
  const breakfastCost = breakfastCoupon ? 15000 * (reservation.adults + reservation.children) * reservation.nights : 0;
  const couponCost = discountCost + breakfastCost;
  const revenueIfKept = reservation.adr * reservation.nights;
  return { couponCost, revenueIfKept, net: revenueIfKept - couponCost };
}
