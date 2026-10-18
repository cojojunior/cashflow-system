import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightLeft, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBusiness } from "@/features/settings/useBusiness";
import { accountService } from "@/features/accounts/accountService";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Input,
  Skeleton,
} from "@/components/ui";
import { normalizeError } from "@/lib/errors";
import { ROUTES } from "@/constants/app";
import { todayISO } from "@/utils/date";

export default function TransferPage() {
  const { user } = useAuth();
  const { business, isLoading: bizLoading } = useBusiness();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState("Fund transfer");

  useEffect(() => {
    async function loadAccounts() {
      if (!business) return;
      try {
        const data = await accountService.getAccounts(business.id);
        setAccounts(data);
        if (data.length >= 2) {
          setFromAccount(data[0].id);
          setToAccount(data[1].id);
        }
      } catch (err) {
        setError(normalizeError(err).message);
      } finally {
        setIsLoading(false);
      }
    }
    loadAccounts();
  }, [business]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !user) return;

    if (fromAccount === toAccount) {
      setError("You cannot transfer to the same account.");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await accountService.createTransfer(
        {
          businessId: business.id,
          fromAccountId: fromAccount,
          toAccountId: toAccount,
          amount: numericAmount,
          date,
          description: description || "Internal Transfer",
        },
        user.id,
      );

      navigate(ROUTES.transactions);
    } catch (err) {
      setError(normalizeError(err).message);
      setIsSubmitting(false);
    }
  };

  if (bizLoading || isLoading)
    return <Skeleton className="h-96 w-full max-w-2xl mx-auto" />;

  if (accounts.length < 2) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-navy-900 mb-2">
          Not enough accounts
        </h2>
        <p className="text-text-secondary mb-6">
          You need at least two accounts to make a transfer.
        </p>
        <Button onClick={() => navigate(ROUTES.settings)}>
          Manage Accounts in Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(ROUTES.transactions)}
        className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-navy-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Transactions
      </button>

      <PageHeader
        title="Transfer Money"
        description="Move cash between your wallets without affecting your total income or expenses."
      />

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Input */}
            <div className="bg-navy-50 p-6 rounded-xl border border-navy-100 text-center">
              <label className="block text-sm font-medium text-navy-800 mb-2">
                Amount to Transfer (GH₵)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full bg-transparent text-center text-4xl font-bold text-navy-900 placeholder:text-navy-300 outline-none"
                placeholder="0.00"
                required
              />
            </div>

            {/* Account Selectors */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-navy-800 mb-1.5">
                  From Account
                </label>
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="block w-full h-11 rounded-lg border bg-white px-3.5 text-sm border-border focus:border-teal-500 focus:ring-2 focus:ring-teal-100">
                  {accounts.map((a) => (
                    <option
                      key={a.id}
                      value={a.id}
                      disabled={a.id === toAccount}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="shrink-0 bg-surface-subtle p-3 rounded-full mt-6 hidden sm:block">
                <ArrowRightLeft className="h-5 w-5 text-text-secondary" />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-navy-800 mb-1.5">
                  To Account
                </label>
                <select
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="block w-full h-11 rounded-lg border bg-white px-3.5 text-sm border-border focus:border-teal-500 focus:ring-2 focus:ring-teal-100">
                  {accounts.map((a) => (
                    <option
                      key={a.id}
                      value={a.id}
                      disabled={a.id === fromAccount}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1.5">
                  Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1.5">
                  Description
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Moved to MoMo"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(ROUTES.transactions)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Confirm Transfer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
