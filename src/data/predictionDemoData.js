// 취소 예측 대응 시스템 데모용 정적(하드코딩) 데이터.
// 실제 백엔드 예측 API를 호출하지 않고, 기획서에 정의된 화면 흐름(대시보드 → 예약 리스트 →
// 상세+시뮬레이터 → 리포트)을 보여주기 위한 더미 데이터 + 단순 산술 시뮬레이션 로직만 포함한다.

// 데모 기준일 (오늘). 리드타임/기간 필터 계산의 기준점.
export const DEMO_TODAY = new Date("2026-07-20");

export const HOTEL_BRANCHES = ["서울 강남점", "부산 해운대점", "제주 성산점"];
export const MARKET_SEGMENTS = ["OTA", "Direct", "Corporate", "Groups"];
export const DEPOSIT_TYPES = ["No Deposit", "Non Refund", "Refundable"];

const LAST_NAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임"];
const FIRST_NAMES = [
  "민준", "서연", "지훈", "하은", "도윤", "서윤", "예준", "지우", "시우", "채원",
  "주원", "다은", "우진", "수아", "건우", "예린", "선우", "나윤", "현우", "소윤",
];

// 재현 가능한 결과를 위한 간단한 시드 난수 생성기 (Mulberry32).
function mulberry32(seed) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260720);
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const randInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min;

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateStr(date) {
  return date.toISOString().slice(0, 10);
}

// 예약 특성만으로 취소 확률(0~1)을 계산하는 단순 가중치 모델. 실제 ML 모델이 아니라
// 데모에서 "그럴듯한" 값을 재현하기 위한 규칙 기반 근사치.
function computeBaseProbability({ depositType, marketSegment, meal, leadTime }) {
  let p = 0.22;
  if (depositType === "No Deposit") p += 0.24;
  else if (depositType === "Refundable") p += 0.08;
  else if (depositType === "Non Refund") p -= 0.14;

  if (marketSegment === "Groups") p += 0.16;
  else if (marketSegment === "OTA") p += 0.09;
  else if (marketSegment === "Corporate") p -= 0.1;
  else if (marketSegment === "Direct") p -= 0.06;

  if (meal === "SC") p += 0.06;

  if (leadTime <= 2) p -= 0.1;
  else if (leadTime >= 21) p += 0.08;

  p += (rng() - 0.5) * 0.12;

  return Math.min(0.96, Math.max(0.03, p));
}

function buildReservations(count) {
  const list = [];
  for (let i = 0; i < count; i += 1) {
    const leadTime = randInt(0, 30);
    const checkIn = addDays(DEMO_TODAY, leadTime);
    const nights = randInt(1, 4);
    const checkOut = addDays(checkIn, nights);
    const marketSegment = pick(MARKET_SEGMENTS);
    const depositType = pick(DEPOSIT_TYPES);
    const meal = rng() < 0.55 ? "SC" : "BB";
    const adr = randInt(9, 35) * 10000;
    const baseProbability = computeBaseProbability({ depositType, marketSegment, meal, leadTime });
    const riskLabel = baseProbability >= 0.5 ? "CANCEL" : "KEEP";

    // 액션이 필요한(취소예상) 예약 중 일부만 이미 조치완료 처리
    let actionStatus = "NONE";
    if (riskLabel === "CANCEL") {
      actionStatus = rng() < 0.35 ? "DONE" : "NONE";
    }

    list.push({
      reservation_id: i + 1,
      reservation_code: `RSV-2026-${String(10234 + i * 7).slice(0, 5)}`,
      customer_name: `${pick(LAST_NAMES)}${pick(FIRST_NAMES)}`,
      hotel_branch: pick(HOTEL_BRANCHES),
      check_in_date: toDateStr(checkIn),
      check_out_date: toDateStr(checkOut),
      lead_time: leadTime,
      nights,
      adults: randInt(1, 2),
      children: rng() < 0.2 ? randInt(1, 2) : 0,
      adr,
      meal,
      deposit_type: depositType,
      market_segment: marketSegment,
      base_probability: Number(baseProbability.toFixed(3)),
      risk_label: riskLabel,
      action_status: actionStatus,
    });
  }
  // 체크인 임박순 기본 정렬
  return list.sort((a, b) => a.lead_time - b.lead_time);
}

export const RESERVATIONS = buildReservations(42);

export function getReservationByCode(code) {
  return RESERVATIONS.find((r) => r.reservation_code === code);
}

// --- 시뮬레이터 ---
// 할인쿠폰(adr 할인율 %)과 조식쿠폰 토글을 적용했을 때의 취소 확률을 재계산한다.
// 확률 기반 ML 추론이 아니라, 두 개입 수단이 취소 확률을 얼마나 낮추는지에 대한
// 단순 산술 근사치(할인 1%p당 -0.55%p, 조식쿠폰 -12%p)로 계산한다.
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

export const MODEL_INFO = {
  version: "cancel-predict-v2.3.1",
  updatedAt: "2026-07-15 09:00",
  accuracy: 0.81,
};

// 리포트용 기간별 조치 이력 (더미).
export const ACTION_HISTORY = [
  { period: "2026-07-14 ~ 2026-07-20", actionsTaken: 58, labelFlipped: 21 },
  { period: "2026-07-07 ~ 2026-07-13", actionsTaken: 64, labelFlipped: 27 },
  { period: "2026-06-30 ~ 2026-07-06", actionsTaken: 49, labelFlipped: 16 },
  { period: "2026-06-23 ~ 2026-06-29", actionsTaken: 71, labelFlipped: 30 },
];
