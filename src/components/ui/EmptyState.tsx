import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6",
        className,
      )}>
      <div className="w-14 h-14 rounded-full bg-surface-subtle flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-text-muted" />
      </div>
      <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary mt-1 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
