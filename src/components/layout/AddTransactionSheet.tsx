import { useNavigate } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, X } from "lucide-react";
import { ROUTES } from "@/constants/app";
import { cn } from "@/lib/utils";

interface AddTransactionSheetProps {
  open: boolean;
  onClose: () => void;
}

export function AddTransactionSheet({
  open,
  onClose,
}: AddTransactionSheetProps) {
  const navigate = useNavigate();

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add transaction"
        className={cn(
          "relative w-full sm:max-w-md bg-white",
          "rounded-t-2xl sm:rounded-2xl shadow-xl",
          "p-5 pb-8 safe-bottom animate-in slide-in-from-bottom",
        )}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-navy-900">
            Add Transaction
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-surface-subtle"
            aria-label="Close">
            <X className="h-5 w-5 text-text-secondary" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => go(ROUTES.addIncome)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-teal-100 bg-teal-50 hover:border-teal-300 active:scale-[0.98] transition-all">
            <span className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center">
              <ArrowDownLeft className="h-6 w-6" />
            </span>
            <span className="text-sm font-semibold text-teal-700">Income</span>
            <span className="text-xs text-teal-600/80 text-center leading-tight">
              Money coming in
            </span>
          </button>

          <button
            onClick={() => go(ROUTES.addExpense)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-red-100 bg-red-50 hover:border-red-300 active:scale-[0.98] transition-all">
            <span className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center">
              <ArrowUpRight className="h-6 w-6" />
            </span>
            <span className="text-sm font-semibold text-red-700">Expense</span>
            <span className="text-xs text-red-600/80 text-center leading-tight">
              Money going out
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
