import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/app";
import { Button } from "@/components/ui";
import { FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-navy-100 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="h-8 w-8 text-navy-800" />
        </div>
        <h1 className="text-2xl font-bold text-navy-900 mb-2">
          Page not found
        </h1>
        <p className="text-text-secondary mb-6 text-sm">
          We couldn't find the page you were looking for. It might have been
          moved or doesn't exist.
        </p>
        <Link to={ROUTES.dashboard}>
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
