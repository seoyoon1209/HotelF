// "AI 맞춤형 고객 관리" 데모 페이지.
// 예약/예측/모델 정보는 전부 실제 백엔드·DB에서 가져온다. "연관 요인"과 "추천 마케팅 시나리오"도
// 실제 LLM(OpenAI) 호출로 생성한다 (백엔드 GET /reservations/{id}/ai-insight/).
// "원인 분석"이 아니라 "연관 요인"으로 표현 — 모델은 상관관계만 제공하고 인과관계를 주장하지 않는다.
import { useEffect, useMemo, useState } from "react";
import {
  FaTriangleExclamation,
  FaWandMagicSparkles,
  FaMagnifyingGlassChart,
  FaLightbulb,
} from "react-icons/fa6";
import RiskBadge from "src/components/common/RiskBadge";
import LoadingState from "src/components/common/LoadingState";
import { getReservations } from "src/api/reservationApi";
import { getModelInfo, createPrediction } from "src/api/predictionApi";
import { getOverbookingSummary } from "src/api/overbookingApi";
import { getAiInsight } from "src/api/aiInsightApi";

const PROBABILITY_COLOR = {
  LOW: "text-green-600",
  MEDIUM: "text-yellow-600",
  HIGH: "text-orange-600",
  CRITICAL: "text-red-600",
};

function computeLeadTime(checkInDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkIn = new Date(`${checkInDateStr}T00:00:00`);
  return Math.max(0, Math.round((checkIn - today) / (1000 * 60 * 60 * 24)));
}

