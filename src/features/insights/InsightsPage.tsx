import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRightLeft,
  AlertCircle,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useBusiness } from "@/features/settings/useBusiness";
import { insightsService, type InsightMetrics } from "./insightsService";
import {
  PageHeader,
  Card,
  CardContent,
  Skeleton,
  EmptyState,
  Button,
} from "@/components/ui";
import { formatCurrency } from "@/utils/currency";
import { cn } from "@/lib/utils";

export default function InsightsPage() {
  const { business, isLoading: bizLoading } = useBusiness();
  const [data, setData] = useState<InsightMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!business) return;
      try {
        setIsLoading(true);
        const insights = await insightsService.getInsights(business.id);
        setData(insights);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [business]);

  if (bizLoading || isLoading)
    return <Skeleton className="h-96 w-full max-w-3xl mx-auto" />;

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader
          title="Financial Insights"
          description="Understand your business patterns."
        />
        <EmptyState
          icon={Wallet}
          title="Not enough data yet"
          description="Record some income and expenses to see your insights."
          action={
            <Button onClick={() => (window.location.href = "/transactions")}>
              Add a Transaction
            </Button>
          }
        />
      </div>
    );
  }

  const hasData =
    data.incomeComparison.current > 0 || data.expenseComparison.current > 0;

  const renderComparison = (
    previous: number,
    percent: number,
    isIncome: boolean,
  ) => {
    const isPositive = isIncome ? percent > 0 : percent < 0;
    const isNeutral = percent === 0;

    return (
      <div className="flex items-center gap-2 mt-2">
        {isNeutral ? (
          <Minus className="h-4 w-4 text-text-muted" />
        ) : isPositive ? (
          <TrendingUp className="h-4 w-4 text-teal-600" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
        <span
          className={cn(
            "text-sm font-medium",
            isNeutral
              ? "text-text-muted"
              : isPositive
                ? "text-teal-600"
                : "text-red-500",
          )}>
          {Math.abs(percent).toFixed(1)}%{" "}
          {percent > 0 ? "increase" : "decrease"}
        </span>
        <span className="text-xs text-text-secondary">
          vs {formatCurrency(previous)} last month
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Financial Insights"
        description="Understand your business patterns and plan ahead."
      />

      {/* Top Category */}
      <Card className="bg-navy-900 text-white border-none">
        <CardContent className="p-6">
          <p className="text-sm font-medium text-teal-300 mb-1">
            Your Top Expense This Month
          </p>
          {data.topExpenseCategory ? (
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {data.topExpenseCategory.name}
                </h2>
                <p className="text-navy-200 mt-1">
                  Make sure you are budgeting for this.
                </p>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(data.topExpenseCategory.amount)}
              </p>
            </div>
          ) : (
            <p className="text-navy-200">
              No expenses recorded this month yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Month Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-text-secondary mb-1">
              Income This Month
            </p>
            <p className="text-2xl font-bold text-navy-900">
              {formatCurrency(data.incomeComparison.current)}
            </p>
            {renderComparison(
              data.incomeComparison.current,
              data.incomeComparison.percentChange,
              true,
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-text-secondary mb-1">
              Expenses This Month
            </p>
            <p className="text-2xl font-bold text-navy-900">
              {formatCurrency(data.expenseComparison.current)}
            </p>
            {renderComparison(
              data.expenseComparison.current,
              data.expenseComparison.percentChange,
              false,
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cash Runway Card - Uses ArrowRightLeft icon */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center shrink-0">
              <ArrowRightLeft className="h-5 w-5 text-navy-800" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-navy-900">
                Cash Flow Runway
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                Based on your current daily averages, here is how much you are
                netting over time.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase">
                    Per Day
                  </p>
                  <p className="text-lg font-bold text-navy-900 mt-1">
                    {formatCurrency(
                      data.averageDailyIncome - data.averageDailyExpense,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase">
                    Per Week
                  </p>
                  <p className="text-lg font-bold text-navy-900 mt-1">
                    {formatCurrency(
                      (data.averageDailyIncome - data.averageDailyExpense) * 7,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Averages & Projection */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-navy-900 mb-1">
              Daily Averages
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              Based on your activity this month.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-subtle rounded-lg">
                <p className="text-xs font-medium text-text-secondary uppercase">
                  Avg. Daily Income
                </p>
                <p className="text-lg font-bold text-teal-600 mt-1">
                  {formatCurrency(data.averageDailyIncome)}
                </p>
              </div>
              <div className="p-4 bg-surface-subtle rounded-lg">
                <p className="text-xs font-medium text-text-secondary uppercase">
                  Avg. Daily Expense
                </p>
                <p className="text-lg font-bold text-red-500 mt-1">
                  {formatCurrency(data.averageDailyExpense)}
                </p>
              </div>
            </div>
          </div>

          {hasData && (
            <div className="pt-6 border-t border-border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-navy-900">
                    7-Day Projection
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    If your current trends continue, your cash flow over the
                    next 7 days will be:
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold mt-2",
                      data.projectedCashFlow >= 0
                        ? "text-teal-600"
                        : "text-red-500",
                    )}>
                    {formatCurrency(data.projectedCashFlow)}
                  </p>
                  <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> This is an estimate, not
                    a guarantee.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
