import { formatCurrency } from "./currency";
import { formatDate } from "./date";

// 1. Update the interface to allow null values
interface ExportTransaction {
  occurred_on: string;
  type: string;
  description: string | null;
  transaction_categories?: { name: string } | null;
  financial_accounts?: { name: string } | null;
  amount: number;
}

/**
 * Generates a CSV file and triggers a browser download.
 */
export function downloadCSV(
  transactions: ExportTransaction[],
  filename: string,
) {
  const headers = [
    "Date",
    "Type",
    "Description",
    "Category",
    "Account",
    "Amount (GHS)",
  ];

  const rows = transactions.map((tx) => [
    tx.occurred_on,
    tx.type.toUpperCase(),
    // 2. Safely handle null description by falling back to an empty string
    `"${(tx.description || "").replace(/"/g, '""')}"`,
    tx.transaction_categories?.name || "Uncategorized",
    tx.financial_accounts?.name || "Unknown",
    tx.amount.toFixed(2),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n",
  );

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats a summary string for the print header.
 */
export function formatReportHeader(
  businessName: string,
  startDate: string,
  endDate: string,
  openingBalance: number,
  totalIncome: number,
  totalExpenses: number,
  closingBalance: number,
) {
  return {
    title: `Financial Report: ${formatDate(startDate)} to ${formatDate(endDate)}`,
    business: businessName,
    summary: [
      { label: "Opening Balance", value: formatCurrency(openingBalance) },
      { label: "Total Income", value: formatCurrency(totalIncome) },
      { label: "Total Expenses", value: formatCurrency(totalExpenses) },
      { label: "Closing Balance", value: formatCurrency(closingBalance) },
    ],
  };
}
