// 오버부킹 지원 페이지. 앞으로 30일간 체크인 날짜별 예상 취소량을 보여주고,
// 그만큼 추가로 예약을 받아도 되는지 추천값(recommended_additional_bookings)을 제시한다.
// 실제 오버부킹 확정은 이 화면에서 자동 실행되지 않고 참고용/직원 판단용이다.
import { useEffect, useState } from "react";
import { getOverbookingSummary } from "src/api/overbookingApi";

function OverbookingPanel() {
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    getOverbookingSummary().then((res) => setSummary(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold">오버부킹 지원</h1>
      <p className="mt-1 text-sm text-slate-500">
        날짜별 예상 취소 건수를 기준으로 추가 예약 허용 범위를 추천합니다. 참고용 수치이며 최종
        판단은 직원이 합니다.
      </p>

      {/* 모바일: 카드 목록, 데스크톱(sm 이상): 표 */}
      <div className="mt-4 space-y-3 sm:hidden">
        {summary.map((day) => (
          <div key={day.check_in_date} className="rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{day.check_in_date}</span>
              <span className="text-sm text-slate-500">예약 {day.total_reservations}건</span>
            </div>
            <div className="mt-1 text-sm text-slate-600">
              예상 취소 {Number(day.expected_cancellations).toFixed(1)}건 (고위험{" "}
              {day.high_risk_count}건)
            </div>
            <div className="mt-1 text-sm font-medium text-blue-700">
              추가 예약 추천: {day.recommended_additional_bookings}건
            </div>
          </div>
        ))}
      </div>

      <table className="mt-4 hidden w-full text-left text-sm sm:table">
        <thead>
          <tr className="border-b text-slate-500">
            <th className="py-2">체크인 날짜</th>
            <th className="py-2">예약 건수</th>
            <th className="py-2">예상 취소 건수</th>
            <th className="py-2">고위험 건수</th>
            <th className="py-2">추가 예약 추천</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((day) => (
            <tr key={day.check_in_date} className="border-b">
              <td className="py-2">{day.check_in_date}</td>
              <td className="py-2">{day.total_reservations}</td>
              <td className="py-2">{Number(day.expected_cancellations).toFixed(1)}</td>
              <td className="py-2">{day.high_risk_count}</td>
              <td className="py-2 font-medium text-blue-700">
                {day.recommended_additional_bookings}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OverbookingPanel;
