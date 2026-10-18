import { useEffect, useState } from "react";
import { FileDown, Printer } from "lucide-react";
import { useBusiness } from "@/features/settings/useBusiness";
import { reportService, type ReportFilters } from "./reportService";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Skeleton,
  EmptyState,
} from "@/components/ui";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { downloadCSV } from "@/utils/exportUtils";
import { format } from "date-fns";

export default function ReportsPage() {
  const { business, isLoading: bizLoading } = useBusiness();
  const [filters, setFilters] = useState<ReportFilters>(
    reportService.getDateRangePreset("this_month"),
  );
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      if (!business) return;
      try {
        setIsLoading(true);
        const reportData = await reportService.getPeriodReport(
          business.id,
          filters,
        );
        setData(reportData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [business, filters]);

  const handlePresetChange = (
    preset: "this_month" | "last_month" | "last_3_months",
  ) => {
    setFilters(reportService.getDateRangePreset(preset));
  };

  const handleCustomDate = (field: "startDate" | "endDate", value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleExportCSV = () => {
    if (!data || !business) return;
    const filename = `CashFlow_${business.name.replace(/\s+/g, "_")}_${filters.startDate}_to_${filters.endDate}`;
    downloadCSV(data.transactions, filename);
  };

  const handlePrint = () => {
    window.print();
  };

  if (bizLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      {/* Hide header/filters when printing */}
      <div className="no-print">
        <PageHeader
          title="Reports"
          description="Generate financial reports for tax, records, or analysis."
        />
      </div>

      <Card className="no-print">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleCustomDate("startDate", e.target.value)}
                className="h-10 rounded-lg border border-border px-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleCustomDate("endDate", e.target.value)}
                className="h-10 rounded-lg border border-border px-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetChange("this_month")}>
              This Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetChange("last_month")}>
              Last Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetChange("last_3_months")}>
              Last 3 Months
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : !data ? (
        <EmptyState
          icon={FileDown}
          title="Failed to load report"
          description="Please try again."
        />
      ) : (
        <div className="print-container bg-white rounded-xl border border-border p-6 sm:p-8">
          {/* Print Header */}
          <div className="border-b border-border pb-6 mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-navy-900">
                {business?.name}
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Report Period: {formatDate(filters.startDate)} —{" "}
                {formatDate(filters.endDate)}
              </p>
            </div>
            <div className="text-right no-print">
              <p className="text-xs text-text-muted">Generated</p>
              <p className="text-sm font-medium text-navy-900">
                {format(new Date(), "dd MMM yyyy, HH:mm")}
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-surface-subtle">
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                Opening Balance
              </p>
              <p className="text-lg font-bold text-navy-900">
                {formatCurrency(data.openingBalance)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-teal-50">
              <p className="text-xs font-medium text-teal-700 uppercase tracking-wider mb-1">
                Income
              </p>
              <p className="text-lg font-bold text-teal-700">
                {formatCurrency(data.totalIncome)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-red-50">
              <p className="text-xs font-medium text-red-600 uppercase tracking-wider mb-1">
                Expenses
              </p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(data.totalExpenses)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-navy-50">
              <p className="text-xs font-medium text-navy-800 uppercase tracking-wider mb-1">
                Closing Balance
              </p>
              <p className="text-lg font-bold text-navy-900">
                {formatCurrency(data.closingBalance)}
              </p>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">
              Transaction Details
            </h2>
            {data.transactions.length === 0 ? (
              <p className="text-sm text-text-secondary py-8 text-center border border-dashed border-border rounded-lg">
                No transactions recorded for this period.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-text-secondary uppercase bg-surface-subtle">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Date</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Account</th>
                      <th className="px-4 py-3 text-right">Income</th>
                      <th className="px-4 py-3 text-right rounded-tr-lg">
                        Expense
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.transactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-surface-muted">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(tx.occurred_on)}
                        </td>
                        <td className="px-4 py-3 font-medium text-navy-900">
                          {tx.description}
                        </td>
                        <td className="px-4 py-3">
                          {tx.transaction_categories?.name || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {tx.financial_accounts?.name}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-teal-600">
                          {tx.type === "income"
                            ? formatCurrency(tx.amount)
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-red-600">
                          {tx.type === "expense"
                            ? formatCurrency(tx.amount)
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Buttons (hidden in print) */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border no-print">
            <Button
              variant="outline"
              leftIcon={<Printer className="h-4 w-4" />}
              onClick={handlePrint}>
              Print / Save as PDF
            </Button>
            <Button
              leftIcon={<FileDown className="h-4 w-4" />}
              onClick={handleExportCSV}
              disabled={data.transactions.length === 0}>
              Download CSV
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
