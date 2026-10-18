import { supabase } from "@/lib/supabase";

export interface TransferData {
  businessId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  description: string;
}

export const accountService = {
  /**
   * Fetches all active accounts for a business.
   */
  async getAccounts(businessId: string) {
    const { data, error } = await supabase
      .from("financial_accounts")
      .select("id, name, type")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Creates a transfer between two accounts.
   * Note: RLS rules prevent creating a transfer where the accounts don't belong to the same business.
   */
  async createTransfer(data: TransferData, userId: string) {
    const { data: transfer, error } = await supabase
      .from("account_transfers")
      .insert({
        business_id: data.businessId,
        from_account_id: data.fromAccountId,
        to_account_id: data.toAccountId,
        amount: data.amount,
        occurred_on: data.date,
        description: data.description,
        status: "completed",
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return transfer;
  },
};
