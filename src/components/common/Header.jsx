// 공통 상단 네비게이션.
import { Link, NavLink } from "react-router-dom";
import { FaHotel } from "react-icons/fa6";

const NAV_ITEMS = [
  { to: "/dashboard", label: "대시보드" },
  { to: "/reservations", label: "예약" },
  { to: "/overbooking", label: "오버부킹" },
  { to: "/hotels", label: "호텔" },
  { to: "/customers", label: "고객" },
  { to: "/demo", label: "AI 데모" },
];

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FaHotel className="h-5 w-5 text-slate-700" />
          호텔 예약 취소 예측
        </Link>
        <nav className="flex flex-wrap gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
