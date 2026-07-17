// App.jsx의 catch-all 라우트("*")가 렌더링하는 404 화면.
import { Link } from "react-router-dom";
import { FaCompass } from "react-icons/fa6";

function NotFound() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 py-16 text-center">
      <FaCompass className="h-10 w-10 text-slate-400" />
      <p className="text-lg font-medium text-slate-900">Page not found.</p>
      <Link to="/dashboard" className="text-sm text-blue-700 hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

export default NotFound;
