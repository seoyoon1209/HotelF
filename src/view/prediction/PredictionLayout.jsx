// "취소 예측 대응 시스템" 4개 화면(대시보드/예약 리스트/상세+시뮬레이터/리포트)의 공통 레이아웃.
// 예약/예측/조치 이력/모델 정보 모두 실제 백엔드·DB에서 가져온다.
// 시뮬레이터의 "조작 후" 확률만 예외로, 실제 ML 재추론이 아니라 프론트에서 계산하는 단순 산술
// 근사치다 (백엔드에 what-if 재추론 엔드포인트가 아직 없음).
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
            예약·예측·조치 이력·모델 정보 모두 실제 DB와 연동되어 있습니다. 시뮬레이터의 "조작 후"
            수치만 단순 산술로 근사한 참고값입니다.
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
