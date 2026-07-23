// 3. 예약 상세 + 시뮬레이터: 개입(할인쿠폰/조식쿠폰) 조작 → Before/After 예측 비교.
// "AI 전략 제안"(연관 요인 분석/추천 마케팅 시나리오, 실제 LLM 호출)은 원래 별도 AI 데모 페이지에
// 있었으나, 같은 예약을 두 화면에서 나눠 보여주는 게 중복이라 이 상세 페이지로 합쳤다.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlay,
  FaLightbulb,
  FaTicket,
  FaMagnifyingGlassChart,
  FaWandMagicSparkles,
} from "react-icons/fa6";
import PredictionBadge from "src/components/prediction/PredictionBadge";
import { useToast } from "src/components/prediction/ToastProvider";
import { simulateProbability, estimateCost } from "src/data/predictionDemoData";
import { usePredictionFilters } from "src/view/prediction/PredictionFilterContext";
import { createReservationAction } from "src/api/reservationActionApi";
import { createPrediction } from "src/api/predictionApi";
import { getAiInsight } from "src/api/aiInsightApi";
import { DEPOSIT_LABEL, SEGMENT_LABEL, MEAL_LABEL } from "src/data/labels";
import LoadingState from "src/components/common/LoadingState";

const COMBOS = [
  { key: "none", title: "아무것도 안함", discountPercent: 0, breakfastCoupon: false },
  { key: "discount", title: "할인만", breakfastCoupon: false },
  { key: "breakfast", title: "조식만", discountPercent: 0, breakfastCoupon: true },
  { key: "both", title: "둘 다", breakfastCoupon: true },
];

