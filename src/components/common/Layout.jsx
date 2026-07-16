// 모든 페이지 공통 레이아웃. Header + 본문 컨테이너(반응형 max-width, 좌우 padding).
import Header from "./Header";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

export default Layout;
