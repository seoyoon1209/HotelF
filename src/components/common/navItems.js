//내비게이션 항목 목록.
import {
  FaGauge,
  FaClipboardList,
  FaLayerGroup,
  FaShieldHalved,
} from "react-icons/fa6";

export const NAV_ITEMS = [
  { to: "/dashboard", label: "대시보드", icon: FaGauge },
  { to: "/reservations", label: "예약", icon: FaClipboardList },
  { to: "/overbooking", label: "오버부킹", icon: FaLayerGroup },
  { to: "/prediction", label: "취소 예측 데모", icon: FaShieldHalved },
];
