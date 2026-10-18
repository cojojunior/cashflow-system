import { createClient } from "@supabase/supabase-js";
import { env } from "./env";
import type { Database } from "@/types/database";

/**
 * Browser Supabase client. Uses the anon/public key only.
 * Never import the service-role key here — that must stay server-side.
 */
export const supabase = createClient<Database>(
  env.supabaseUrl,
  env.supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "sme-cashflow-auth",
      flowType: "pkce",
    },
    global: {
      headers: {
        "x-application-name": "sme-cashflow-manager",
      },
    },
  },
);
