import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
} from "lucide-react";
import { useBusiness } from "@/features/settings/useBusiness";
import { transactionService } from "@/services/transactionService";
import {
  PageHeader,
  Button,
  Card,
  Skeleton,
  EmptyState,
} from "@/components/ui";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { ROUTES } from "@/constants/app";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  const { business, isLoading: bizLoading } = useBusiness();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!business) return;
      try {
        setIsLoading(true);
        const data = await transactionService.getTransactions(business.id);
        setTransactions(data);
      } catch (err) {
        console.error("Failed to load transactions", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [business]);

  if (bizLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Record and track your daily income and expenses."
        actions={
          <div className="flex gap-2">
            <Link to={ROUTES.transfer}>
              <Button
                variant="outline"
                leftIcon={<ArrowRightLeft className="h-4 w-4 text-navy-900" />}>
                Transfer
              </Button>
            </Link>
            <Link to={ROUTES.addIncome}>
              <Button
                variant="outline"
                leftIcon={<ArrowDownLeft className="h-4 w-4 text-teal-600" />}>
                Add Income
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filters Placeholder (Phase 4 will add date filters) */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
          />
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={ArrowDownLeft}
            title="No transactions yet"
            description="Start recording your daily sales and expenses to see them here."
            action={
              <Link to={ROUTES.addIncome}>
                <Button>Record your first sale</Button>
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 hover:bg-surface-muted transition-colors">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      tx.type === "income"
                        ? "bg-teal-50 text-teal-600"
                        : "bg-red-50 text-red-600",
                    )}>
                    {tx.type === "income" ? (
                      <ArrowDownLeft className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-navy-900 text-sm">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                      <span>{formatDate(tx.occurred_on)}</span>
                      <span>•</span>
                      <span>
                        {tx.transaction_categories?.name || "Uncategorized"}
                      </span>
                      <span>•</span>
                      <span className="capitalize">
                        {tx.payment_method.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "font-semibold text-sm",
                      tx.type === "income" ? "text-teal-600" : "text-navy-900",
                    )}>
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {tx.financial_accounts?.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
