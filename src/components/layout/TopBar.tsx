import { Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { Logo } from "./Logo";

interface TopBarProps {
  onMenuClick: () => void;
  onAddClick: () => void;
}

export function TopBar({onAddClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border safe-top">
      {" "}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
        {" "}
        <div className="flex items-center gap-3">
          {/* Logo only on mobile - no hamburger */}
          <div className="lg:hidden">
            <Logo short />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={onAddClick}
            className="hidden sm:inline-flex">
            Add Transaction
          </Button>
          <div className="hidden sm:block h-8 w-8 rounded-full bg-navy-800 text-white text-xs font-semibold flex items-center justify-center">
            SB
          </div>
        </div>
      </div>
    </header>
  );
}
