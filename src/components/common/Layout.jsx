// 실제 서비스 페이지 전용 레이아웃
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Sidebar />
      <main className="px-4 py-8 sm:px-6 md:ml-60 md:px-10">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
