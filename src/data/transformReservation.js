// Transforms the backend GET /api/reservations/ response into the shape the cancellation prediction demo screens expect
function computeLeadTime(checkInDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkIn = new Date(`${checkInDateStr}T00:00:00`);
  const diffDays = Math.round((checkIn - today) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

function computeNights(checkInDateStr, checkOutDateStr) {
  const checkIn = new Date(`${checkInDateStr}T00:00:00`);
  const checkOut = new Date(`${checkOutDateStr}T00:00:00`);
  const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  return Math.max(1, nights);
}

export function transformReservation(r) {
  const probability = r.cancellation_probability != null ? Number(r.cancellation_probability) : null;

  return {
    reservation_id: r.reservation_id,
    reservation_code: r.reservation_code,
    customer_name: r.customer_name ?? "(No customer info)",
    hotel_branch: r.hotel_name,
    check_in_date: r.check_in_date,
    check_out_date: r.check_out_date,
    lead_time: computeLeadTime(r.check_in_date),
    nights: computeNights(r.check_in_date, r.check_out_date),
    adults: r.adult_count,
    children: (r.child_count ?? 0) + (r.baby_count ?? 0),
    adr: r.adr != null ? Number(r.adr) : 0,
    meal: r.meal_code ?? "SC",
    deposit_type: r.deposit_name ?? "No Deposit",
    market_segment: r.segment_name ?? "Direct",
    base_probability: probability ?? 0,
    risk_label: probability == null ? null : probability >= 0.5 ? "CANCEL" : "KEEP",
    action_status: r.has_action ? "DONE" : "NONE",
  };
}
