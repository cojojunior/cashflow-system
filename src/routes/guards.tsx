import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/app";
import { Loader2 } from "lucide-react";

export function AuthLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-muted gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      <p className="text-sm font-medium text-text-secondary">
        Loading your workspace...
      </p>
    </div>
  );
}

/**
 * Redirects to /login if not authenticated.
 * Redirects to /onboarding if authenticated but profile.onboarded is false.
 */
export function RequireAuth() {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoader />;
  if (!user)
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;

  // If logged in but no profile data yet (network delay), wait
  if (!profile) return <AuthLoader />;

  // If user hasn't finished onboarding, force them to it
  if (!profile.onboarded && location.pathname !== ROUTES.onboarding) {
    return <Navigate to={ROUTES.onboarding} replace />;
  }

  // If they are onboarded and try to visit onboarding, send to dashboard
  if (profile.onboarded && location.pathname === ROUTES.onboarding) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return <Outlet />;
}

/**
 * Prevents logged-in users from visiting login/register pages.
 */
export function RequireGuest() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <AuthLoader />;
  if (user) return <Navigate to={ROUTES.dashboard} replace />;

  return <Outlet />;
}
