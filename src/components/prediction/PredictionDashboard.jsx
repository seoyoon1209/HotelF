// 홈("/") 화면. 취소 위험도가 높은 예약 요약, 통계 등을 보여줄 대시보드 자리.
// api/predictionApi.js의 getPredictionsByReservation()은 예약 단위 조회라서,
// 대시보드용 집계 API가 백엔드에 추가로 필요할 수 있음.
function PredictionDashboard() {
  return <div>취소 예측 대시보드</div>;
}

export default PredictionDashboard;
