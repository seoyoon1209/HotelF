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

const SAMPLE_RESERVATIONS = [
  {
    reservation_code: "RSV-2026-01023",
    customer_segment: "비즈니스 (여행사)",
    distribution_channel: "Expedia",
    market_segment: "OTA",
    policy_tag: "무료 취소 24시간 전",
    check_in_date: "2026-07-25",
    cancellation_probability: 0.85,
    risk_level: "HIGH",
    strategy_status: "초안 생성",
    factors: [
      "무료 취소 기한 임박 (익일 자정)",
      "OTA 유입 고객군 평균 취소율 3.5배 상회",
      "최근 1주일 내 동일 패턴 취소 4건 발생",
    ],
    scenarios: [
      { title: "무료 룸 업그레이드 푸시", message: "특별한 고객님을 위한 업그레이드 혜택이 준비되었습니다. 확정 시 즉시 적용!" },
      { title: "F&B 10% 크레딧 전환", message: "비환불형 예약으로 전환 시 호텔 내 레스토랑 $50 크레딧 제공" },
    ],
  },
  {
    reservation_code: "RSV-2026-00842",
    customer_segment: "레저 (가족)",
    distribution_channel: "Direct",
    market_segment: "직접예약",
    policy_tag: "보증금 미납",
    check_in_date: "2026-07-19",
    cancellation_probability: 0.62,
    risk_level: "MEDIUM",
    strategy_status: "검토 필요",
    factors: [
      "보증금 미납 상태 지속",
      "직접예약 채널은 평균 대비 응답률 높음",
      "체크인까지 6일 남음 — 아직 조치 여유 있음",
    ],
    scenarios: [
      { title: "보증금 결제 리마인드", message: "예약 확정을 위해 보증금 결제를 완료해주세요. 결제 시 웰컴 드링크 제공" },
      { title: "일정 변경 옵션 안내", message: "일정 변경이 필요하시면 수수료 없이 도와드립니다." },
    ],
  },
  {
    reservation_code: "RSV-2026-01180",
    customer_segment: "기업체",
    distribution_channel: "GDS",
    market_segment: "OTA",
    policy_tag: "반복 취소 이력",
    check_in_date: "2026-07-21",
    cancellation_probability: 0.91,
    risk_level: "CRITICAL",
    strategy_status: "발송 완료",
    factors: [
      "동일 세그먼트에서 반복 취소 이력 확인",
      "임박한 날짜 — 공실 발생 시 재판매 여유 적음",
      "GDS 채널 취소율이 전체 평균보다 높음",
    ],
    scenarios: [
      { title: "우선 재확인 연락", message: "오늘 중 우선순위로 재확인 연락 진행" },
      { title: "일정 변경 우선 제안", message: "무리한 할인보다 날짜 이동 옵션을 먼저 안내" },
    ],
  },
  {
    reservation_code: "RSV-2026-00915",
    customer_segment: "레저 (개인)",
    distribution_channel: "호텔 홈페이지",
    market_segment: "직접예약",
    policy_tag: "보증금 완납",
    check_in_date: "2026-07-18",
    cancellation_probability: 0.12,
    risk_level: "LOW",
    strategy_status: "조치 불필요",
    factors: ["보증금 완납 완료", "직접예약 + 낮은 취소 이력 세그먼트"],
    scenarios: [{ title: "재방문 유도 메시지", message: "여력이 되면 재방문 유도용 감사 메시지 정도만 고려" }],
  },
];

const MODEL_ACCURACY = 0.78; // 기획서 기준 모델 정확도

const PROBABILITY_COLOR = {
  LOW: "text-green-600",
  MEDIUM: "text-yellow-600",
  HIGH: "text-orange-600",
  CRITICAL: "text-red-600",
};

function AiDemoPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = SAMPLE_RESERVATIONS[selectedIndex];

  const select = (index) => {
    setSelectedIndex(index);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">AI 맞춤형 고객 관리 데모</h1>
      </div>

      {/* 데모 안내 배너 */}
      <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <FaTriangleExclamation className="mt-0.5 h-4 w-4 shrink-0" />
        정적 예시 데모: 실제 LLM 연동이 아닌 UI/UX 목업 화면입니다. 모든 데이터는 시뮬레이션된
        값입니다.
      </div>

      {/* 상단 지표 카드 (예시 값) */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AccentStatCard label="예상 취소 건수" value="36건" sub="+8% 전주 대비" color="#3182f6" />
        <AccentStatCard label="위험 매출액" value="$9,800" sub="평균 $245/실" color="#d03b3b" />
        <AccentStatCard
          label="AI 모델 예측 오차율"
          value={`${Math.round((1 - MODEL_ACCURACY) * 100)}%`}
          sub={`정확도 ${MODEL_ACCURACY * 100}% 기준`}
          color="#fab219"
        />
        <AccentStatCard
          label="잠재적 재판매 가능"
          value="14건"
          sub="상승 추세"
          color="#0ca30c"
          trendUp
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_22rem]">
        {/* 고위험 예약 테이블 */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-semibold text-slate-900">고위험 예약 및 AI 권장 조치</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="px-5 py-3 font-medium">예약 ID</th>
                  <th className="px-5 py-3 font-medium">고객 세그먼트</th>
                  <th className="px-5 py-3 font-medium">유입 채널</th>
                  <th className="px-5 py-3 font-medium">취소 확률</th>
                  <th className="px-5 py-3 font-medium">위험도</th>
                  <th className="px-5 py-3 font-medium">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SAMPLE_RESERVATIONS.map((r, index) => (
                  <tr
                    key={r.reservation_code}
                    onClick={() => select(index)}
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
              <h2 className="font-semibold">AI 전략 제안</h2>
            </div>

            <div className="mt-4 text-xs text-slate-400">예약 정보</div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">{selected.reservation_code}</span>
              <RiskBadge riskLevel={selected.risk_level} />
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span
                className={`text-5xl font-bold leading-none ${
                  PROBABILITY_COLOR[selected.risk_level] ?? "text-slate-900"
                }`}
              >
                {Math.round(selected.cancellation_probability * 100)}%
              </span>
              <span className="pb-1.5 text-sm font-medium text-slate-400">취소 확률</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {selected.policy_tag}
              </span>
            </div>

            <div className="mt-5 flex items-center gap-2 text-slate-900">
              <FaMagnifyingGlassChart className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold">연관 요인 분석</h3>
            </div>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              {selected.factors.map((factor) => (
                <li key={factor}>· {factor}</li>
              ))}
            </ul>
            <p className="mt-1.5 text-xs text-slate-400">
              ※ 아래는 상관관계일 뿐 확정된 취소 원인이 아닙니다.
            </p>

            <div className="mt-5 flex items-center gap-2 text-slate-900">
              <FaLightbulb className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold">추천 마케팅 시나리오</h3>
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

            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
              <strong className="text-slate-700">Human-in-the-loop:</strong> 이 제안은 과거 데이터
              패턴을 기반으로 생성되었습니다. 최종 발송 전 담당 직원의 검토 및 승인이 필요합니다.
            </p>

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

export default AiDemoPage;
