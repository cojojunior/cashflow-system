import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBusiness } from "@/features/settings/useBusiness";
import { transactionService } from "@/services/transactionService";
import {
  transactionSchema,
  type TransactionFormValues,
} from "@/schemas/transaction";
import {
  Input,
  Button,
  Card,
  CardContent,
  PageHeader,
  Skeleton,
} from "@/components/ui";
import { normalizeError } from "@/lib/errors";
import { ROUTES } from "@/constants/app";
import { PAYMENT_METHODS } from "@/constants/categories";
import { todayISO } from "@/utils/date";

export default function AddTransactionPage() {
  const { type } = useParams<{ type: "income" | "expense" }>();
  const isIncome = type === "income";

  const { user } = useAuth();
  const { business, isLoading: bizLoading } = useBusiness();
  const navigate = useNavigate();

  const [options, setOptions] = useState<{
    accounts: any[];
    categories: any[];
  }>({ accounts: [], categories: [] });
  const [error, setError] = useState<string | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: type || "income",
      occurred_on: todayISO(),
      payment_method: "cash",
      amount: 0,
    },
  });


  useEffect(() => {
    async function loadOptions() {
      if (!business) return;
      try {
        const data = await transactionService.getFormOptions(business.id);
        // Filter categories based on transaction type
        const filteredCategories = data.categories.filter(
          (c) => c.type === type || c.type === "both",
        );
        setOptions({ accounts: data.accounts, categories: filteredCategories });
      } catch (err) {
        setError(normalizeError(err).message);
      } finally {
        setIsLoadingOptions(false);
      }
    }
    loadOptions();
  }, [business, type]);

  const onSubmit = async (data: TransactionFormValues) => {
    if (!business || !user) return;
    try {
      setError(null);
      await transactionService.createTransaction(business.id, user.id, data);
      navigate(ROUTES.transactions);
    } catch (err) {
      setError(normalizeError(err).message);
    }
  };

  if (bizLoading || isLoadingOptions)
    return <Skeleton className="h-96 w-full" />;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(ROUTES.transactions)}
        className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-navy-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Transactions
      </button>

      <PageHeader
        title={isIncome ? "Record Income" : "Record Expense"}
        description={
          isIncome
            ? "Record a sale or other money coming in."
            : "Record a cost, stock purchase, or money going out."
        }
      />

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-navy-50 p-6 rounded-xl border border-navy-100 text-center">
              <label className="block text-sm font-medium text-navy-800 mb-2">
                Amount (GH₵)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="block w-full bg-transparent text-center text-4xl font-bold text-navy-900 placeholder:text-navy-300 outline-none"
                placeholder="0.00"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1.5">
                  Date
                </label>
                <Input
                  type="date"
                  error={errors.occurred_on?.message}
                  {...register("occurred_on")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1.5">
                  Category
                </label>
                <select
                  className="block w-full h-11 rounded-lg border bg-white px-3.5 text-sm border-border focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  {...register("category_id")}>
                  <option value="">Select a category...</option>
                  {options.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.category_id.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1.5">
                  Payment Method
                </label>
                <select
                  className="block w-full h-11 rounded-lg border bg-white px-3.5 text-sm border-border focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  {...register("payment_method")}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1.5">
                  Account
                </label>
                <select
                  className="block w-full h-11 rounded-lg border bg-white px-3.5 text-sm border-border focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  {...register("account_id")}>
                  <option value="">Select account...</option>
                  {options.accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                {errors.account_id && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.account_id.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1.5">
                Description
              </label>
              <Input
                placeholder={
                  isIncome
                    ? "e.g. Sold 2 bags of rice"
                    : "e.g. Bought stock from market"
                }
                error={errors.description?.message}
                {...register("description")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1.5">
                  Customer Ref (Optional)
                </label>
                <Input
                  placeholder="e.g. Invoice #123"
                  {...register("customer_reference")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1.5">
                  Notes (Optional)
                </label>
                <Input
                  placeholder="Any extra details..."
                  {...register("notes")}
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
              <Button
                type="submit"
                isLoading={isSubmitting}
                variant={isIncome ? "success" : "danger"}>
                Save {isIncome ? "Income" : "Expense"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
