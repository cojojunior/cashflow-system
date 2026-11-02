import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth, RequireGuest } from "./guards";

// Import from features
import DashboardPage from "@/features/dashboard/DashboardPage";
import TransactionsPage from "@/features/transactions/TransactionsPage";
import AddTransactionPage from "@/features/transactions/AddTransactionPage";
import InsightsPage from "@/features/insights/InsightsPage";
import ReportsPage from "@/features/reports/ReportsPage";
import LearnPage from "@/features/lessons/LearnPage";
import LessonDetailPage from "@/features/lessons/LessonDetailPage";
import PlanningPage from "@/features/alerts/PlanningPage";
import TransferPage from "@/features/accounts/TransferPage";

// Auth/Global pages
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import OnboardingPage from "@/pages/OnboardingPage";
import NotFoundPage from "@/pages/NotFoundPage";

import { ROUTES } from "@/constants/app";

export const router = createBrowserRouter([
  // 1. Public routes
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
      { path: ROUTES.onboarding, element: <OnboardingPage /> },

      // Main app routes
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.dashboard} replace /> },
          { path: "dashboard", element: <DashboardPage /> },

          // Transactions
          { path: "transactions", element: <TransactionsPage /> },

          // Add Transaction (Dynamic) - Handles /transactions/income/new and /transactions/expense/new
          { path: "transactions/:type/new", element: <AddTransactionPage /> },
          { path: "transactions/new", element: <AddTransactionPage /> }, // Fallback if type is omitted

          // Other Features
          { path: "transfer", element: <TransferPage /> },
          { path: "planning", element: <PlanningPage /> },
          { path: "insights", element: <InsightsPage /> },
          { path: "reports", element: <ReportsPage /> },
          { path: "learn", element: <LearnPage /> },
          { path: "learn/:slug", element: <LessonDetailPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },

  // 3. Catch-all
  { path: "*", element: <NotFoundPage /> },
]);
