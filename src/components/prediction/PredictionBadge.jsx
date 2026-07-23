// Binary predicted-cancellation/predicted-keep badge. Shared spec element: critical = predicted cancellation (red), good = predicted keep (green).
import { FaCircleExclamation, FaCircleCheck } from "react-icons/fa6";

const STYLE = {
  CANCEL: {
    label: "Predicted Cancellation",
    className: "bg-red-50 text-red-700 ring-red-600/20",
    dot: "bg-red-500",
    icon: FaCircleExclamation,
  },
  KEEP: {
    label: "Predicted Keep",
    className: "bg-green-50 text-green-700 ring-green-600/20",
    dot: "bg-green-500",
    icon: FaCircleCheck,
  },
};

function PredictionBadge({ label, size = "md" }) {
  const style = STYLE[label] ?? {
    label: "No Prediction",
    className: "bg-gray-50 text-gray-500 ring-gray-500/20",
    dot: "bg-gray-400",
    icon: FaCircleExclamation,
  };
  const Icon = style.icon;

  if (size === "lg") {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-base font-bold ring-2 ring-inset ${style.className}`}
      >
        <Icon className="h-5 w-5" />
        {style.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

export default PredictionBadge;
