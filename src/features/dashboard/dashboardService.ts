import { supabase } from "@/lib/supabase";

export interface DashboardMetrics {
  currentCash: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  recentTransactions: any[];
  chartData: any[];
  categoryBreakdown: any[];
}

export const dashboardService = {
  async getDashboardData(businessId: string) {
    // 1. Fetch accounts (to get opening balances)
    const { data: accounts, error: accErr } = await supabase
      .from("financial_accounts")
      .select("id, name, type")
      .eq("business_id", businessId)
      .eq("is_active", true);

    if (accErr) throw accErr;

    // 2. Fetch opening balances (adjustments)
    const { data: adjustments, error: adjErr } = await supabase
      .from("cash_adjustments")
      .select("*")
      .eq("business_id", businessId);

    if (adjErr) throw adjErr;

    // 3. Fetch transactions (last 30 days for chart, and all for totals)
    // For a real app, you'd want a date range filter. We'll do last 30 days for the chart.
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: transactions, error: txErr } = await supabase
      .from("transactions")
      .select(
        `
        *,
        transaction_categories (name, id),
        financial_accounts (name)
      `,
      )
      .eq("business_id", businessId)
      .eq("is_reversed", false)
      .gte("occurred_on", thirtyDaysAgo.toISOString().split("T")[0])
      .order("occurred_on", { ascending: true });

    if (txErr) throw txErr;

    // 4. Fetch Transfers (needed to correctly adjust account balances)
    const { data: transfers, error: trErr } = await supabase
      .from("account_transfers")
      .select("*")
      .eq("business_id", businessId)
      .eq("status", "completed");

    if (trErr) throw trErr;

    return this.calculateMetrics(
      accounts,
      adjustments,
      transactions,
      transfers,
    );
  },

  calculateMetrics(
    accounts: any[],
    adjustments: any[],
    transactions: any[],
    transfers: any[],
  ): DashboardMetrics {
    let currentCash = 0;
    let totalIncome = 0;
    let totalExpenses = 0;

    // 1. Calculate Balance per account
    const accountBalances: Record<string, number> = {};
    accounts.forEach((a) => {
      accountBalances[a.id] = 0;
    });

    // Apply opening balances (adjustments)
    adjustments.forEach((adj) => {
      if (accountBalances[adj.account_id] !== undefined) {
        accountBalances[adj.account_id] += Number(adj.amount);
      }
    });

    // Apply transactions
    transactions.forEach((tx) => {
      const amt = Number(tx.amount);
      if (tx.type === "income") {
        totalIncome += amt;
        if (accountBalances[tx.account_id] !== undefined)
          accountBalances[tx.account_id] += amt;
      } else if (tx.type === "expense") {
        totalExpenses += amt;
        if (accountBalances[tx.account_id] !== undefined)
          accountBalances[tx.account_id] -= amt;
      }
    });

    // Apply transfers (does NOT affect total cash, just shifts between accounts)
    transfers.forEach((tr) => {
      const amt = Number(tr.amount);
      if (accountBalances[tr.from_account_id] !== undefined)
        accountBalances[tr.from_account_id] -= amt;
      if (accountBalances[tr.to_account_id] !== undefined)
        accountBalances[tr.to_account_id] += amt;
    });

    // Sum up current cash
    currentCash = Object.values(accountBalances).reduce(
      (sum, val) => sum + val,
      0,
    );

    // 2. Group transactions for the Chart (Daily Income vs Expense)
    const dailyData: Record<
      string,
      { date: string; income: number; expense: number }
    > = {};

    // Initialize last 30 days with 0s so the chart looks continuous
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      dailyData[dateStr] = { date: dateStr, income: 0, expense: 0 };
    }

    transactions.forEach((tx) => {
      if (dailyData[tx.occurred_on]) {
        const amt = Number(tx.amount);
        if (tx.type === "income") dailyData[tx.occurred_on].income += amt;
        if (tx.type === "expense") dailyData[tx.occurred_on].expense += amt;
      }
    });

    const chartData = Object.values(dailyData).map((d) => ({
      ...d,
      // Format date for the chart x-axis: e.g. "17 Oct"
      formattedDate: new Date(d.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
    }));

    // 3. Expense Category Breakdown
    const catBreakdown: Record<string, { name: string; value: number }> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((tx) => {
        const catName = tx.transaction_categories?.name || "Other";
        if (!catBreakdown[catName])
          catBreakdown[catName] = { name: catName, value: 0 };
        catBreakdown[catName].value += Number(tx.amount);
      });
    const categoryBreakdown = Object.values(catBreakdown).sort(
      (a, b) => b.value - a.value,
    );

    // 4. Recent Transactions (just the last 5 sorted by date descending)
    // Assuming `transactions` was ordered by date ascending, we reverse it
    const recentTransactions = [...transactions].reverse().slice(0, 5);

    return {
      currentCash,
      totalIncome,
      totalExpenses,
      netCashFlow: totalIncome - totalExpenses,
      recentTransactions,
      chartData,
      categoryBreakdown,
    };
  },
};
