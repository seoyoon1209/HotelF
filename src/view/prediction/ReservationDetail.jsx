//Reservation detail + simulator

const COMBOS = [
  { key: "none", title: "Do Nothing", discountPercent: 0, breakfastCoupon: false },
  { key: "discount", title: "Discount Only", breakfastCoupon: false },
  { key: "breakfast", title: "Breakfast Only", discountPercent: 0, breakfastCoupon: true },
  { key: "both", title: "Both", breakfastCoupon: true },
];

function ReservationDetail() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const { loading, getReservationByCode, markActionDone, markActionNotDone, applyPrediction } = usePredictionFilters();
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

  // If the reservation has no prediction yet (risk_label == null), call the real model on detail-page entry to fill it in.
  useEffect(() => {
    if (!reservation || reservation.risk_label != null) return;
    if (requestedPredictionRef.current === reservation.reservation_id) return;
    requestedPredictionRef.current = reservation.reservation_id;

    createPrediction(reservation.reservation_id)
      .then((res) => applyPrediction(reservation.reservation_id, Number(res.data.cancellation_probability)))
      .catch(() => {
        // The model may not be available in this environment (e.g. local dev) - the badge stays "No Prediction".
      });
  }, [reservation, applyPrediction]);

  // AI strategy suggestions (related factors / recommended scenarios) are a real LLM call, so fetch once per reservation.
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
        Reservation not found.
        <div className="mt-3">
          <Link to="/prediction/reservations" className="text-sm font-medium text-brand hover:underline">
            Back to Reservation List
          </Link>
        </div>
      </div>
    );
  }

  const runSimulation = () => {
    setRunning(true);
    showToast({ title: "Running simulation", tone: "info", duration: 900 });
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
        showToast({ title: "Coupon issued", message: "The coupon has been issued to the guest.", tone: "success" });
      })
      .catch(() => {
        showToast({ title: "Failed to issue coupon", message: "Please try again shortly.", tone: "neutral" });
      })
      .finally(() => setApplying(false));
  };

  const undoAction = () => {
    setApplying(true);
    deleteReservationActions(reservation.reservation_id)
      .then(() => {
        markActionNotDone(reservation.reservation_id);
        setApplied(false);
        showToast({ title: "Marked as not taken", message: "The recorded action has been removed from the report.", tone: "neutral" });
      })
      .catch(() => {
        showToast({ title: "Failed to revert", message: "Please try again shortly.", tone: "neutral" });
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
        Reservation List
      </button>

      <div className="mt-3 grid gap-5 xl:grid-cols-[1.1fr_1fr]">
        {/* Basic reservation info + current features + current prediction */}
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
              <InfoField label="Check-in" value={reservation.check_in_date} />
              <InfoField label="Check-out" value={reservation.check_out_date} />
              <InfoField label="Guests" value={`${reservation.adults} adults${reservation.children ? ` · ${reservation.children} children` : ""}`} />
              <InfoField label="Hotel/Branch" value={reservation.hotel_branch} />
              <InfoField label="Nights" value={`${reservation.nights} nights`} />
              <InfoField label="Action Status" value={applied ? "Action Taken" : "No Action"} />
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Key Reservation Features</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <FeatureChip label="Lead Time" value={`${reservation.lead_time} days`} />
                <FeatureChip label="Nightly Rate (ADR)" value={formatUSD(reservation.adr)} />
                <FeatureChip label="Meal Plan" value={MEAL_LABEL[reservation.meal] ?? reservation.meal} />
                <FeatureChip label="Deposit" value={DEPOSIT_LABEL[reservation.deposit_type] ?? reservation.deposit_type} />
                <FeatureChip label="Segment" value={SEGMENT_LABEL[reservation.market_segment] ?? reservation.market_segment} />
              </div>
            </div>
          </div>

          {/* AI Strategy Suggestions: related-factor analysis + recommended marketing scenarios (real LLM call) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 text-brand">
              <FaWandMagicSparkles className="h-4 w-4" />
              <h2 className="font-semibold">AI Strategy Suggestions</h2>
            </div>

            <div className="mt-4 flex items-center gap-2 text-slate-900">
              <FaMagnifyingGlassChart className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold">Related Factor Analysis</h3>
            </div>
            {insightLoading && <p className="mt-2 text-sm text-slate-400">AI is analyzing...</p>}
            {insightError && !insightLoading && (
              <p className="mt-2 text-sm text-red-500">Failed to load the AI analysis.</p>
            )}
            {insight && !insightLoading && (
              <>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                  {insight.factors.map((factor) => (
                    <li key={factor}>· {factor}</li>
                  ))}
                </ul>
                <p className="mt-1.5 text-xs text-slate-400">
                  * These are correlations only, not confirmed causes of cancellation.
                </p>

                <div className="mt-5 flex items-center gap-2 text-slate-900">
                  <FaLightbulb className="h-4 w-4 text-slate-400" />
                  <h3 className="text-sm font-semibold">Recommended Marketing Scenarios</h3>
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
                  <strong className="text-slate-700">Human-in-the-loop:</strong> This suggestion was
                  generated by AI (an LLM). Staff review and approval are required before it is sent.
                </p>
              </>
            )}
          </div>

          {/* Combination comparison table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">Combination Comparison</h2>
            <p className="mt-0.5 text-xs text-slate-400">Find the combination that flips the label with the smallest intervention.</p>
            <ul className="mt-3 divide-y divide-slate-100">
              {combos.map((combo) => (
                <li key={combo.key} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-slate-600">
                    {combo.title}
                    {combo.key !== "none" && combo.key !== "breakfast" && (
                      <span className="text-slate-400"> (Discount {combo.resolvedDiscount}%)</span>
                    )}
                  </span>
                  <PredictionBadge label={combo.label} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Intervention control panel */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">Intervention Controls</h2>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="discount" className="font-medium text-slate-700">Discount Coupon (% off ADR)</label>
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
              <span className="text-sm font-medium text-slate-700">Offer Breakfast Coupon</span>
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
              Run Simulation
            </button>
          </div>

          {/* Before / After */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">Before → After Comparison</h2>
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="flex-1 text-center">
                <div className="text-xs text-slate-400">Before</div>
                <div className="mt-2">
                  <PredictionBadge label={reservation.risk_label} size="lg" />
                </div>
                <div className="mt-1.5 text-xs text-slate-400">
                  {Math.round(reservation.base_probability * 100)}%
                </div>
              </div>
              <FaArrowLeft className="h-4 w-4 rotate-180 text-slate-300" />
              <div className="flex-1 text-center">
                <div className="text-xs text-slate-400">After</div>
                <div className={`mt-2 rounded-2xl ${labelChanged ? "ring-2 ring-brand ring-offset-2" : ""}`}>
                  {result ? (
                    <PredictionBadge label={result.label} size="lg" />
                  ) : (
                    <span className="inline-flex items-center rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-400">
                      Waiting to run
                    </span>
                  )}
                </div>
                {result && <div className="mt-1.5 text-xs text-slate-400">{Math.round(result.probability * 100)}%</div>}
              </div>
            </div>
          </div>

          {/* Action panel: appears once a simulation has been run, regardless of whether the label flipped.
              Lets staff record ("Action Taken") or revert ("Not Taken") the intervention; both flow into the Report. */}
          {result && (
            <div className={`rounded-2xl border p-5 ${labelChanged ? "border-brand/30 bg-brand/5" : "border-slate-200 bg-white"}`}>
              <div className={`flex items-center gap-2 ${labelChanged ? "text-brand" : "text-slate-900"}`}>
                <FaLightbulb className="h-4 w-4" />
                <h3 className="font-semibold">{labelChanged ? "This action is recommended" : "Record Intervention"}</h3>
              </div>
              <p className="mt-1.5 text-sm text-slate-600">
                {labelChanged ? (
                  <>
                    Applying a {discountPercent}% discount{breakfastCoupon ? " + breakfast coupon" : ""} flips the predicted label from{" "}
                    <b>Predicted Cancellation → Predicted Keep</b>.
                  </>
                ) : (
                  <>The intervention did not flip the predicted label, but you can still record it as an action taken.</>
                )}
              </p>

              {applied ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3.5 py-1.5 text-sm font-semibold text-green-700">
                    <FaCheck className="h-3.5 w-3.5" />
                    Action Taken
                  </span>
                  <button
                    type="button"
                    onClick={undoAction}
                    disabled={applying}
                    className="text-xs font-medium text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline disabled:opacity-60"
                  >
                    {applying ? "Reverting..." : "Mark as Not Taken"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={applyAction}
                  disabled={applying}
                  className="mt-3 flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
                >
                  <FaTicket className="h-3.5 w-3.5" />
                  {applying ? "Recording..." : "Mark as Action Taken (Issue Coupon)"}
                </button>
              )}
            </div>
          )}

          {/* Cost notes */}
          {cost && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-semibold text-slate-900">Cost Notes</h2>
              <p className="mt-0.5 text-xs text-slate-400">Simple arithmetic comparison (no probability needed)</p>
              <div className="mt-3 space-y-2 text-sm">
                <CostRow label="Coupon Cost" value={cost.couponCost} />
                <CostRow label="Revenue if Kept" value={cost.revenueIfKept} />
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-semibold">
                  <span className="text-slate-700">Net Effect</span>
                  <span className={cost.net >= 0 ? "text-green-600" : "text-red-600"}>
                    {cost.net >= 0 ? "+" : "-"}
                    {formatUSD(Math.abs(cost.net))}
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
      <span className="font-medium text-slate-900">{formatUSD(value)}</span>
    </div>
  );
}

export default ReservationDetail;
