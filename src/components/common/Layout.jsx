// 실제 서비스 페이지 전용 레이아웃
import { Outlet } from "react-router-dom";
import Header from "./Header";

function Layout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
