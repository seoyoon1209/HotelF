// 전역 필터바: 기간 / 호텔·지점 / 세그먼트. 대시보드·예약 리스트 화면에서 공용으로 사용.
import { usePredictionFilters, PERIOD_OPTIONS } from "src/view/prediction/PredictionFilterContext";
import { SEGMENT_LABEL } from "src/data/labels";

function FilterBar({ sticky = false }) {
  const {
    period,
    setPeriod,
    hotelBranch,
    setHotelBranch,
    segment,
    setSegment,
    hotelBranchOptions,
    segmentOptions,
  } = usePredictionFilters();

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 ${
        sticky ? "sticky top-0 z-10 shadow-sm" : ""
      }`}
    >
      <FilterSelect value={period} onChange={setPeriod} options={PERIOD_OPTIONS} />
      <FilterSelect
        value={hotelBranch}
        onChange={setHotelBranch}
        options={[
          { value: "all", label: "전체 호텔/지점" },
          ...hotelBranchOptions.map((v) => ({ value: v, label: v })),
        ]}
      />
      <FilterSelect
        value={segment}
        onChange={setSegment}
        options={[
          { value: "all", label: "전체 세그먼트" },
          ...segmentOptions.map((v) => ({ value: v, label: SEGMENT_LABEL[v] ?? v })),
        ]}
      />
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export default FilterBar;
