// 오버부킹 지원 페이지(직원 판단용 )
import { useEffect, useState } from "react";
import { getOverbookingSummary } from "src/api/overbookingApi";

function OverbookingPanel() {
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    getOverbookingSummary().then((res) => setSummary(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Overbooking Support</h1>
      <p className="mt-1 text-sm text-slate-500">
        Recommends how many additional bookings to accept per date, based on expected
        cancellations. Reference figures only — final judgment is up to staff.
      </p>

      {/* 모바일: 카드 목록 */}
      <div className="mt-5 space-y-3 sm:hidden">
        {summary.map((day) => (
          <div
            key={day.check_in_date}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-900">{day.check_in_date}</span>
              <span className="text-sm text-slate-500">{day.total_reservations} reservations</span>
            </div>
            <div className="mt-1.5 text-sm text-slate-600">
              Expected cancellations {Number(day.expected_cancellations).toFixed(1)} (high risk{" "}
              {day.high_risk_count})
            </div>
            <div className="mt-2 inline-block rounded-full bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700">
              Recommended additional bookings: {day.recommended_additional_bookings}
            </div>
          </div>
        ))}
        {summary.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No data to display.
          </div>
        )}
      </div>

      <div className="mt-5 hidden overflow-hidden rounded-xl border border-slate-200 bg-white sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <th className="px-4 py-3 font-medium">Check-in Date</th>
              <th className="px-4 py-3 font-medium">Reservations</th>
              <th className="px-4 py-3 font-medium">Expected Cancellations</th>
              <th className="px-4 py-3 font-medium">High Risk Count</th>
              <th className="px-4 py-3 font-medium">Recommended Additional Bookings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {summary.map((day) => (
              <tr key={day.check_in_date} className="transition hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{day.check_in_date}</td>
                <td className="px-4 py-3 text-slate-600">{day.total_reservations}</td>
                <td className="px-4 py-3 text-slate-600">
                  {Number(day.expected_cancellations).toFixed(1)}
                </td>
                <td className="px-4 py-3 text-slate-600">{day.high_risk_count}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                    {day.recommended_additional_bookings}
                  </span>
                </td>
              </tr>
            ))}
            {summary.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No data to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OverbookingPanel;
