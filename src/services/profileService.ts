import { supabase } from "@/lib/supabase";

export const profileService = {
  async updateProfile(
    userId: string,
    data: { fullName: string; phone?: string },
  ) {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: data.fullName, phone: data.phone })
      .eq("id", userId);
    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async exportAllData(businessId: string) {
    // 1. Fetch all transactions
    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select(`*, transaction_categories(name), financial_accounts(name)`)
      .eq("business_id", businessId)
      .order("occurred_on", { ascending: false });
    if (txError) throw txError;

    // 2. Fetch all accounts
    const { data: accounts, error: accError } = await supabase
      .from("financial_accounts")
      .select("*")
      .eq("business_id", businessId);
    if (accError) throw accError;

    return { transactions, accounts };
  },
};
