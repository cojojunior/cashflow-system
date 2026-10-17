import {
  LayoutGrid,
  ArrowLeftRight,
  Plus,
  GraduationCap,
  Settings as SettingsIcon,
  BarChart3,
  FileText,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "./app";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

/** Mobile bottom nav — exactly 5 items per spec */
export const MOBILE_NAV: NavItem[] = [
  { label: "Home", to: ROUTES.dashboard, icon: LayoutGrid },
  { label: "Transactions", to: ROUTES.transactions, icon: ArrowLeftRight },
  { label: "Add", to: "#add", icon: Plus }, // opens the Add modal — handled in layout
  { label: "Learn", to: ROUTES.learn, icon: GraduationCap },
  { label: "Settings", to: ROUTES.settings, icon: SettingsIcon },
];

/** Desktop sidebar — richer set */
export const DESKTOP_NAV: NavItem[] = [
  { label: "Dashboard", to: ROUTES.dashboard, icon: LayoutGrid },
  { label: "Transactions", to: ROUTES.transactions, icon: ArrowLeftRight },
  { label: "Insights", to: ROUTES.insights, icon: TrendingUp },
  { label: "Reports", to: ROUTES.reports, icon: FileText },
  { label: "Learn", to: ROUTES.learn, icon: GraduationCap },
  { label: "Settings", to: ROUTES.settings, icon: SettingsIcon },
];

export const SIDEBAR_SECONDARY: NavItem[] = [
  { label: "Accounts", to: "/settings/accounts", icon: Wallet },
  { label: "Analytics", to: "/insights", icon: BarChart3 },
];
