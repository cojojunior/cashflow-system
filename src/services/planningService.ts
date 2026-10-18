import { supabase } from "@/lib/supabase";

export interface PlannedExpenseInput {
  businessId: string;
  name: string;
  amount: number;
  dueOn: string; // yyyy-MM-dd
  note?: string;
}

export const planningService = {
  /**
   * Fetch upcoming planned expenses (not yet paid).
   */
  async getUpcoming(businessId: string) {
    const { data, error } = await supabase
      .from("planned_expenses")
      .select("*")
      .eq("business_id", businessId)
      .eq("is_paid", false)
      .order("due_on", { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Create a planned expense.
   */
  async createPlannedExpense(data: PlannedExpenseInput) {
    const { data: row, error } = await supabase
      .from("planned_expenses")
      .insert({
        business_id: data.businessId,
        name: data.name,
        amount: data.amount,
        due_on: data.dueOn,
        note: data.note || null,
        is_paid: false,
      })
      .select()
      .single();

    if (error) throw error;
    return row;
  },

  /**
   * Mark as paid (or delete).
   */
  async markAsPaid(id: string) {
    const { error } = await supabase
      .from("planned_expenses")
      .update({ is_paid: true })
      .eq("id", id);
    if (error) throw error;
  },

  async deletePlannedExpense(id: string) {
    const { error } = await supabase
      .from("planned_expenses")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  /**
   * Fetch active cash alerts for the business.
   */
  async getActiveAlerts(businessId: string) {
    const { data, error } = await supabase
      .from("cash_alerts")
      .select("*")
      .eq("business_id", businessId)
      .eq("status", "active")
      .order("triggered_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Dismiss an alert.
   */
  async dismissAlert(id: string) {
    const { error } = await supabase
      .from("cash_alerts")
      .update({ status: "dismissed", resolved_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },
};
