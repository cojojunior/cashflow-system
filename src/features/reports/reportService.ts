import { supabase } from "@/lib/supabase";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export interface ReportFilters {
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
}

export const reportService = {
  /**
   * Fetches transactions for a period and calculates the opening balance.
   */
  async getPeriodReport(
    businessId: string,
    { startDate, endDate }: ReportFilters,
  ) {
   

    // 2. Fetch adjustments (opening balance + reconciliations) that occurred BEFORE startDate
    const { data: priorAdjustments, error: adjErr } = await supabase
      .from("cash_adjustments")
      .select("amount")
      .eq("business_id", businessId)
      .lt("occurred_on", startDate);
    if (adjErr) throw adjErr;

    // 3. Fetch transactions that occurred BEFORE startDate
    const { data: priorTransactions, error: priorTxErr } = await supabase
      .from("transactions")
      .select("amount, type")
      .eq("business_id", businessId)
      .eq("is_reversed", false)
      .lt("occurred_on", startDate);
    if (priorTxErr) throw priorTxErr;

    // 5. Calculate Opening Balance
    let openingBalance = 0;
    priorAdjustments?.forEach((a) => (openingBalance += Number(a.amount)));
    priorTransactions?.forEach((tx) => {
      openingBalance +=
        tx.type === "income" ? Number(tx.amount) : -Number(tx.amount);
    });
    // Transfers don't change total opening balance

    // 6. Fetch PERIOD transactions
    const { data: periodTransactions, error: periodTxErr } = await supabase
      .from("transactions")
      .select(
        `
        *,
        transaction_categories (name),
        financial_accounts (name)
      `,
      )
      .eq("business_id", businessId)
      .eq("is_reversed", false)
      .gte("occurred_on", startDate)
      .lte("occurred_on", endDate)
      .order("occurred_on", { ascending: true })
      .order("created_at", { ascending: true });
    if (periodTxErr) throw periodTxErr;

    // 7. Calculate Period Totals
    let totalIncome = 0;
    let totalExpenses = 0;
    periodTransactions?.forEach((tx) => {
      if (tx.type === "income") totalIncome += Number(tx.amount);
      if (tx.type === "expense") totalExpenses += Number(tx.amount);
    });

    const closingBalance = openingBalance + totalIncome - totalExpenses;

    return {
      openingBalance,
      closingBalance,
      totalIncome,
      totalExpenses,
      netCashFlow: totalIncome - totalExpenses,
      transactions: periodTransactions || [],
    };
  },

  getDateRangePreset(
    preset: "this_month" | "last_month" | "last_3_months",
  ): ReportFilters {
    const now = new Date();
    let start = startOfMonth(now);
    let end = endOfMonth(now);

    if (preset === "last_month") {
      const prev = subMonths(now, 1);
      start = startOfMonth(prev);
      end = endOfMonth(prev);
    } else if (preset === "last_3_months") {
      start = startOfMonth(subMonths(now, 2));
      end = endOfMonth(now);
    }

    return {
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
    };
  },
};
