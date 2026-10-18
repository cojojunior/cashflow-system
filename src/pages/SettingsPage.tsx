import { useState, useEffect } from "react";
import { useBusiness } from "@/features/settings/useBusiness";
import { settingsService } from "@/services/settingsService";
import { accountService } from "@/services/accountService";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Skeleton,
} from "@/components/ui";
import { Plus, Wallet } from "lucide-react";

export default function SettingsPage() {
  // 1. Business Data
  const { business, isLoading } = useBusiness();

  // 2. Business Profile State
  const [name, setName] = useState(business?.name || "");
  const [threshold, setThreshold] = useState(
    business?.safe_cash_threshold || 0,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // 3. Account Management State
  const [accounts, setAccounts] = useState<any[]>([]);
  const [newAccName, setNewAccName] = useState("");
  const [newAccType, setNewAccType] = useState<
    "cash" | "mobile_money" | "bank"
  >("mobile_money");
  const [isAddingAcc, setIsAddingAcc] = useState(false);

  // 4. Sync form state when business loads
  useEffect(() => {
    if (business) {
      setName(business.name || "");
      setThreshold(business.safe_cash_threshold || 0);

      // Fetch accounts
      accountService
        .getAccounts(business.id)
        .then(setAccounts)
        .catch(console.error);
    }
  }, [business]);

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setIsSaving(true);
    setMessage(null);
    try {
      await settingsService.updateBusiness(business.id, {
        name,
        safe_cash_threshold: Number(threshold),
      });
      setMessage({ text: "Settings saved successfully.", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !newAccName) return;
    try {
      setIsAddingAcc(true);
      const newAcc = await settingsService.addAccount(
        business.id,
        newAccName,
        newAccType,
      );
      setAccounts([...accounts, newAcc]);
      setNewAccName("");
    } catch (err: any) {
      alert("Error adding account: " + err.message);
    } finally {
      setIsAddingAcc(false);
    }
  };

  if (isLoading) return <Skeleton className="h-96 w-full max-w-3xl" />;
  if (!business) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Settings"
        description="Manage your business preferences."
      />

      {message && (
        <div
          className={`p-4 rounded-lg text-sm border ${
            message.type === "success"
              ? "bg-teal-50 border-teal-200 text-teal-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
          {message.text}
        </div>
      )}

      {/* Business Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveBusiness} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1.5">
                Business Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1.5">
                Safe Cash Threshold (GH₵)
              </label>
              <p className="text-xs text-text-secondary mb-2">
                You will see an alert if your available cash drops below this
                amount.
              </p>
              <Input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                min="0"
                required
              />
            </div>

            <Button type="submit" isLoading={isSaving}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Currency */}
      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary mb-4">
            All amounts are displayed in Ghana Cedis. Currency cannot be changed
            once transactions exist.
          </p>
          <div className="p-3 bg-surface-subtle rounded-lg font-medium text-navy-900 w-fit">
            {business.currency} (GH₵)
          </div>
        </CardContent>
      </Card>

      {/* Financial Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-text-secondary">
            Manage your wallets. You can transfer money between these accounts.
          </p>

          {/* Existing Accounts List */}
          <div className="divide-y divide-border border border-border rounded-lg bg-surface-subtle">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-4 bg-white first:rounded-t-lg last:rounded-b-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-navy-900">
                      {acc.name}
                    </p>
                    <p className="text-xs text-text-secondary capitalize">
                      {acc.type.replace("_", " ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Account Form */}
          <form
            onSubmit={handleAddAccount}
            className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-4 border-t border-border">
            <div className="flex-1">
              <label className="block text-sm font-medium text-navy-800 mb-1.5">
                Account Name
              </label>
              <Input
                value={newAccName}
                onChange={(e) => setNewAccName(e.target.value)}
                placeholder="e.g. MTN MoMo"
                required
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="block text-sm font-medium text-navy-800 mb-1.5">
                Type
              </label>
              <select
                value={newAccType}
                onChange={(e) => setNewAccType(e.target.value as any)}
                className="block w-full h-11 rounded-lg border bg-white px-3.5 text-sm border-border focus:border-teal-500 focus:ring-2 focus:ring-teal-100">
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="bank">Bank</option>
              </select>
            </div>
            <Button
              type="submit"
              isLoading={isAddingAcc}
              leftIcon={<Plus className="h-4 w-4" />}>
              Add
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
