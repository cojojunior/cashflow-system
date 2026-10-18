import { supabase } from "@/lib/supabase";

export const lessonService = {
  async getLessons() {
    const { data, error } = await supabase
      .from("financial_lessons")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed_at")
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  },

  async markAsComplete(userId: string, lessonId: string) {
    const { error } = await supabase.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" },
    );

    if (error) throw error;
  },
};
