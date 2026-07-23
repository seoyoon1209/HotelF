// 오버부킹 지원 페이지 (직원 판단용)
import { useEffect, useMemo, useState } from "react";
import { FaLayerGroup, FaCircleExclamation } from "react-icons/fa6";
import { getOverbookingSummary } from "src/api/overbookingApi";
import LoadingState from "src/components/common/LoadingState";

function OverbookingPanel() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    getOverbookingSummary()
      .then((res) => {
        setSummary(res.data);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const totalReservations = summary.reduce((sum, d) => sum + d.total_reservations, 0);
    const expectedCancellations = summary.reduce((sum, d) => sum + Number(d.expected_cancellations), 0);
    const recommendedBookings = summary.reduce((sum, d) => sum + d.recommended_additional_bookings, 0);
    return { totalReservations, expectedCancellations, recommendedBookings };
  }, [summary]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <FaLayerGroup className="h-5 w-5 text-brand" />
        <h1 className="text-2xl font-semibold text-slate-900">오버부킹 지원</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        날짜별 예상 취소 건수를 기준으로 추가 예약 허용 범위를 추천합니다. 참고용 수치이며 최종
        판단은 직원이 합니다.
      </p>

      {!loading && !error && summary.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="향후 30일 예약 건수" value={`${stats.totalReservations.toLocaleString()}건`} />
          <StatCard
            label="향후 30일 예상 취소"
            value={`${stats.expectedCancellations.toFixed(1)}건`}
            accent="text-orange-600"
          />
          <StatCard
            label="추가 예약 추천 합계"
            value={`${stats.recommendedBookings.toLocaleString()}건`}
            accent="text-blue-700"
          />
        </div>
      )}

      {loading && <LoadingState className="mt-6" />}

      {!loading && error && (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
          <FaCircleExclamation className="h-5 w-5" />
          <span className="text-sm">
            오버부킹 데이터를 불러오지 못했습니다. 백엔드 서버가 켜져 있는지 확인해주세요.
          </span>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* 모바일: 카드 목록 */}
          <div className="mt-5 space-y-3 sm:hidden">
            {summary.map((day) => (
              <DayCard key={day.check_in_date} day={day} />
            ))}
            {summary.length === 0 && <EmptyState />}
          </div>

          {/* 데스크톱: 테이블 */}
          <div className="mt-5 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500">
                  <th className="px-4 py-3 font-medium">체크인 날짜</th>
                  <th className="px-4 py-3 font-medium">예약 건수</th>
                  <th className="px-4 py-3 font-medium">예상 취소 건수</th>
                  <th className="px-4 py-3 font-medium">고위험 건수</th>
                  <th className="px-4 py-3 font-medium">추가 예약 추천</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.map((day) => (
                  <tr key={day.check_in_date} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{day.check_in_date}</td>
                    <td className="px-4 py-3 text-slate-600">{day.total_reservations}건</td>
                    <td className="px-4 py-3 text-slate-600">
                      {Number(day.expected_cancellations).toFixed(1)}건
                    </td>
                    <td className="px-4 py-3">
                      {day.high_risk_count > 0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                          {day.high_risk_count}건
                        </span>
                      ) : (
                        <span className="text-slate-400">0건</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                        +{day.recommended_additional_bookings}건
                      </span>
                    </td>
                  </tr>
                ))}
                {summary.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                      표시할 데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, accent = "text-slate-900" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-1.5 text-2xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

function DayCard({ day }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-900">{day.check_in_date}</span>
        <span className="text-sm text-slate-500">예약 {day.total_reservations}건</span>
      </div>
      <div className="mt-1.5 text-sm text-slate-600">
        예상 취소 {Number(day.expected_cancellations).toFixed(1)}건 (고위험 {day.high_risk_count}건)
      </div>
      <div className="mt-2 inline-block rounded-full bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700">
        추가 예약 추천 +{day.recommended_additional_bookings}건
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
      표시할 데이터가 없습니다.
    </div>
  );
}

export default OverbookingPanel;
