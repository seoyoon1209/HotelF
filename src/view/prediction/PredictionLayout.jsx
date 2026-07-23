// Shared layout for the 4 "cancellation prediction response system" screens (dashboard / reservation list / detail + simulator / report).
// Reservations, predictions, action history, and model info are all fetched from the real backend/DB.
// The one exception is the simulator's "after adjustment" probability, which is not a real ML
// re-inference but a simple arithmetic approximation computed on the frontend (the backend has no
// what-if re-inference endpoint yet).
import { NavLink, Outlet, useParams } from "react-router-dom";
import { ToastProvider } from "src/components/prediction/ToastProvider";
import { PredictionFilterProvider } from "src/view/prediction/PredictionFilterContext";

const TABS = [
  { to: "/prediction", label: "Dashboard", end: true },
  { to: "/prediction/reservations", label: "Reservation List" },
  { to: "/prediction/report", label: "Report" },
];

function PredictionLayout() {
  return (
    <PredictionFilterProvider>
      <ToastProvider>
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <PredictionTabs />
          </div>

          <div className="mt-5">
            <Outlet />
          </div>
        </div>
      </ToastProvider>
    </PredictionFilterProvider>
  );
}

function PredictionTabs() {
  const { reservationId } = useParams();
  return (
    <nav className="flex flex-wrap gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              isActive || (tab.to === "/prediction/reservations" && reservationId)
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-white"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default PredictionLayout;
