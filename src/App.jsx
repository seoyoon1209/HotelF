import { Routes, Route } from "react-router-dom";

import HotelList from "src/components/hotel/HotelList";
import CustomerList from "src/components/customer/CustomerList";
import ReservationList from "src/components/reservation/ReservationList";
import ReservationDetail from "src/components/reservation/ReservationDetail";
import PredictionDashboard from "src/components/prediction/PredictionDashboard";
import NotFound from "src/view/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PredictionDashboard />} />
      <Route path="/hotels" element={<HotelList />} />
      <Route path="/customers" element={<CustomerList />} />
      <Route path="/reservations" element={<ReservationList />} />
      <Route path="/reservations/:reservationId" element={<ReservationDetail />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
