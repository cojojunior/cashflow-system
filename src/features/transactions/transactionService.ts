import { supabase } from "@/lib/supabase";
import type { TransactionFormValues } from "./transactionSchema";
import type { Database } from "@/types/database";

type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];

export const transactionService = {
  /**
   * Fetch transactions for a specific business.
   */
  async getTransactions(businessId: string, limit = 50) {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        transaction_categories (name, icon),
        financial_accounts (name)
      `,
      )
      .eq("business_id", businessId)
      .eq("is_reversed", false)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Reverses a transaction without deleting it.
   * 1. Marks the original as reversed.
   * 2. Creates a new opposing transaction (income -> expense, expense -> income).
   * 3. Links them together.
   */
  async reverseTransaction(
    businessId: string,
    originalTx: any,
    userId: string,
  ) {
    // 1. Mark original as reversed
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ is_reversed: true })
      .eq("id", originalTx.id);

    if (updateError) throw updateError;

    // 2. Create the opposing transaction
    const newType = originalTx.type === "income" ? "expense" : "income";
    const { data: newTx, error: insertError } = await supabase
      .from("transactions")
      .insert({
        business_id: businessId,
        account_id: originalTx.account_id,
        category_id: originalTx.category_id,
        type: newType,
        amount: originalTx.amount,
        occurred_on: new Date().toISOString().split("T")[0], // Today
        description: `Reversal: ${originalTx.description || "Transaction"}`,
        payment_method: originalTx.payment_method,
        notes: `Reversed original transaction from ${originalTx.occurred_on}`,
        created_by: userId,
        reversed_transaction_id: originalTx.id,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return newTx;
  },

  /**
   * Fetch the categories and accounts needed to populate the form dropdowns.
   */
  async getFormOptions(businessId: string) {
    const [accountsRes, categoriesRes] = await Promise.all([
      supabase
        .from("financial_accounts")
        .select("id, name, type")
        .eq("business_id", businessId)
        .eq("is_active", true),
      supabase
        .from("transaction_categories")
        .select("id, name, type")
        .eq("business_id", businessId),
    ]);

    if (accountsRes.error) throw accountsRes.error;
    if (categoriesRes.error) throw categoriesRes.error;

    return {
      accounts: accountsRes.data,
      categories: categoriesRes.data,
    };
  },

  /**
   * Create a new transaction. Supabase RLS ensures the user
   * can only write to businesses they belong to.
   */
  async createTransaction(
    businessId: string,
    userId: string,
    data: TransactionFormValues,
  ) {
    const payload: TransactionInsert = {
      business_id: businessId,
      created_by: userId,
      ...data,
    };

    const { data: result, error } = await supabase
      .from("transactions")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return result;
  },
};
