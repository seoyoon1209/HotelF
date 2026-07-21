// 전역 토스트 알림. "시뮬레이션 실행 중", "쿠폰 발급 완료" 등 공통 요소로 쓰인다.
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { FaCircleCheck, FaSpinner, FaCircleInfo } from "react-icons/fa6";

const ToastContext = createContext(null);

const TONE_STYLE = {
  info: { icon: FaSpinner, iconClass: "bg-blue-100 text-brand animate-spin" },
  success: { icon: FaCircleCheck, iconClass: "bg-green-100 text-green-600" },
  neutral: { icon: FaCircleInfo, iconClass: "bg-slate-100 text-slate-500" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback(({ title, message, tone = "neutral", duration = 3200 }) => {
    const id = idRef.current += 1;
    setToasts((prev) => [...prev, { id, title, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
    return id;
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2 sm:right-6 sm:top-6">
        {toasts.map((toast) => {
          const style = TONE_STYLE[toast.tone] ?? TONE_STYLE.neutral;
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              className="animate-fade-in-up pointer-events-auto flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg"
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.iconClass}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
                {toast.message && <p className="mt-0.5 text-xs text-slate-500">{toast.message}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
