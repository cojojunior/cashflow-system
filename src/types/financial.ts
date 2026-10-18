export interface LedgerEntry {
  id: string;
  type: "income" | "expense" | "transfer_in" | "transfer_out" | "adjustment";
  amount: number;
  account_id: string;
  // ... other fields as needed
}

export interface AccountBalance {
  account_id: string;
  opening: number;
  inflows: number;
  outflows: number;
  current: number;
}

export interface BusinessSummary {
  totalCash: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
}
