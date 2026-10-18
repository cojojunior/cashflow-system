/**
 * Runtime validation of environment variables.
 * Fails fast in development so misconfigurations don't sneak into runtime.
 */

const requiredEnvVars = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
] as const;

type EnvVar = (typeof requiredEnvVars)[number];

function getEnvVar(key: EnvVar): string {
  const value = import.meta.env[key];
  if (!value || typeof value !== "string" || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Copy .env.example to .env.local and fill in your Supabase credentials.`,
    );
  }
  return value;
}

export const env = {
  supabaseUrl: getEnvVar("VITE_SUPABASE_URL"),
  supabaseAnonKey: getEnvVar("VITE_SUPABASE_ANON_KEY"),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
