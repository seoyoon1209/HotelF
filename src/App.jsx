// 라우트 정의 전용 파일. 새 페이지 컴포넌트를 만들면 여기에 import + <Route>만 추가하면 된다.
// 모든 라우트는 Layout(공통 헤더 + 반응형 컨테이너)으로 감싼다.
import { Routes, Route } from "react-router-dom";

import Layout from "src/components/common/Layout";
import HotelList from "src/components/hotel/HotelList";
import CustomerList from "src/components/customer/CustomerList";
import ReservationList from "src/components/reservation/ReservationList";
import ReservationDetail from "src/components/reservation/ReservationDetail";
import PredictionDashboard from "src/components/prediction/PredictionDashboard";
import OverbookingPanel from "src/components/prediction/OverbookingPanel";
import NotFound from "src/view/NotFound";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PredictionDashboard />} />
        <Route path="/hotels" element={<HotelList />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/reservations" element={<ReservationList />} />
        <Route path="/reservations/:reservationId" element={<ReservationDetail />} />
        <Route path="/overbooking" element={<OverbookingPanel />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;
