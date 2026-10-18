import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  RotateCcw,
  ArrowRightLeft,
} from "lucide-react";
import { useBusiness } from "@/features/settings/useBusiness";
import { useAuth } from "@/hooks/useAuth";
import { transactionService } from "./transactionService";
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
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadData = async () => {
    if (!business) return;
    try {
      setIsLoading(true);
      const data = await transactionService.getTransactions(business.id, {
        search: searchTerm || undefined,
        type: filterType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setTransactions(data);
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (business) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business]);

  // Debounced filter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (business) loadData();
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterType, startDate, endDate]);

  const handleReverse = async (tx: any) => {
    if (!business || !user) return;
    if (
      !confirm(
        "Are you sure you want to reverse this transaction? A new opposing transaction will be created.",
      )
    )
      return;

    try {
      await transactionService.reverseTransaction(business.id, tx, user.id);
      await loadData();
    } catch (err: any) {
      alert("Failed to reverse: " + err.message);
    }
  };

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
            <Link to={ROUTES.addExpense}>
              <Button leftIcon={<ArrowUpRight className="h-4 w-4" />}>
                Add Expense
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-border space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search description or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="h-10 rounded-lg border border-border bg-white px-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none">
          <option value="all">All Types</option>
          <option value="income">Income Only</option>
          <option value="expense">Expenses Only</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
            title="Start Date"
          />
          <span className="text-text-muted text-sm">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
            title="End Date"
          />
        </div>

        {(searchTerm || filterType !== "all" || startDate || endDate) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterType("all");
              setStartDate("");
              setEndDate("");
            }}
            className="text-xs font-medium text-red-500 hover:text-red-700 h-10 px-2">
            Clear Filters
          </button>
        )}
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
            title="No transactions found"
            description={
              searchTerm || filterType !== "all" || startDate || endDate
                ? "Try adjusting your filters or search terms."
                : "Start recording your daily sales and expenses to see them here."
            }
            action={
              !(searchTerm || filterType !== "all" || startDate || endDate) ? (
                <Link to={ROUTES.addIncome}>
                  <Button>Record your first sale</Button>
                </Link>
              ) : undefined
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

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p
                      className={cn(
                        "font-semibold text-sm",
                        tx.type === "income"
                          ? "text-teal-600"
                          : "text-navy-900",
                      )}>
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {tx.financial_accounts?.name}
                    </p>
                  </div>

                  <button
                    onClick={() => handleReverse(tx)}
                    className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Reverse Transaction">
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