function AiDemoPage() {
  const [reservations, setReservations] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [overbooking, setOverbooking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getReservations(), getModelInfo(), getOverbookingSummary()])
      .then(async ([resRes, modelRes, overbookingRes]) => {
        if (cancelled) return;
        const rows = resRes.data.map((r) => ({ ...r, lead_time: computeLeadTime(r.check_in_date) }));
        setModelInfo(modelRes.data);
        setOverbooking(overbookingRes.data);
        setError(null);

        // 예측이 없는 예약(risk_level == null)은 실제 모델을 돌려서 채운다.
        const missing = rows.filter((r) => r.risk_level == null);
        if (missing.length === 0) {
          setReservations(rows);
          return;
        }
        const results = await Promise.allSettled(
          missing.map((r) => createPrediction(r.reservation_id))
        );
        if (cancelled) return;
        const filledById = new Map(
          missing
            .map((r, i) => [r.reservation_id, results[i]])
            .filter(([, result]) => result.status === "fulfilled")
            .map(([id, result]) => [id, result.value.data])
        );
        setReservations(
          rows.map((r) =>
            filledById.has(r.reservation_id)
              ? {
                  ...r,
                  risk_level: filledById.get(r.reservation_id).risk_level,
                  cancellation_probability: filledById.get(r.reservation_id).cancellation_probability,
                }
              : r
          )
        );
      })
      .catch((err) => setError(err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const highRiskReservations = useMemo(
    () =>
      reservations
        .filter((r) => r.risk_level === "HIGH" || r.risk_level === "CRITICAL")
        .sort((a, b) => Number(b.cancellation_probability) - Number(a.cancellation_probability))
        .slice(0, 8),
    [reservations]
  );

  const selected = highRiskReservations[selectedIndex];

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setInsight(null);
    setInsightError(false);
    setInsightLoading(true);
    getAiInsight(selected.reservation_id)
      .then((res) => {
        if (!cancelled) setInsight(res.data);
      })
      .catch(() => {
        if (!cancelled) setInsightError(true);
      })
      .finally(() => {
        if (!cancelled) setInsightLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected?.reservation_id]);

  const stats = useMemo(() => {
    const cancelCount = highRiskReservations.length;
    const revenueAtRisk = highRiskReservations.reduce((sum, r) => sum + (Number(r.adr) || 0), 0);
    const resaleOpportunities = overbooking.reduce(
      (sum, day) => sum + (day.recommended_additional_bookings || 0),
      0
    );
    return { cancelCount, revenueAtRisk, resaleOpportunities };
  }, [highRiskReservations, overbooking]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">AI 맞춤형 고객 관리 데모</h1>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <FaTriangleExclamation className="mt-0.5 h-4 w-4 shrink-0" />
        예약·예측·모델 정보는 실제 DB에서 가져옵니다. 연관 요인과 추천 시나리오는 실제 LLM(OpenAI)이
        예약 속성을 보고 생성합니다 — 예약당 한 번만 호출해 결과를 캐싱합니다.
      </div>

      {error && (
        <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          데이터를 불러오지 못했습니다. 백엔드 서버가 켜져 있는지 확인해주세요.
        </div>
      )}

      {loading ? (
        <LoadingState className="mt-6" />
      ) : (
        !error && (
          <>
            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <AccentStatCard label="고위험 예약 건수" value={`${stats.cancelCount}건`} color="#3182f6" />
              <AccentStatCard
                label="위험 매출액(ADR 합계)"
                value={`${stats.revenueAtRisk.toLocaleString()}원`}
                color="#d03b3b"
              />
              <AccentStatCard
                label="AI 모델 예측 오차율"
                value={modelInfo?.accuracy != null ? `${Math.round((1 - modelInfo.accuracy) * 100)}%` : "데이터 부족"}
                sub={modelInfo?.accuracy != null ? `정확도 ${Math.round(modelInfo.accuracy * 100)}% 기준` : undefined}
                color="#fab219"
              />
              <AccentStatCard
                label="잠재적 재판매 가능"
                value={`${stats.resaleOpportunities}건`}
                sub="향후 30일 오버부킹 권고 합계"
                color="#0ca30c"
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
                        <th className="px-5 py-3 font-medium">조치상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {highRiskReservations.map((r, index) => (
                        <tr
                          key={r.reservation_id}
                          onClick={() => setSelectedIndex(index)}
                          className={`cursor-pointer transition ${
                            index === selectedIndex ? "bg-brand/5" : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="px-5 py-3 font-medium text-brand">{r.reservation_code}</td>
                          <td className="px-5 py-3 text-slate-600">{r.segment_name ?? "-"}</td>
                          <td className="px-5 py-3 text-slate-600">{r.channel_name ?? "-"}</td>
                          <td className="px-5 py-3 font-medium text-slate-900">
                            {Math.round(Number(r.cancellation_probability) * 100)}%
                          </td>
                          <td className="px-5 py-3">
                            <RiskBadge riskLevel={r.risk_level} />
                          </td>
                          <td className="px-5 py-3 text-slate-500">{r.has_action ? "조치완료" : "미조치"}</td>
                        </tr>
                      ))}
                      {highRiskReservations.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                            고위험 예약이 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI 전략 제안 패널 */}
              {selected && (
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
                        {Math.round(Number(selected.cancellation_probability) * 100)}%
                      </span>
                      <span className="pb-1.5 text-sm font-medium text-slate-400">취소 확률</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {selected.deposit_name ?? "보증금 정보 없음"}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center gap-2 text-slate-900">
                      <FaMagnifyingGlassChart className="h-4 w-4 text-slate-400" />
                      <h3 className="text-sm font-semibold">연관 요인 분석</h3>
                    </div>
                    {insightLoading && (
                      <p className="mt-2 text-sm text-slate-400">AI가 분석 중입니다...</p>
                    )}
                    {insightError && !insightLoading && (
                      <p className="mt-2 text-sm text-red-500">AI 분석을 불러오지 못했습니다.</p>
                    )}
                    {insight && !insightLoading && (
                      <>
                        <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                          {insight.factors.map((factor) => (
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
                          {insight.scenarios.map((scenario, i) => (
                            <div key={scenario.title} className="rounded-xl bg-blue-50 p-3">
                              <div className="text-xs font-semibold text-blue-900">
                                {i + 1}. {scenario.title}
                              </div>
                              <p className="mt-1 text-xs leading-relaxed text-blue-800">"{scenario.message}"</p>
                            </div>
                          ))}
                        </div>

                        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
                          <strong className="text-slate-700">Human-in-the-loop:</strong> 이 제안은 AI(LLM)가
                          생성했습니다. 최종 발송 전 담당 직원의 검토 및 승인이 필요합니다.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )
      )}
    </div>
  );
}

function AccentStatCard({ label, value, sub, color }) {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-5"
      style={{ borderLeftWidth: 4, borderLeftColor: color }}
    >
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

export default AiDemoPage;
