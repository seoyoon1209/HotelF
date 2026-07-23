// Fixed left sidebar shown at the md breakpoint and above (desktop)
import { Link, NavLink } from "react-router-dom";
import { FaHotel } from "react-icons/fa6";
import { NAV_ITEMS } from "./navItems";

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-slate-200 bg-white md:flex">
      <Link to="/" className="flex items-center gap-2 px-6 py-5 text-lg font-semibold text-slate-900">
        <FaHotel className="h-5 w-5 text-brand" />
        Hoteling
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand/10 text-brand"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
