import { useState, useEffect } from "react";
import { Plus, Calendar, AlertTriangle, Check, Trash2, X } from "lucide-react";
import { useBusiness } from "@/features/settings/useBusiness";
import { planningService } from "./planningService";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Skeleton,
  EmptyState,
} from "@/components/ui";
import { formatCurrency } from "@/utils/currency";
import { formatDate, todayISO } from "@/utils/date";
import { normalizeError } from "@/lib/errors";
import { cn } from "@/lib/utils";

export default function PlanningPage() {
  const { business, isLoading: bizLoading } = useBusiness();

  const [planned, setPlanned] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueOn, setDueOn] = useState(todayISO());
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!business) return;
    try {
      setIsLoading(true);
      const [plannedData, alertData] = await Promise.all([
        planningService.getUpcoming(business.id),
        planningService.getActiveAlerts(business.id),
      ]);
      setPlanned(plannedData);
      setAlerts(alertData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      setError(null);
      setIsSaving(true);
      await planningService.createPlannedExpense({
        businessId: business.id,
        name,
        amount: amt,
        dueOn,
        note,
      });
      // Reset form
      setName("");
      setAmount("");
      setNote("");
      setDueOn(todayISO());
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await planningService.markAsPaid(id);
      await loadData();
    } catch (err) {
      alert(normalizeError(err).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this planned expense?")) return;
    try {
      await planningService.deletePlannedExpense(id);
      await loadData();
    } catch (err) {
      alert(normalizeError(err).message);
    }
  };

  const handleDismissAlert = async (id: string) => {
    try {
      await planningService.dismissAlert(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (bizLoading || isLoading)
    return <Skeleton className="h-96 w-full max-w-3xl mx-auto" />;

  const totalPlanned = planned.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Cash Alerts & Planning"
        description="Plan for restocking, bills, and upcoming expenses."
        actions={
          <Button
            onClick={() => setShowForm(!showForm)}
            leftIcon={<Plus className="h-4 w-4" />}>
            {showForm ? "Cancel" : "Add Planned Expense"}
          </Button>
        }
      />

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-navy-800 uppercase tracking-wider">
            Active Alerts
          </h2>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border",
                alert.severity === "critical"
                  ? "bg-red-50 border-red-200"
                  : "bg-amber-50 border-amber-200",
              )}>
              <AlertTriangle
                className={cn(
                  "h-5 w-5 mt-0.5 shrink-0",
                  alert.severity === "critical"
                    ? "text-red-600"
                    : "text-amber-600",
                )}
              />
              <div className="flex-1">
                <h3
                  className={cn(
                    "text-sm font-semibold",
                    alert.severity === "critical"
                      ? "text-red-900"
                      : "text-amber-900",
                  )}>
                  {alert.title}
                </h3>
                <p
                  className={cn(
                    "text-sm mt-1",
                    alert.severity === "critical"
                      ? "text-red-800"
                      : "text-amber-800",
                  )}>
                  {alert.message}
                </p>
              </div>
              <button
                onClick={() => handleDismissAlert(alert.id)}
                className="text-text-muted hover:text-navy-900 p-1"
                aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <Card className="border-teal-200 bg-teal-50/30">
          <CardHeader>
            <CardTitle>New Planned Expense</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5">
                    Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Restock Rice"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5">
                    Amount (GH₵)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={dueOn}
                    onChange={(e) => setDueOn(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5">
                    Note (Optional)
                  </label>
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Any details..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  Save Planned Expense
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Planned Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Expenses</CardTitle>
          {planned.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-text-secondary">Total planned</p>
              <p className="font-semibold text-navy-900">
                {formatCurrency(totalPlanned)}
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {planned.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No planned expenses"
              description="Add upcoming bills, restocking, or payments so you can plan ahead."
              action={
                <Button
                  onClick={() => setShowForm(true)}
                  leftIcon={<Plus className="h-4 w-4" />}>
                  Add Planned Expense
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-border -mx-5">
              {planned.map((item) => {
                const isDueSoon =
                  new Date(item.due_on) <=
                  new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-5 py-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        isDueSoon
                          ? "bg-amber-100 text-amber-600"
                          : "bg-surface-subtle text-text-secondary",
                      )}>
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-navy-900 text-sm">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                        <span>Due {formatDate(item.due_on)}</span>
                        {isDueSoon && (
                          <span className="text-amber-600 font-medium">
                            • Due soon
                          </span>
                        )}
                      </div>
                      {item.note && (
                        <p className="text-xs text-text-muted mt-1 truncate">
                          {item.note}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-navy-900 text-sm">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMarkPaid(item.id)}
                        className="p-2 rounded-lg hover:bg-teal-50 text-text-secondary hover:text-teal-600"
                        title="Mark as paid">
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-text-secondary hover:text-red-600"
                        title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
