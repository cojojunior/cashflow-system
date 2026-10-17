import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DESKTOP_NAV } from "@/constants/navigation";
import { Logo } from "./Logo";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-navy-950/50 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-border flex flex-col",
          "transition-transform duration-200 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Main navigation">
        <div className="h-16 flex items-center justify-between px-5 border-b border-border">
          <Logo />
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-subtle"
            aria-label="Close menu">
            <X className="h-5 w-5 text-text-secondary" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {DESKTOP_NAV.map((item) => (
            <SidebarLink
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              onClick={onClose}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="rounded-lg bg-navy-900 text-white p-4">
            <p className="text-xs text-teal-300 font-medium">Did you know?</p>
            <p className="text-sm mt-1 leading-snug">
              Cash in your account is different from profit. Track both.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-teal-50 text-teal-700"
            : "text-text-secondary hover:bg-surface-subtle hover:text-navy-900",
        )
      }>
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              "h-5 w-5",
              isActive ? "text-teal-600" : "text-text-muted",
            )}
          />
          {label}
        </>
      )}
    </NavLink>
  );
}

export { Sidebar as default };
