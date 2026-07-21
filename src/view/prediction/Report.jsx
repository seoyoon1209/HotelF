// 4. 리포트: 기간별 조치 이력 + CSV export + 모델 버전/업데이트 일시.
import { FaDownload, FaCircleInfo } from "react-icons/fa6";
import { useToast } from "src/components/prediction/ToastProvider";
import { ACTION_HISTORY, MODEL_INFO } from "src/data/predictionDemoData";

function downloadCsv() {
  const header = ["기간", "조치 건수", "라벨 전환 성공"];
  const rows = ACTION_HISTORY.map((row) => [row.period, row.actionsTaken, row.labelFlipped]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cancelguard_action_history.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function Report() {
  const showToast = useToast();

  const totalActions = ACTION_HISTORY.reduce((sum, row) => sum + row.actionsTaken, 0);
  const totalFlipped = ACTION_HISTORY.reduce((sum, row) => sum + row.labelFlipped, 0);
  const successRate = totalActions === 0 ? 0 : totalFlipped / totalActions;

  const handleExport = () => {
    downloadCsv();
    showToast({ title: "CSV 다운로드 완료", message: "cancelguard_action_history.csv", tone: "success" });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">기간별 조치 이력</h1>
          <p className="mt-0.5 text-sm text-slate-400">조치 건수 대비 라벨 전환(취소예상 → 미취소예상) 성공 건수</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <FaDownload className="h-3.5 w-3.5" />
          CSV로 내보내기
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="총 조치 건수" value={`${totalActions.toLocaleString()}건`} />
        <SummaryCard label="라벨 전환 성공" value={`${totalFlipped.toLocaleString()}건`} accent="text-green-600" />
        <SummaryCard label="전환 성공률" value={`${(successRate * 100).toFixed(1)}%`} accent="text-brand" />
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500">
              <th className="px-5 py-3 font-medium">기간</th>
              <th className="px-5 py-3 font-medium">조치 건수</th>
              <th className="px-5 py-3 font-medium">라벨 전환 성공</th>
              <th className="px-5 py-3 font-medium">전환율</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ACTION_HISTORY.map((row) => (
              <tr key={row.period} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-900">{row.period}</td>
                <td className="px-5 py-3 text-slate-600">{row.actionsTaken}건</td>
                <td className="px-5 py-3 text-slate-600">{row.labelFlipped}건</td>
                <td className="px-5 py-3 text-slate-600">
                  {((row.labelFlipped / row.actionsTaken) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm">
        <FaCircleInfo className="h-4 w-4 shrink-0 text-slate-400" />
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-slate-600">
          <span>모델 버전 <b className="text-slate-900">{MODEL_INFO.version}</b></span>
          <span>업데이트 일시 <b className="text-slate-900">{MODEL_INFO.updatedAt}</b></span>
          <span>참고 정확도 <b className="text-slate-900">{Math.round(MODEL_INFO.accuracy * 100)}%</b></span>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, accent = "text-slate-900" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-1.5 text-2xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

export default Report;
