// "취소 예측 대응 시스템" 데모 4개 화면(대시보드/예약 리스트/상세+시뮬레이터/리포트)의 공통 레이아웃.
// 실제 백엔드 없이 정적 목업 데이터로 동작하는 기획 데모 화면이다.
import { NavLink, Outlet, useParams } from "react-router-dom";
import { FaShieldHalved, FaTriangleExclamation } from "react-icons/fa6";
import { ToastProvider } from "src/components/prediction/ToastProvider";
import { PredictionFilterProvider } from "src/view/prediction/PredictionFilterContext";

const TABS = [
  { to: "/prediction", label: "대시보드", end: true },
  { to: "/prediction/reservations", label: "예약 리스트" },
  { to: "/prediction/report", label: "리포트" },
];

function PredictionLayout() {
  return (
    <PredictionFilterProvider>
      <ToastProvider>
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                <FaShieldHalved className="h-4 w-4" />
              </span>
              <div>
                <h1 className="text-lg font-bold leading-tight text-slate-900">CancelGuard</h1>
                <p className="text-xs leading-tight text-slate-400">취소 예측 대응 시스템 데모</p>
              </div>
            </div>
            <PredictionTabs />
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <FaTriangleExclamation className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            기획 데모 화면입니다. 모든 예약/예측 데이터는 가상의 예시이며 실제 API와 연동되어 있지 않습니다.
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
