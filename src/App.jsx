import { Routes, Route } from "react-router-dom";

import Layout from "src/components/common/Layout";
import LandingPage from "src/view/LandingPage";
import ReservationList from "src/components/reservation/ReservationList";
import ReservationDetail from "src/components/reservation/ReservationDetail";
import PredictionDashboard from "src/components/prediction/PredictionDashboard";
import OverbookingPanel from "src/components/prediction/OverbookingPanel";
import NotFound from "src/view/NotFound";
import PredictionLayout from "src/view/prediction/PredictionLayout";
import PredictionDemoDashboard from "src/view/prediction/Dashboard";
import PredictionReservationList from "src/view/prediction/ReservationList";
import PredictionReservationDetail from "src/view/prediction/ReservationDetail";
import PredictionReport from "src/view/prediction/Report";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={<PredictionDashboard />} />
        <Route path="/reservations" element={<ReservationList />} />
        <Route path="/reservations/:reservationId" element={<ReservationDetail />} />
        <Route path="/overbooking" element={<OverbookingPanel />} />

        <Route path="/prediction" element={<PredictionLayout />}>
          <Route index element={<PredictionDemoDashboard />} />
          <Route path="reservations" element={<PredictionReservationList />} />
          <Route path="reservations/:reservationId" element={<PredictionReservationDetail />} />
          <Route path="report" element={<PredictionReport />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
