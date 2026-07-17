// "AI 맞춤형 고객 관리" 데모 페이지.
import { useState } from "react";
import { FaTriangleExclamation } from "react-icons/fa6";
import RiskBadge from "src/components/common/RiskBadge";

const SAMPLE_CUSTOMERS = [
  {
    reservation_code: "RSV-2026-00842",
    market_segment: "OTA",
    distribution_channel: "온라인 여행사",
    deposit_status: "보증금 미납",
    check_in_date: "2026-07-19",
    cancellation_probability: 0.82,
    risk_level: "HIGH",
    recommendation: `이 예약은 OTA 채널을 통해 들어왔고 보증금이 아직 납부되지 않은 상태로, 취소 확률이 82%(높음)로 예측됩니다.
유사한 조건(OTA·보증금 미납)의 예약군에서는 체크인 전 재확인 연락을 받은 경우 취소로 이어지는 비율이 낮았습니다.

다음 조치를 검토해보세요.
1. 체크인 24시간 전 재확인 연락으로 투숙 의사 확인
2. 무료 룸 업그레이드 제안으로 투숙 유지 유도
3. 보증금 결제 재요청 또는 마감 기한 안내`,
  },
  {
    reservation_code: "RSV-2026-01180",
    market_segment: "OTA",
    distribution_channel: "온라인 여행사",
    deposit_status: "보증금 미납",
    check_in_date: "2026-07-21",
    cancellation_probability: 0.91,
    risk_level: "CRITICAL",
    recommendation: `취소 확률 91%(매우 높음)로, 과거에도 같은 채널·세그먼트에서 반복 취소 이력이 있는 패턴과 유사합니다.
지금 조치하지 않으면 임박한 날짜에 공실이 발생할 가능성이 큽니다.

다음 조치를 검토해보세요.
1. 오늘 중 우선순위로 재확인 연락 진행
2. 대기 고객 명단 확인 및 재판매 준비 착수
3. 무리한 할인보다는 일정 변경(날짜 이동) 옵션 우선 제안`,
  },
  {
    reservation_code: "RSV-2026-01023",
    market_segment: "여행사",
    distribution_channel: "제휴 여행사",
    deposit_status: "무료취소 기한 임박",
    check_in_date: "2026-07-25",
    cancellation_probability: 0.55,
    risk_level: "MEDIUM",
    recommendation: `취소 확률 55%(보통)로, 무료취소 기한이 임박한 예약입니다. 아직 확실히 위험한 단계는 아니지만 지켜볼 필요가 있습니다.

다음 조치를 검토해보세요.
1. 무료취소 기한 하루 전 알림 연락
2. 조식/레이트 체크아웃 등 소액 혜택으로 투숙 만족도 예고
3. 별도 조치 없이 예측 추이만 계속 모니터링해도 무방`,
  },
  {
    reservation_code: "RSV-2026-00915",
    market_segment: "직접예약",
    distribution_channel: "호텔 홈페이지",
    deposit_status: "보증금 완납",
    check_in_date: "2026-07-18",
    cancellation_probability: 0.12,
    risk_level: "LOW",
    recommendation: `취소 확률 12%(낮음)로, 보증금도 완납된 안정적인 예약입니다. 별도 조치가 필요하지 않습니다.

다음 조치를 검토해보세요.
1. 특별한 조치 불필요 — 정상 체크인 준비만 진행
2. 여력이 된다면 재방문 유도용 감사 메시지 정도만 고려`,
  },
];

function AiDemoPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = SAMPLE_CUSTOMERS[selectedIndex];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">AI 맞춤형 고객 관리 데모</h1>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
          <FaTriangleExclamation className="h-3 w-3" />
          정적 예시 데모 (실제 LLM 연동 아님)
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        예측된 취소 확률을 LLM에 넣어 사람이 이해하기 쉬운 고객 관리 문구로 바꾸는 기능을
        미리 보여주는 화면입니다. 아래 고객 목록과 추천 내용은 실제 데이터가 아닌 예시입니다.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[18rem_1fr]">
        {/* 고객 목록 */}
        <div className="space-y-2">
          {SAMPLE_CUSTOMERS.map((customer, index) => (
            <button
              key={customer.reservation_code}
              onClick={() => setSelectedIndex(index)}
              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                index === selectedIndex
                  ? "border-blue-300 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div>
                <div className="text-sm font-medium text-slate-900">
                  {customer.reservation_code}
                </div>
                <div className="text-xs text-slate-500">체크인 {customer.check_in_date}</div>
              </div>
              <RiskBadge riskLevel={customer.risk_level} />
            </button>
          ))}
        </div>

        {/* 선택된 고객 상세 + AI 추천 문구 */}
        <div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-900">{selected.reservation_code}</span>
              <RiskBadge riskLevel={selected.risk_level} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-slate-500">시장 구분</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{selected.market_segment}</dd>
              </div>
              <div>
                <dt className="text-slate-500">예약 경로</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {selected.distribution_channel}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">보증금</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{selected.deposit_status}</dd>
              </div>
              <div>
                <dt className="text-slate-500">취소 확률</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {(selected.cancellation_probability * 100).toFixed(0)}%
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-5">
            <h2 className="font-semibold text-blue-900">AI 추천 고객 관리 문구 (예시)</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-blue-900">
              {selected.recommendation}
            </p>
            <p className="mt-3 text-xs text-blue-700">
              ※ 위 문구는 예측값을 바탕으로 한 예시이며, 실제 연락·할인·업그레이드 실행 전 담당
              직원의 최종 확인이 필요합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiDemoPage;
