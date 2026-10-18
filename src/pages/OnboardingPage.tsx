import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { completeOnboarding } from "@/features/settings/onboardingService";
import { Input, Button, Card, CardContent } from "@/components/ui";
import { Logo } from "@/components/layout/Logo";
import { normalizeError } from "@/lib/errors";
import { ROUTES } from "@/constants/app";

const onboardingSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.string().min(2, "Business type is required"),
  location: z.string().min(2, "Location is required"),
  // Removed z.coerce to fix the TS type mismatch
  openingBalance: z.number().min(0, "Opening balance cannot be negative"),
  safeCashThreshold: z.number().min(0, "Threshold cannot be negative"),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  // Removed unused navigate

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      openingBalance: 0,
      safeCashThreshold: 100,
    },
  });

    const onSubmit = async (data: OnboardingForm) => {
      if (!user) {
        setError("You must be logged in to complete setup.");
        return;
      }

      try {
        setError(null);
        await completeOnboarding({
          ...data,
          userId: user.id, 
        });
        window.location.href = ROUTES.dashboard;
      } catch (err) {
        setError(normalizeError(err).message);
      }
    };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-surface-muted">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-navy-900 mb-2">
              Welcome to CashFlow!
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              Tell us about your business so we can set up your workspace.
            </p>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Business Name"
                placeholder="e.g. Mama's Provisions"
                error={errors.businessName?.message}
                {...register("businessName")}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Business Type"
                  placeholder="e.g. Retail, Food"
                  error={errors.businessType?.message}
                  {...register("businessType")}
                />
                <Input
                  label="Location"
                  placeholder="e.g. Ledzokuku"
                  error={errors.location?.message}
                  {...register("location")}
                />
              </div>

              <div className="p-4 bg-teal-50 rounded-lg border border-teal-100 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-teal-900 mb-1">
                    Starting Cash
                  </h3>
                  <p className="text-xs text-teal-800 mb-3">
                    How much cash do you currently have in the business? (GH₵)
                  </p>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    error={errors.openingBalance?.message}
                    // Tell React Hook Form to parse the input string into a number
                    {...register("openingBalance", { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-teal-900 mb-1">
                    Safety Threshold
                  </h3>
                  <p className="text-xs text-teal-800 mb-3">
                    At what cash amount should we warn you? (GH₵)
                  </p>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="100.00"
                    error={errors.safeCashThreshold?.message}
                    // Tell React Hook Form to parse the input string into a number
                    {...register("safeCashThreshold", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Complete Setup
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
