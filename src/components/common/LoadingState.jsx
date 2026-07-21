// 로딩 중임을 시각적으로 보여주는 공용 컴포넌트
import { FaCircleNotch } from "react-icons/fa6";

function LoadingState({ label = "불러오는 중...", inline = false, className = "" }) {
  if (inline) {
    return (
      <span className={`inline-flex items-center gap-2 text-slate-400 ${className}`}>
        <FaCircleNotch className="h-3.5 w-3.5 animate-spin text-brand" />
        {label}
      </span>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-14 text-slate-400 ${className}`}>
      <FaCircleNotch className="h-6 w-6 animate-spin text-brand" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export default LoadingState;
