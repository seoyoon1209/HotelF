// 4. Report: action history by period + CSV export + model version/update timestamp. All queried from the real backend.
import { useEffect, useState } from "react";
import { FaDownload, FaCircleInfo } from "react-icons/fa6";
import { useToast } from "src/components/prediction/ToastProvider";
import { getActionReport } from "src/api/reservationActionApi";
import { getModelInfo } from "src/api/predictionApi";
import LoadingState from "src/components/common/LoadingState";

const REPORT_WEEKS = 8;

function downloadCsv(rows) {
  const header = ["Period", "Actions Taken", "Label Flip Successes"];
  const body = rows.map((row) => [`${row.period_start} ~ ${row.period_end}`, row.actions_taken, row.label_flipped]);
  const csv = [header, ...body].map((r) => r.join(",")).join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "hoteling_action_history.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function Report() {
  const showToast = useToast();
  const [rows, setRows] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getActionReport(REPORT_WEEKS), getModelInfo()])
      .then(([reportRes, modelRes]) => {
        if (cancelled) return;
        setRows(reportRes.data);
        setModelInfo(modelRes.data);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalActions = rows.reduce((sum, row) => sum + row.actions_taken, 0);
  const totalFlipped = rows.reduce((sum, row) => sum + row.label_flipped, 0);
  const successRate = totalActions === 0 ? 0 : totalFlipped / totalActions;

  const handleExport = () => {
    downloadCsv(rows);
    showToast({ title: "CSV download complete", message: "hoteling_action_history.csv", tone: "success" });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Action History by Period</h1>
          <p className="mt-0.5 text-sm text-slate-400">Successful label flips (predicted cancellation → predicted keep) out of actions taken</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={rows.length === 0}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40"
        >
          <FaDownload className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load report data. Please check that the backend server is running.
        </div>
      )}

      {loading ? (
        <LoadingState className="mt-3" />
      ) : (
        !error && (
          <>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryCard label="Total Actions Taken" value={totalActions.toLocaleString()} />
              <SummaryCard label="Label Flip Successes" value={totalFlipped.toLocaleString()} accent="text-green-600" />
              <SummaryCard label="Success Rate" value={`${(successRate * 100).toFixed(1)}%`} accent="text-brand" />
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="px-5 py-3 font-medium">Period</th>
                    <th className="px-5 py-3 font-medium">Actions Taken</th>
                    <th className="px-5 py-3 font-medium">Label Flip Successes</th>
                    <th className="px-5 py-3 font-medium">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.period_start} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {row.period_start} ~ {row.period_end}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{row.actions_taken}</td>
                      <td className="px-5 py-3 text-slate-600">{row.label_flipped}</td>
                      <td className="px-5 py-3 text-slate-600">
                        {row.actions_taken === 0 ? "-" : `${((row.label_flipped / row.actions_taken) * 100).toFixed(1)}%`}
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                        No action history yet. Actions recorded from "Apply" on a reservation's detail page will show up here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {modelInfo && (
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm">
                <FaCircleInfo className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-slate-600">
                  <span>
                    Model Version <b className="text-slate-900">{modelInfo.model_name}-{modelInfo.model_version}</b>
                  </span>
                  <span>
                    Last Predicted At{" "}
                    <b className="text-slate-900">{new Date(modelInfo.updated_at).toLocaleString()}</b>
                  </span>
                  <span>
                    Reference Accuracy{" "}
                    <b className="text-slate-900">
                      {modelInfo.accuracy == null
                        ? "Insufficient data"
                        : `${Math.round(modelInfo.accuracy * 100)}% (based on ${modelInfo.sample_size} completed/cancelled reservations)`}
                    </b>
                  </span>
                </div>
              </div>
            )}
          </>
        )
      )}
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
