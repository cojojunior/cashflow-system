import type { AccountBalance } from "@/types/financial";
/**
 * Calculates the current balance for a single account.
 * Rule: current = opening + inflows - outflows
 */
export function calculateAccountBalance(
  opening: number,
  inflows: number,
  outflows: number,
): number {
  return Number((opening + inflows - outflows).toFixed(2));
}

/**
 * Aggregates multiple account balances into a business summary.
 * Rule: Transfers between accounts net to zero and should NOT affect the total cash.
 */
export function calculateBusinessSummary(balances: AccountBalance[]): {
  totalCash: number;
  openingTotal: number;
} {
  let openingTotal = 0;
  let totalCash = 0;

  for (const acc of balances) {
    openingTotal += acc.opening;
    totalCash += acc.current;
  }

  return {
    openingTotal: Number(openingTotal.toFixed(2)),
    totalCash: Number(totalCash.toFixed(2)),
  };
}

/**
 * Calculates Net Cash Flow from raw transaction amounts.
 * Note: This is NOT profit. It is purely the movement of cash.
 */
export function calculateNetCashFlow(
  totalIncome: number,
  totalExpenses: number,
): number {
  return Number((totalIncome - totalExpenses).toFixed(2));
}
