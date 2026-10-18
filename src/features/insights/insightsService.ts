import { supabase } from "@/lib/supabase";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export interface InsightMetrics {
  topExpenseCategory: { name: string; amount: number } | null;
  incomeComparison: {
    current: number;
    previous: number;
    percentChange: number;
  };
  expenseComparison: {
    current: number;
    previous: number;
    percentChange: number;
  };
  averageDailyIncome: number;
  averageDailyExpense: number;
  projectedCashFlow: number; // Simple 7-day projection
}

export const insightsService = {
  async getInsights(businessId: string) {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // 1. Fetch transactions for the last 60 days
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select(
        `
        amount,
        type,
        occurred_on,
        transaction_categories (name)
      `,
      )
      .eq("business_id", businessId)
      .eq("is_reversed", false)
      .gte("occurred_on", format(lastMonthStart, "yyyy-MM-dd"))
      .lte("occurred_on", format(thisMonthEnd, "yyyy-MM-dd"));

    if (error) throw error;

    // 2. Calculate metrics
    let thisMonthIncome = 0;
    let thisMonthExpense = 0;
    let lastMonthIncome = 0;
    let lastMonthExpense = 0;

    const categoryTotals: Record<string, number> = {};

    transactions.forEach((tx) => {
      const amount = Number(tx.amount);
      const date = new Date(tx.occurred_on);

      const isThisMonth = date >= thisMonthStart && date <= thisMonthEnd;
      const isLastMonth = date >= lastMonthStart && date <= lastMonthEnd;

      if (tx.type === "income") {
        if (isThisMonth) thisMonthIncome += amount;
        if (isLastMonth) lastMonthIncome += amount;
      } else if (tx.type === "expense") {
        if (isThisMonth) {
          thisMonthExpense += amount;
          // Track categories for this month
          const catName = tx.transaction_categories?.name || "Uncategorized";
          categoryTotals[catName] = (categoryTotals[catName] || 0) + amount;
        }
        if (isLastMonth) lastMonthExpense += amount;
      }
    });

    // Find top expense category this month
    let topExpenseCategory = null;
    let maxAmount = 0;
    for (const [name, amount] of Object.entries(categoryTotals)) {
      if (amount > maxAmount) {
        maxAmount = amount;
        topExpenseCategory = { name, amount };
      }
    }

    // Calculate percent changes (handle divide by zero)
    const incomePercent =
      lastMonthIncome === 0
        ? thisMonthIncome > 0
          ? 100
          : 0
        : ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;

    const expensePercent =
      lastMonthExpense === 0
        ? thisMonthExpense > 0
          ? 100
          : 0
        : ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100;

    // Calculate daily averages (assuming 30 days for simplicity)
    const averageDailyIncome = thisMonthIncome / 30;
    const averageDailyExpense = thisMonthExpense / 30;

    // Simple projection: average daily net * 7 days
    const projectedCashFlow = (averageDailyIncome - averageDailyExpense) * 7;

    return {
      topExpenseCategory,
      incomeComparison: {
        current: thisMonthIncome,
        previous: lastMonthIncome,
        percentChange: incomePercent,
      },
      expenseComparison: {
        current: thisMonthExpense,
        previous: lastMonthExpense,
        percentChange: expensePercent,
      },
      averageDailyIncome,
      averageDailyExpense,
      projectedCashFlow,
    } as InsightMetrics;
  },
};