function ReservationDetail() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const { loading, getReservationByCode, markActionDone, applyPrediction } = usePredictionFilters();
  const reservation = getReservationByCode(reservationId);
  const requestedPredictionRef = useRef(null);

  const [discountPercent, setDiscountPercent] = useState(10);
  const [breakfastCoupon, setBreakfastCoupon] = useState(false);
  const [result, setResult] = useState(null);
  const [applied, setApplied] = useState(reservation?.action_status === "DONE");
  const [running, setRunning] = useState(false);
  const [applying, setApplying] = useState(false);
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState(false);

  const cost = useMemo(() => {
    if (!reservation) return null;
    return estimateCost(reservation, { discountPercent, breakfastCoupon });
  }, [reservation, discountPercent, breakfastCoupon]);

  const combos = useMemo(() => {
    if (!reservation) return [];
    return COMBOS.map((combo) => {
      const params = {
        discountPercent: combo.discountPercent ?? discountPercent,
        breakfastCoupon: combo.breakfastCoupon,
      };
      const { label } = simulateProbability(reservation, params);
      return { ...combo, resolvedDiscount: params.discountPercent, label };
    });
  }, [reservation, discountPercent]);

  // 예측이 아직 없는 예약(risk_label == null)이면 상세 진입 시 실제 모델을 호출해 채워넣는다.
  useEffect(() => {
    if (!reservation || reservation.risk_label != null) return;
    if (requestedPredictionRef.current === reservation.reservation_id) return;
    requestedPredictionRef.current = reservation.reservation_id;

    createPrediction(reservation.reservation_id)
      .then((res) => applyPrediction(reservation.reservation_id, Number(res.data.cancellation_probability)))
      .catch(() => {
        // 모델이 아직 준비되지 않은 환경(로컬 등)일 수 있음 - 배지가 "예측 없음"으로 남는다.
      });
  }, [reservation, applyPrediction]);

  // AI 전략 제안(연관 요인/추천 시나리오)은 실제 LLM 호출이라 예약당 한 번만 불러온다.
  useEffect(() => {
    if (!reservation) return;
    let cancelled = false;
    setInsight(null);
    setInsightError(false);
    setInsightLoading(true);
    getAiInsight(reservation.reservation_id)
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
  }, [reservation?.reservation_id]);

  if (loading) {
    return <LoadingState />;
  }

  if (!reservation) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
        예약을 찾을 수 없습니다.
        <div className="mt-3">
          <Link to="/prediction/reservations" className="text-sm font-medium text-brand hover:underline">
            예약 리스트로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const runSimulation = () => {
    setRunning(true);
    showToast({ title: "시뮬레이션 실행 중", tone: "info", duration: 900 });
    window.setTimeout(() => {
      setResult(simulateProbability(reservation, { discountPercent, breakfastCoupon }));
      setRunning(false);
    }, 900);
  };

  const applyAction = () => {
    if (!result) return;
    setApplying(true);
    createReservationAction(reservation.reservation_id, {
      discount_percent: discountPercent,
      breakfast_coupon: breakfastCoupon,
      probability_before: reservation.base_probability,
      probability_after: result.probability,
      label_before: reservation.risk_label,
      label_after: result.label,
    })
      .then(() => {
        markActionDone(reservation.reservation_id);
        setApplied(true);
        showToast({ title: "쿠폰 발급 완료", message: "고객에게 쿠폰이 발급되었습니다.", tone: "success" });
      })
      .catch(() => {
        showToast({ title: "쿠폰 발급 실패", message: "잠시 후 다시 시도해주세요.", tone: "neutral" });
      })
      .finally(() => setApplying(false));
  };

  const labelChanged = result && result.label !== reservation.risk_label;

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate("/prediction/reservations")}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <FaArrowLeft className="h-3 w-3" />
        예약 리스트
      </button>

      <div className="mt-3 grid gap-5 xl:grid-cols-[1.1fr_1fr]">
        {/* 예약 기본정보 + 현재 피처 + 현재 예측 */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-400">{reservation.reservation_code}</div>
                <h1 className="text-xl font-bold text-slate-900">{reservation.customer_name}</h1>
              </div>
              <PredictionBadge label={reservation.risk_label} size="lg" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <InfoField label="체크인" value={reservation.check_in_date} />
              <InfoField label="체크아웃" value={reservation.check_out_date} />
              <InfoField label="인원" value={`성인 ${reservation.adults}명${reservation.children ? ` · 아동 ${reservation.children}명` : ""}`} />
              <InfoField label="호텔/지점" value={reservation.hotel_branch} />
              <InfoField label="박수" value={`${reservation.nights}박`} />
              <InfoField label="조치상태" value={applied ? "조치완료" : "미조치"} />
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-400">예약 주요 특성</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <FeatureChip label="리드타임" value={`${reservation.lead_time}일`} />
                <FeatureChip label="1박 요금(ADR)" value={`${reservation.adr.toLocaleString()}원`} />
                <FeatureChip label="식사" value={MEAL_LABEL[reservation.meal] ?? reservation.meal} />
                <FeatureChip label="보증금" value={DEPOSIT_LABEL[reservation.deposit_type] ?? reservation.deposit_type} />
                <FeatureChip label="세그먼트" value={SEGMENT_LABEL[reservation.market_segment] ?? reservation.market_segment} />
              </div>
            </div>
          </div>

          {/* AI 전략 제안: 연관 요인 분석 + 추천 마케팅 시나리오 (실제 LLM 호출) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 text-brand">
              <FaWandMagicSparkles className="h-4 w-4" />
              <h2 className="font-semibold">AI 전략 제안</h2>
            </div>

            <div className="mt-4 flex items-center gap-2 text-slate-900">
              <FaMagnifyingGlassChart className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold">연관 요인 분석</h3>
            </div>
            {insightLoading && <p className="mt-2 text-sm text-slate-400">AI가 분석 중입니다...</p>}
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

          {/* 조합 비교 테이블 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">조합 비교</h2>
            <p className="mt-0.5 text-xs text-slate-400">최소 개입으로 라벨이 바뀌는 조합을 확인하세요.</p>
            <ul className="mt-3 divide-y divide-slate-100">
              {combos.map((combo) => (
                <li key={combo.key} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-slate-600">
                    {combo.title}
                    {combo.key !== "none" && combo.key !== "breakfast" && (
                      <span className="text-slate-400"> (할인 {combo.resolvedDiscount}%)</span>
                    )}
                  </span>
                  <PredictionBadge label={combo.label} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 개입 조작 패널 */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">개입 조작</h2>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="discount" className="font-medium text-slate-700">할인쿠폰 (ADR 할인율)</label>
                <span className="font-semibold text-brand">{discountPercent}%</span>
              </div>
              <input
                id="discount"
                type="range"
                min={0}
                max={30}
                step={5}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="mt-2 w-full accent-brand"
              />
            </div>

            <label className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <span className="text-sm font-medium text-slate-700">조식쿠폰 제공</span>
              <input
                type="checkbox"
                checked={breakfastCoupon}
                onChange={(e) => setBreakfastCoupon(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-brand focus:ring-brand"
              />
            </label>

            <button
              type="button"
              onClick={runSimulation}
              disabled={running}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              <FaPlay className="h-3.5 w-3.5" />
              시뮬레이션 실행
            </button>
          </div>

          {/* Before / After */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">Before → After 비교</h2>
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="flex-1 text-center">
                <div className="text-xs text-slate-400">조작 전</div>
                <div className="mt-2">
                  <PredictionBadge label={reservation.risk_label} size="lg" />
                </div>
                <div className="mt-1.5 text-xs text-slate-400">
                  {Math.round(reservation.base_probability * 100)}%
                </div>
              </div>
              <FaArrowLeft className="h-4 w-4 rotate-180 text-slate-300" />
              <div className="flex-1 text-center">
                <div className="text-xs text-slate-400">조작 후</div>
                <div className={`mt-2 rounded-2xl ${labelChanged ? "ring-2 ring-brand ring-offset-2" : ""}`}>
                  {result ? (
                    <PredictionBadge label={result.label} size="lg" />
                  ) : (
                    <span className="inline-flex items-center rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-400">
                      실행 대기 중
                    </span>
                  )}
                </div>
                {result && <div className="mt-1.5 text-xs text-slate-400">{Math.round(result.probability * 100)}%</div>}
              </div>
            </div>
          </div>

          {labelChanged && (
            <div className="rounded-2xl border border-brand/30 bg-brand/5 p-5">
              <div className="flex items-center gap-2 text-brand">
                <FaLightbulb className="h-4 w-4" />
                <h3 className="font-semibold">이 조치를 추천합니다</h3>
              </div>
              <p className="mt-1.5 text-sm text-slate-600">
                할인 {discountPercent}%{breakfastCoupon ? " + 조식쿠폰" : ""} 적용 시 예측 라벨이{" "}
                <b>취소 예상 → 미취소 예상</b>으로 전환됩니다.
              </p>
              <button
                type="button"
                onClick={applyAction}
                disabled={applied || applying}
                className="mt-3 flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
              >
                <FaTicket className="h-3.5 w-3.5" />
                {applied ? "적용 완료" : applying ? "발급 중..." : "실제 적용 (쿠폰 발급)"}
              </button>
            </div>
          )}

          {/* 비용 메모 */}
          {cost && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-semibold text-slate-900">비용 메모</h2>
              <p className="mt-0.5 text-xs text-slate-400">단순 산술 비교 (확률 불필요)</p>
              <div className="mt-3 space-y-2 text-sm">
                <CostRow label="쿠폰 비용" value={cost.couponCost} />
                <CostRow label="객실 유지 시 매출" value={cost.revenueIfKept} />
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-semibold">
                  <span className="text-slate-700">순 효과</span>
                  <span className={cost.net >= 0 ? "text-green-600" : "text-red-600"}>
                    {cost.net >= 0 ? "+" : ""}
                    {cost.net.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <div className="text-slate-400">{label}</div>
      <div className="mt-0.5 font-medium text-slate-900">{value}</div>
    </div>
  );
}

function FeatureChip({ label, value }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-800">{value}</span>
    </span>
  );
}

function CostRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value.toLocaleString()}원</span>
    </div>
  );
}

export default ReservationDetail;
