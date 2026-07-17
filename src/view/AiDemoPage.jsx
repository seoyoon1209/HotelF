// "AI 맞춤형 고객 관리" 데모 페이지. 실제 LLM API를 호출하지 않는 정적 예시 화면이다.
// 기획서의 "예측값 → LLM → 마케팅/고객관리 전략 추천" 레이어를 데모로 보여주기 위한 용도.
// 실제 LLM 연동은 2단계 이후 범위라 여기서는 하드코딩된 예시 데이터만 쓴다.
// 개인정보 최소화 원칙에 따라 실명 대신 예약번호/세그먼트 등 비식별 정보만 사용.
// "원인 분석"이 아니라 "연관 요인"으로 표현 — 모델은 상관관계만 제공하고 인과관계를 주장하지 않는다.
import { useState } from "react";
import {
  FaTriangleExclamation,
  FaWandMagicSparkles,
  FaMagnifyingGlassChart,
  FaLightbulb,
  FaArrowTrendUp,
} from "react-icons/fa6";
import RiskBadge from "src/components/common/RiskBadge";
import RiskDistributionBar from "src/components/common/RiskDistributionBar";

const SAMPLE_RESERVATIONS = [
  {
    reservation_code: "RSV-2026-01023",
    customer_segment: "Business (Travel Agency)",
    distribution_channel: "Expedia",
    market_segment: "OTA",
    policy_tag: "Free cancellation until 24h before",
    check_in_date: "2026-07-25",
    cancellation_probability: 0.85,
    risk_level: "HIGH",
    strategy_status: "Draft generated",
    factors: [
      "Free-cancellation deadline approaching (midnight tomorrow)",
      "OTA segment cancellation rate 3.5x average",
      "4 similar-pattern cancellations in the past week",
    ],
    scenarios: [
      { title: "Free room upgrade push", message: "A special upgrade is ready for you. Applied instantly upon confirmation!" },
      { title: "10% F&B credit conversion", message: "Switch to a non-refundable rate and get a $50 in-hotel restaurant credit" },
    ],
  },
  {
    reservation_code: "RSV-2026-00842",
    customer_segment: "Leisure (Family)",
    distribution_channel: "Direct",
    market_segment: "Direct booking",
    policy_tag: "Deposit unpaid",
    check_in_date: "2026-07-19",
    cancellation_probability: 0.62,
    risk_level: "MEDIUM",
    strategy_status: "Needs review",
    factors: [
      "Deposit remains unpaid",
      "Direct-booking channel has higher-than-average response rate",
      "6 days until check-in — still time to act",
    ],
    scenarios: [
      { title: "Deposit payment reminder", message: "Please complete your deposit payment to confirm the reservation. A welcome drink is included." },
      { title: "Date-change option notice", message: "If you need to reschedule, we can help with no fee." },
    ],
  },
  {
    reservation_code: "RSV-2026-01180",
    customer_segment: "Corporate",
    distribution_channel: "GDS",
    market_segment: "OTA",
    policy_tag: "Repeat cancellation history",
    check_in_date: "2026-07-21",
    cancellation_probability: 0.91,
    risk_level: "CRITICAL",
    strategy_status: "Sent",
    factors: [
      "Repeat cancellation history in the same segment",
      "Date is imminent — little room to resell if vacated",
      "GDS channel cancellation rate above overall average",
    ],
    scenarios: [
      { title: "Priority confirmation call", message: "Prioritize a confirmation call today" },
      { title: "Suggest date change first", message: "Offer a date-change option before any heavy discount" },
    ],
  },
  {
    reservation_code: "RSV-2026-00915",
    customer_segment: "Leisure (Individual)",
    distribution_channel: "Hotel website",
    market_segment: "Direct booking",
    policy_tag: "Deposit paid in full",
    check_in_date: "2026-07-18",
    cancellation_probability: 0.12,
    risk_level: "LOW",
    strategy_status: "No action needed",
    factors: ["Deposit fully paid", "Direct booking + low-cancellation segment"],
    scenarios: [{ title: "Return-visit message", message: "If there's bandwidth, consider a simple thank-you message to encourage a return visit" }],
  },
];

const MODEL_ACCURACY = 0.78; // 기획서 기준 모델 정확도

function AiDemoPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = SAMPLE_RESERVATIONS[selectedIndex];

  const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0, none: 0 };
  SAMPLE_RESERVATIONS.forEach((r) => {
    counts[r.risk_level] += 1;
  });
  const otaShare = Math.round(
    (SAMPLE_RESERVATIONS.filter((r) => r.market_segment === "OTA").length /
      SAMPLE_RESERVATIONS.length) *
      100
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">AI Customer Management Demo</h1>
      </div>

      {/* 데모 안내 배너 */}
      <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <FaTriangleExclamation className="mt-0.5 h-4 w-4 shrink-0" />
        Static example demo: this is a UI/UX mockup, not a real LLM integration. All data is
        simulated.
      </div>

      {/* 상단 지표 카드 (예시 값) */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AccentStatCard label="Expected cancellations" value="36" sub="+8% vs last week" color="#3182f6" />
        <AccentStatCard label="Revenue at risk" value="$9,800" sub="Avg $245/room" color="#d03b3b" />
        <AccentStatCard
          label="AI model error rate"
          value={`${Math.round((1 - MODEL_ACCURACY) * 100)}%`}
          sub={`Based on ${MODEL_ACCURACY * 100}% accuracy`}
          color="#fab219"
        />
        <AccentStatCard
          label="Potential resale opportunities"
          value="14"
          sub="Trending up"
          color="#0ca30c"
          trendUp
        />
      </div>

      {/* 위험도 분포 + 보조 지표 */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Cancellation Risk Distribution</h2>
        <div className="mt-4">
          <RiskDistributionBar counts={counts} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <MetricBar label="OTA booking share" value={`${otaShare}%`} percent={otaShare} />
          <MetricBar label="Avg. lead time" value="14 days" percent={45} />
          <MetricBar label="Cancellation policy flexibility" value="High" percent={80} />
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_22rem]">
        {/* 고위험 예약 테이블 */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-semibold text-slate-900">High-Risk Reservations & AI Recommended Actions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="px-5 py-3 font-medium">Reservation ID</th>
                  <th className="px-5 py-3 font-medium">Customer Segment</th>
                  <th className="px-5 py-3 font-medium">Channel</th>
                  <th className="px-5 py-3 font-medium">Cancel Probability</th>
                  <th className="px-5 py-3 font-medium">Risk</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SAMPLE_RESERVATIONS.map((r, index) => (
                  <tr
                    key={r.reservation_code}
                    onClick={() => setSelectedIndex(index)}
                    className={`cursor-pointer transition ${
                      index === selectedIndex ? "bg-brand/5" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-5 py-3 font-medium text-brand">{r.reservation_code}</td>
                    <td className="px-5 py-3 text-slate-600">{r.customer_segment}</td>
                    <td className="px-5 py-3 text-slate-600">{r.distribution_channel}</td>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {Math.round(r.cancellation_probability * 100)}%
                    </td>
                    <td className="px-5 py-3">
                      <RiskBadge riskLevel={r.risk_level} />
                    </td>
                    <td className="px-5 py-3 text-slate-500">{r.strategy_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI 전략 제안 패널 */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-brand">
              <FaWandMagicSparkles className="h-4 w-4" />
              <h2 className="font-semibold">AI Strategy Suggestion</h2>
            </div>

            <div className="mt-4 text-xs text-slate-400">Reservation info</div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">{selected.reservation_code}</span>
              <RiskBadge riskLevel={selected.risk_level} />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                {Math.round(selected.cancellation_probability * 100)}% cancel probability
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {selected.policy_tag}
              </span>
            </div>

            <div className="mt-5 flex items-center gap-2 text-slate-900">
              <FaMagnifyingGlassChart className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold">Correlated Factors</h3>
            </div>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              {selected.factors.map((factor) => (
                <li key={factor}>· {factor}</li>
              ))}
            </ul>
            <p className="mt-1.5 text-xs text-slate-400">
              ※ These are correlations only, not confirmed causes of cancellation.
            </p>

            <div className="mt-5 flex items-center gap-2 text-slate-900">
              <FaLightbulb className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold">Recommended Marketing Scenarios</h3>
            </div>
            <div className="mt-2 space-y-2">
              {selected.scenarios.map((scenario, i) => (
                <div key={scenario.title} className="rounded-xl bg-blue-50 p-3">
                  <div className="text-xs font-semibold text-blue-900">
                    {i + 1}. {scenario.title}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-blue-800">"{scenario.message}"</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function AccentStatCard({ label, value, sub, color, trendUp = false }) {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-5"
      style={{ borderLeftWidth: 4, borderLeftColor: color }}
    >
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-2xl font-semibold text-slate-900">{value}</span>
        {trendUp && <FaArrowTrendUp className="h-3.5 w-3.5 text-green-600" />}
      </div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

function MetricBar({ label, value, percent }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="font-medium text-slate-900">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default AiDemoPage;
