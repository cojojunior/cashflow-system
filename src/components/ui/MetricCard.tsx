import { Card, CardContent } from "./Card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
  iconClassName,
}: MetricCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center bg-surface-subtle",
              iconClassName,
            )}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-navy-900">{value}</h3>
          {trend && (
            <p
              className={cn(
                "text-xs font-medium mt-1",
                trend.isPositive ? "text-teal-600" : "text-red-500",
              )}>
              {trend.value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
