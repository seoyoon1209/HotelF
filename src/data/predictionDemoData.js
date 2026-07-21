// 취소 예측 대응 시스템의 시뮬레이션/비용 계산

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

// 쿠폰 비용 vs 객실 유지 시 매출의 단순 산술 비교 (확률 불필요).
export function estimateCost(reservation, { discountPercent = 0, breakfastCoupon = false } = {}) {
  const discountCost = Math.round(reservation.adr * (discountPercent / 100)) * reservation.nights;
  const breakfastCost = breakfastCoupon ? 15000 * (reservation.adults + reservation.children) * reservation.nights : 0;
  const couponCost = discountCost + breakfastCost;
  const revenueIfKept = reservation.adr * reservation.nights;
  return { couponCost, revenueIfKept, net: revenueIfKept - couponCost };
}
