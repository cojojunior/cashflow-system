import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MOBILE_NAV } from "@/constants/navigation";

interface MobileNavProps {
  onAddClick: () => void;
}

export function MobileNav({ onAddClick }: MobileNavProps) {
  const location = useLocation();

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-border safe-bottom"
      aria-label="Mobile navigation">
      <ul className="grid grid-cols-5">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const isAdd = item.to === "#add";
          const isActive = isAdd
            ? false
            : location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));

          if (isAdd) {
            return (
              <li key={item.label}>
                <button
                  onClick={onAddClick}
                  className="w-full flex flex-col items-center justify-center gap-0.5 py-2.5 group"
                  aria-label="Add transaction">
                  <span className="w-11 h-11 -mt-5 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 group-active:scale-95 transition-transform">
                    <Icon className="h-6 w-6" strokeWidth={2.5} />
                  </span>
                  <span className="text-[11px] font-medium text-text-secondary mt-1">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          }

          return (
            <li key={item.label}>
              <NavLink
                to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors",
                  isActive ? "text-teal-600" : "text-text-secondary",
                )}>
                <Icon className={cn("h-5 w-5", isActive && "text-teal-600")} />
                <span className="text-[11px] font-medium">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
