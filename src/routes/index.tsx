import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import TransactionsPage from "@/pages/TransactionsPage";
import LearnPage from "@/pages/LearnPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { ROUTES } from "@/constants/app";

export const router = createBrowserRouter([
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
  { path: "*", element: <NotFoundPage /> },
]);
