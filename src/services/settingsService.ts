import { supabase } from "@/lib/supabase";

export const settingsService = {
  async updateBusiness(
    businessId: string,
    data: { name?: string; safe_cash_threshold?: number; location?: string },
  ) {
    const { error } = await supabase
      .from("businesses")
      .update(data)
      .eq("id", businessId);
    if (error) throw error;
  },

  async addAccount(
    businessId: string,
    name: string,
    type: "cash" | "mobile_money" | "bank",
  ) {
    const { data, error } = await supabase
      .from("financial_accounts")
      .insert({ business_id: businessId, name, type })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
