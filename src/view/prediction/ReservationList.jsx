// 2. 예약 리스트: 검색/상태 필터/정렬/일괄 시뮬레이션/페이지네이션.
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaMagnifyingGlass, FaPlay } from "react-icons/fa6";
import FilterBar from "src/components/prediction/FilterBar";
import PredictionBadge from "src/components/prediction/PredictionBadge";
import { useToast } from "src/components/prediction/ToastProvider";
import { usePredictionFilters } from "src/view/prediction/PredictionFilterContext";
import { simulateProbability } from "src/data/predictionDemoData";

const STATUS_CHIPS = [
  { value: "all", label: "전체" },
  { value: "CANCEL", label: "취소예상" },
  { value: "KEEP", label: "미취소예상" },
  { value: "DONE", label: "조치완료" },
];

const PAGE_SIZE = 10;

function ReservationList() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { filteredReservations } = usePredictionFilters();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "all");
  const [sortBy, setSortBy] = useState("lead_time");
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fromQuery = searchParams.get("status");
    if (fromQuery) {
      setStatusFilter(fromQuery);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    let list = filteredReservations.filter((r) => {
      const matchesQuery =
        query.trim() === "" ||
        r.customer_name.includes(query.trim()) ||
        r.reservation_code.toLowerCase().includes(query.trim().toLowerCase());
      if (!matchesQuery) return false;
      if (statusFilter === "all") return true;
      if (statusFilter === "DONE") return r.action_status === "DONE";
      return r.risk_label === statusFilter;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "lead_time") return a.lead_time - b.lead_time;
      if (sortBy === "probability") return b.base_probability - a.base_probability;
      return 0;
    });
    return list;
  }, [filteredReservations, query, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, sortBy]);

  const toggleRow = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = pageRows.every((r) => next.has(r.reservation_id));
      pageRows.forEach((r) => {
        if (allSelected) next.delete(r.reservation_id);
        else next.add(r.reservation_id);
      });
      return next;
    });
  };

  const runBulkSimulation = () => {
    if (selected.size === 0) return;
    const targets = filteredReservations.filter((r) => selected.has(r.reservation_id));
    showToast({ title: "일괄 시뮬레이션 실행 중", message: `${targets.length}건 처리 중...`, tone: "info", duration: 1400 });
    window.setTimeout(() => {
      const flipped = targets.filter((r) => {
        const { label } = simulateProbability(r, { discountPercent: 15, breakfastCoupon: true });
        return r.risk_label === "CANCEL" && label === "KEEP";
      }).length;
      showToast({
        title: "일괄 시뮬레이션 완료",
        message: `${targets.length}건 중 ${flipped}건이 할인 15% + 조식쿠폰 적용 시 라벨 전환 예상`,
        tone: "success",
        duration: 4000,
      });
      setSelected(new Set());
    }, 1400);
  };

  return (
    <div>
      <div className="sticky top-0 z-10 space-y-3 bg-slate-100 pb-3 pt-0.5">
        <FilterBar />
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
          <div className="relative flex-1 min-w-[200px]">
            <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="고객명 또는 예약번호 검색"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_CHIPS.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => setStatusFilter(chip.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === chip.value
                    ? "bg-brand text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="lead_time">체크인 임박순</option>
            <option value="probability">취소확률 높은순</option>
          </select>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center justify-between rounded-2xl border border-brand/30 bg-brand/5 px-4 py-2.5">
            <span className="text-sm font-medium text-slate-700">{selected.size}건 선택됨</span>
            <button
              type="button"
              onClick={runBulkSimulation}
              className="flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-dark"
            >
              <FaPlay className="h-3 w-3" />
              선택 항목 일괄 시뮬레이션
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={pageRows.length > 0 && pageRows.every((r) => selected.has(r.reservation_id))}
                    onChange={toggleAllOnPage}
                    className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                  />
                </th>
                <th className="px-3 py-3 font-medium">예약번호</th>
                <th className="px-3 py-3 font-medium">고객명</th>
                <th className="px-3 py-3 font-medium">체크인일</th>
                <th className="px-3 py-3 font-medium">리드타임</th>
                <th className="px-3 py-3 font-medium">ADR</th>
                <th className="px-3 py-3 font-medium">조식여부</th>
                <th className="px-3 py-3 font-medium">예측</th>
                <th className="px-3 py-3 font-medium">조치상태</th>
                <th className="px-3 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.map((r) => (
                <tr key={r.reservation_id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(r.reservation_id)}
                      onChange={() => toggleRow(r.reservation_id)}
                      className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                    />
                  </td>
                  <td className="px-3 py-3 font-medium text-slate-900">{r.reservation_code}</td>
                  <td className="px-3 py-3 text-slate-600">{r.customer_name}</td>
                  <td className="px-3 py-3 text-slate-600">{r.check_in_date}</td>
                  <td className="px-3 py-3 text-slate-600">D-{r.lead_time}</td>
                  <td className="px-3 py-3 text-slate-600">{r.adr.toLocaleString()}원</td>
                  <td className="px-3 py-3 text-slate-600">{r.meal === "BB" ? "포함" : "미포함"}</td>
                  <td className="px-3 py-3">
                    <PredictionBadge label={r.risk_label} />
                  </td>
                  <td className="px-3 py-3 text-slate-500">
                    {r.action_status === "DONE" ? "조치완료" : "미조치"}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/prediction/reservations/${r.reservation_code}`)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-brand hover:text-brand"
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                    조건에 맞는 예약이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>
            총 {rows.length}건 중 {pageRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
            {(page - 1) * PAGE_SIZE + pageRows.length}건
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg px-2.5 py-1 font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-30"
            >
              이전
            </button>
            <span className="px-2 text-slate-700">{page} / {totalPages}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg px-2.5 py-1 font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-30"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReservationList;
