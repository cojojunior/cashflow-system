import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/types/database";

type Business = Database["public"]["Tables"]["businesses"]["Row"];

export function useBusiness() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchBusiness() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get the first business the user is a member of
        const { data, error } = await supabase
          .from("business_members")
          .select("businesses (*)")
          .eq("user_id", user.id)
          .limit(1)
          .single();

        if (error) throw error;
        setBusiness(data.businesses);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBusiness();
  }, [user]);

  return { business, isLoading, error };
}
