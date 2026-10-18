export const APP_NAME = "SME CashFlow Manager";
export const APP_SHORT_NAME = "CashFlow";

export const DEFAULT_CURRENCY = "GHS";
export const DEFAULT_TIMEZONE = "Africa/Accra";
export const DEFAULT_LOCALE = "en-GH";

/** Route paths — single source of truth */
export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  transactions: "/transactions",
  income: "/transactions/income",
  expenses: "/transactions/expenses",
  addIncome: "/transactions/income/new",
  addExpense: "/transactions/expenses/new",
  learn: "/learn",
  insights: "/insights",
  reports: "/reports",
  settings: "/settings",
  login: "/login",
  register: "/register",
  onboarding: "/onboarding",
  transfer: "/transfer",
  planning: "/planning",
} as const;

export type RouteKey = keyof typeof ROUTES;
