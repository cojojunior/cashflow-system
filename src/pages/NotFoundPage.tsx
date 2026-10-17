import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/app";
import { Button } from "@/components/ui";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-navy-900">404</p>
        <p className="text-text-secondary mt-2 mb-6">Page not found.</p>
        <Link to={ROUTES.dashboard}>
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
