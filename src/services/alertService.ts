import { supabase } from "@/lib/supabase";

export const alertService = {
  /**
   * Creates a low balance alert if the current cash is below the threshold.
   * Won't create duplicate active alerts for the same issue.
   */
  async checkAndCreateLowBalanceAlert(
    businessId: string,
    currentCash: number,
    threshold: number,
  ) {
    if (currentCash >= threshold) return null;

    // Check if we already have an active low balance alert
    const { data: existing } = await supabase
      .from("cash_alerts")
      .select("id")
      .eq("business_id", businessId)
      .eq("alert_type", "low_balance")
      .eq("status", "active")
      .limit(1);

    if (existing && existing.length > 0) return null; // Already warned

    // Create the alert
    const { data, error } = await supabase
      .from("cash_alerts")
      .insert({
        business_id: businessId,
        alert_type: "low_balance",
        severity: "warning",
        title: "Low Cash Balance",
        message: `Your available cash is below your safety threshold of ${threshold}.`,
      })
      .select()
      .single();

    if (error) console.error("Failed to create low balance alert", error);
    return data;
  },
};
