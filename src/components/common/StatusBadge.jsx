// 예약 상태(reservation_status) 배지.
const STATUS_STYLE = {
  PENDING: { label: "대기", className: "bg-slate-100 text-slate-600 ring-slate-500/20" },
  CONFIRMED: { label: "확정", className: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  CHECKED_IN: { label: "체크인", className: "bg-teal-50 text-teal-700 ring-teal-600/20" },
  COMPLETED: { label: "완료", className: "bg-green-50 text-green-700 ring-green-600/20" },
  CANCELLED: { label: "취소", className: "bg-red-50 text-red-700 ring-red-600/20" },
  NO_SHOW: { label: "노쇼", className: "bg-orange-50 text-orange-700 ring-orange-600/20" },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLE[status] ?? {
    label: status ?? "-",
    className: "bg-gray-50 text-gray-500 ring-gray-500/20",
  };

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export default StatusBadge;
