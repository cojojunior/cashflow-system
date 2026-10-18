import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useBusiness } from "@/features/settings/useBusiness";
import { dashboardService, type DashboardMetrics } from "./dashboardService";
import {
  PageHeader,
  Skeleton,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  EmptyState,
  Button,
} from "@/components/ui";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { ROUTES } from "@/constants/app";
import { cn } from "@/lib/utils";
import { alertService } from "../alerts/alertService";

const COLORS = [
  "#0d9a80",
  "#f59e0b",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#64748b",
];

export default function DashboardPage() {
  const { business, isLoading: bizLoading } = useBusiness();
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!business) return;
      try {
        setIsLoading(true);
        const metrics = await dashboardService.getDashboardData(business.id);
        setData(metrics);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }

      const metrics = await dashboardService.getDashboardData(business.id);
      setData(metrics);

      // Trigger alert check
      if (
        business.safe_cash_threshold > 0 &&
        metrics.currentCash < business.safe_cash_threshold
      ) {
        await alertService.checkAndCreateLowBalanceAlert(
          business.id,
          metrics.currentCash,
          business.safe_cash_threshold,
        );
      }
    }
    loadData();
  }, [business]);

  if (bizLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;
  }

  if (!data) return null;

  const isLowCash = business && data.currentCash < business.safe_cash_threshold;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={`Hello, ${business?.name}`}
        description="Here is your business at a glance."
        actions={
          <Link to={ROUTES.addIncome}>
            <Button>Record Sale</Button>
          </Link>
        }
      />

      {/* Cash Warning Alert */}
      {isLowCash && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-amber-900">
              Low Cash Warning
            </h3>
            <p className="text-sm text-amber-800 mt-1">
              Your available cash ({formatCurrency(data.currentCash)}) has
              dropped below your safety threshold (
              {formatCurrency(business.safe_cash_threshold)}). Consider
              collecting receivables or delaying non-essential expenses.
            </p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Available Cash"
          value={formatCurrency(data.currentCash)}
          icon={Wallet}
          iconClassName="bg-navy-100 text-navy-800"
        />
        <MetricCard
          title="Income (30d)"
          value={formatCurrency(data.totalIncome)}
          icon={TrendingUp}
          iconClassName="bg-teal-100 text-teal-700"
        />
        <MetricCard
          title="Expenses (30d)"
          value={formatCurrency(data.totalExpenses)}
          icon={TrendingDown}
          iconClassName="bg-red-100 text-red-600"
        />
        <MetricCard
          title="Net Cash Flow"
          value={formatCurrency(data.netCashFlow)}
          icon={ArrowRight}
          iconClassName="bg-amber-100 text-amber-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cash Flow Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient
                      id="colorIncome"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop offset="5%" stopColor="#0d9a80" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0d9a80" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorExpense"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="formattedDate"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickFormatter={(val) => `₵${val}`}
                    width={60}
                  />
                  <CartesianGrid
                    vertical={false}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: any) => [
                      formatCurrency(value as number),
                      undefined,
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#0d9a80"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Top Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {data.categoryBreakdown.length === 0 ? (
              <EmptyState
                icon={TrendingDown}
                title="No expenses yet"
                description="Your top expenses will appear here."
                className="py-8"
              />
            ) : (
              <>
                <div className="h-48 w-full mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value">
                        {data.categoryBreakdown.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) =>
                          formatCurrency(value as number)
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {data.categoryBreakdown.slice(0, 4).map((cat, i) => (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-text-secondary">{cat.name}</span>
                      </div>
                      <span className="font-medium text-navy-900">
                        {formatCurrency(cat.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Link
            to={ROUTES.transactions}
            className="text-sm font-medium text-teal-600 hover:text-teal-700">
            View All
          </Link>
        </CardHeader>
        <CardContent>
          {data.recentTransactions.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No transactions yet"
              description="Record your first sale to get started."
              action={
                <Link to={ROUTES.addIncome}>
                  <Button>Add Income</Button>
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-border -mx-5">
              {data.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="font-medium text-sm text-navy-900">
                      {tx.description}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatDate(tx.occurred_on)} •{" "}
                      {tx.transaction_categories?.name || "Uncategorized"}
                    </p>
                  </div>
                  <p
                    className={cn(
                      "font-semibold text-sm",
                      tx.type === "income" ? "text-teal-600" : "text-navy-900",
                    )}>
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
