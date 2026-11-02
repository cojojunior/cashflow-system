import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Calendar, Tag, Wallet, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBusiness } from "@/features/settings/useBusiness";
import { transactionService } from "./transactionService";
import {
  transactionSchema,
  type TransactionFormValues,
} from "./transactionSchema";
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
import { formatCurrency } from "@/utils/currency";
import { PAYMENT_METHODS } from "@/constants/categories";
import { todayISO } from "@/utils/date";
import { cn } from "@/lib/utils";

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
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: type || "income",
      occurred_on: todayISO(),
      payment_method: "cash",
      amount: undefined,
    },
  });

  const watchAmount = watch("amount");

  useEffect(() => {
    async function loadOptions() {
      if (!business) return;
      try {
        const data = await transactionService.getFormOptions(business.id);
        const filteredCategories = data.categories.filter(
          (c) => c.type === type || c.type === "both",
        );
        setOptions({ accounts: data.accounts, categories: filteredCategories });

        if (data.accounts.length > 0) {
          setValue("account_id", data.accounts[0].id);
        }
      } catch (err) {
        setError(normalizeError(err).message);
      } finally {
        setIsLoadingOptions(false);
      }
    }
    loadOptions();
  }, [business, type, setValue]);

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
    return <Skeleton className="h-96 w-full max-w-2xl mx-auto mt-8" />;

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <button
        onClick={() => navigate(ROUTES.transactions)}
        className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-navy-900 mb-6 transition-colors">
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

      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Giant Amount Input */}
            <div
              className={cn(
                "p-6 rounded-2xl text-center border-2 transition-colors",
                isIncome
                  ? "bg-teal-50 border-teal-100"
                  : "bg-red-50 border-red-100",
              )}>
              <label className="block text-sm font-medium text-navy-800 mb-2">
                Amount (GH₵)
              </label>
              <div className="relative">
                <span
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-bold",
                    isIncome ? "text-teal-600/30" : "text-red-500/30",
                  )}>
                  ₵
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  autoFocus
                  className={cn(
                    "block w-full bg-transparent text-center text-6xl font-bold outline-none placeholder:text-navy-200",
                    isIncome ? "text-teal-700" : "text-red-700",
                  )}
                  placeholder="0.00"
                  {...register("amount", { valueAsNumber: true })}
                />
              </div>
              {errors.amount && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-navy-800 mb-1.5">
                  <Tag className="h-4 w-4 text-text-muted" /> Category
                </label>
                <select
                  className="block w-full h-12 rounded-xl border bg-white px-3.5 text-base border-border focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-navy-800 mb-1.5">
                    <Calendar className="h-4 w-4 text-text-muted" /> Date
                  </label>
                  <Input
                    type="date"
                    className="h-12 text-base rounded-xl"
                    error={errors.occurred_on?.message}
                    {...register("occurred_on")}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-navy-800 mb-1.5">
                    <Wallet className="h-4 w-4 text-text-muted" /> Account
                  </label>
                  <select
                    className="block w-full h-12 rounded-xl border bg-white px-3.5 text-base border-border focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
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
                <label className="flex items-center gap-2 text-sm font-medium text-navy-800 mb-1.5">
                  <CreditCard className="h-4 w-4 text-text-muted" /> Payment
                  Method
                </label>
                <select
                  className="block w-full h-12 rounded-xl border bg-white px-3.5 text-base border-border focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
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
                  Description
                </label>
                <Input
                  className="h-12 text-base rounded-xl"
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
                    className="h-12 text-base rounded-xl"
                    placeholder="e.g. Invoice #123"
                    {...register("customer_reference")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5">
                    Notes (Optional)
                  </label>
                  <Input
                    className="h-12 text-base rounded-xl"
                    placeholder="Any extra details..."
                    {...register("notes")}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(ROUTES.transactions)}
                className="h-12">
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                variant={isIncome ? "success" : "danger"}
                className="h-12 text-base w-full sm:w-auto">
                Save {isIncome ? "Income" : "Expense"}{" "}
                {watchAmount > 0 ? `(${formatCurrency(watchAmount)})` : ""}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
