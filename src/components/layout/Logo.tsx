import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants/app";

export function Logo({
  className,
  short = false,
}: {
  className?: string;
  short?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center shrink-0 shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-5 h-5 text-white"
          aria-hidden>
          <path
            d="M3 17L9 11L13 15L21 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 7H21V13"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {!short && (
        <span className="font-bold text-navy-900 text-base leading-tight">
          {APP_NAME.split(" ").slice(0, 2).join(" ")}
          <span className="block text-xs font-medium text-text-secondary">
            {APP_NAME.split(" ").slice(2).join(" ")}
          </span>
        </span>
      )}
    </div>
  );
}
