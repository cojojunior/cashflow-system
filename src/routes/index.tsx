import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth, RequireGuest } from "./guards";
import DashboardPage from "@/pages/DashboardPage";
import TransactionsPage from "@/pages/TransactionsPage";
import LearnPage from "@/pages/LearnPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import OnboardingPage from "@/pages/OnboardingPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { ROUTES } from "@/constants/app";

export const router = createBrowserRouter([
  // 1. Public routes (redirects to dashboard if already logged in)
  {
    element: <RequireGuest />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.register, element: <RegisterPage /> },
    ],
  },

  // 2. Protected routes
  {
    element: <RequireAuth />,
    children: [
      // Onboarding gets its own standalone page 
      { path: ROUTES.onboarding, element: <OnboardingPage /> },

      // Main app routes (get the sidebar/nav layout)
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.dashboard} replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "transactions", element: <TransactionsPage /> },
          { path: "transactions/income", element: <TransactionsPage /> },
          { path: "transactions/expenses", element: <TransactionsPage /> },
          { path: "learn", element: <LearnPage /> },
          { path: "settings", element: <SettingsPage /> },
          { path: "insights", element: <DashboardPage /> },
          { path: "reports", element: <DashboardPage /> },
        ],
      },
    ],
  },

  // 3. Catch-all
  { path: "*", element: <NotFoundPage /> },
]);
