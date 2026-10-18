import { supabase } from "@/lib/supabase";

export interface CategoryInput {
  businessId: string;
  name: string;
  type: "income" | "expense" | "both";
}

export const categoryService = {
  /**
   * Fetch all categories for a business.
   */
  async getCategories(businessId: string) {
    const { data, error } = await supabase
      .from("transaction_categories")
      .select("*")
      .eq("business_id", businessId)
      .order("type", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    return data;
  },

  /**
   * Create a new category. Generates the slug from the name.
   */
  async createCategory(data: CategoryInput) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { data: newCat, error } = await supabase
      .from("transaction_categories")
      .insert({
        business_id: data.businessId,
        name: data.name,
        slug,
        type: data.type,
        is_system: false,
      })
      .select()
      .single();
    if (error) throw error;
    return newCat;
  },

  /**
   * Delete a category. Fails if the category has existing transactions.
   */
  async deleteCategory(id: string) {
    const { error } = await supabase
      .from("transaction_categories")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
