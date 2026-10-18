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
  // 1. Create the business
  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .insert({
      name: data.businessName,
      owner_id: data.userId, // Put this back
      business_type: data.businessType,
      location: data.location,
      safe_cash_threshold: data.safeCashThreshold,
      currency: "GHS",
    })
    .select()
    .single();

  if (bizError)
    throw new Error(`Failed to create business: ${bizError.message}`);

  // 2. Create default categories
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

  // 3. Create the default "Cash Drawer" account
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

  // 4. Record the opening balance as a cash adjustment
  if (data.openingBalance > 0) {
    const { error: adjError } = await supabase.from("cash_adjustments").insert({
      business_id: business.id,
      account_id: account.id,
      amount: data.openingBalance,
      occurred_on: new Date().toISOString().split("T")[0], // today
      reason: "opening_balance",
      note: "Initial business setup",
      created_by: data.userId,
    });

    if (adjError)
      throw new Error(`Failed to record opening balance: ${adjError.message}`);
  }

  // 5. Mark user profile as onboarded
  const { error: profError } = await supabase
    .from("profiles")
    .update({ onboarded: true })
    .eq("id", data.userId);

  if (profError)
    throw new Error(`Failed to update profile: ${profError.message}`);

  return business;
}
