// List of navigation items.
import {
  FaGauge,
  FaClipboardList,
  FaLayerGroup,
  FaShieldHalved,
} from "react-icons/fa6";

export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: FaGauge },
  { to: "/reservations", label: "Reservations", icon: FaClipboardList },
  { to: "/overbooking", label: "Overbooking", icon: FaLayerGroup },
  { to: "/prediction", label: "Cancellation Prediction Demo", icon: FaShieldHalved },
];
