// 공통 상단 네비게이션. Layout.jsx에서 모든 페이지를 감싸는 데 사용된다.
// 화면이 좁으면(모바일) 로고 아래로 메뉴가 줄바꿈되고, 넓으면(데스크톱) 한 줄로 표시된다.
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "대시보드" },
  { to: "/reservations", label: "예약" },
  { to: "/hotels", label: "호텔" },
  { to: "/customers", label: "고객" },
];

function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <span className="text-lg font-semibold">🏨 호텔 예약 취소 예측</span>
        <nav className="flex flex-wrap gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm font-medium ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
