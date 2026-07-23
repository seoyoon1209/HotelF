// Global filter bar: period / hotel branch / segment. Shared by the dashboard and reservation list screens.
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
          { value: "all", label: "All Branches" },
          ...hotelBranchOptions.map((v) => ({ value: v, label: v })),
        ]}
      />
      <FilterSelect
        value={segment}
        onChange={setSegment}
        options={[
          { value: "all", label: "All Segments" },
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
