import { Routes, Route } from "react-router-dom";

import Layout from "src/components/common/Layout";
import LandingPage from "src/view/LandingPage";
import AiDemoPage from "src/view/AiDemoPage";
import HotelList from "src/components/hotel/HotelList";
import CustomerList from "src/components/customer/CustomerList";
import ReservationList from "src/components/reservation/ReservationList";
import ReservationDetail from "src/components/reservation/ReservationDetail";
import PredictionDashboard from "src/components/prediction/PredictionDashboard";
import OverbookingPanel from "src/components/prediction/OverbookingPanel";
import NotFound from "src/view/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={<PredictionDashboard />} />
        <Route path="/demo" element={<AiDemoPage />} />
        <Route path="/hotels" element={<HotelList />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/reservations" element={<ReservationList />} />
        <Route path="/reservations/:reservationId" element={<ReservationDetail />} />
        <Route path="/overbooking" element={<OverbookingPanel />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
