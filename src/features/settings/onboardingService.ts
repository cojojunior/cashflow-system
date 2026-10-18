import { supabase } from "@/lib/supabase";
import {
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
} from "@/constants/categories";

export interface OnboardingData {
  businessName: string;
  businessType: string;
  location: string;
  safeCashThreshold: number;
  openingBalance: number;
  userId: string;
}

export async function completeOnboarding(data: OnboardingData) {
  // 1. Ensure we have a valid session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Your session has expired. Please log in again.");
  }

  // 2. Create the business
  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .insert({
      name: data.businessName,
      owner_id: session.user.id,
      business_type: data.businessType,
      location: data.location,
      safe_cash_threshold: data.safeCashThreshold,
      currency: "GHS",
    })
    .select()
    .single();

  if (bizError)
    throw new Error(`Failed to create business: ${bizError.message}`);

  // 3. Create categories
  const categoriesToInsert = [
    ...DEFAULT_INCOME_CATEGORIES.map((c) => ({
      ...c,
      business_id: business.id,
    })),
    ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
      ...c,
      business_id: business.id,
    })),
  ];

  const { error: catError } = await supabase
    .from("transaction_categories")
    .insert(categoriesToInsert);

  if (catError)
    throw new Error(`Failed to create categories: ${catError.message}`);

  // 4. Create account
  const { data: account, error: accError } = await supabase
    .from("financial_accounts")
    .insert({
      business_id: business.id,
      name: "Cash Drawer",
      type: "cash",
    })
    .select()
    .single();

  if (accError)
    throw new Error(`Failed to create cash account: ${accError.message}`);

  // 5. Opening balance
  if (data.openingBalance > 0) {
    const { error: adjError } = await supabase.from("cash_adjustments").insert({
      business_id: business.id,
      account_id: account.id,
      amount: data.openingBalance,
      occurred_on: new Date().toISOString().split("T")[0],
      reason: "opening_balance",
      note: "Initial business setup",
      created_by: session.user.id,
    });

    if (adjError)
      throw new Error(`Failed to record opening balance: ${adjError.message}`);
  }

  // 6. Mark onboarded
  const { error: profError } = await supabase
    .from("profiles")
    .update({ onboarded: true })
    .eq("id", session.user.id);

  if (profError)
    throw new Error(`Failed to update profile: ${profError.message}`);

  return business;
}
