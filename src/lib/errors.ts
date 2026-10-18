/**
 * Normalize errors coming from Supabase or the network into a user-facing message.
 * Never expose raw Supabase error objects to the UI.
 */

export interface AppError {
  message: string;
  code?: string;
}

export function normalizeError(err: unknown): AppError {
  if (err instanceof Error) {
    return { message: err.message };
  }
  if (typeof err === "string") {
    return { message: err };
  }
  if (err && typeof err === "object" && "message" in err) {
    const e = err as { message?: unknown; code?: unknown };
    return {
      message:
        typeof e.message === "string" ? e.message : "Something went wrong.",
      code: typeof e.code === "string" ? e.code : undefined,
    };
  }
  return { message: "Something went wrong. Please try again." };
}

/** Friendly auth error messages for common Supabase auth errors. */
export function authErrorMessage(
  code: string | undefined,
  fallback = "Authentication failed.",
): string {
  switch (code) {
    case "invalid_credentials":
      return "Incorrect email or password.";
    case "email_not_confirmed":
      return "Please confirm your email before signing in. Check your inbox.";
    case "user_not_found":
      return "No account found with that email.";
    case "user_already_exists":
    case "email_exists":
      return "An account with that email already exists. Try signing in instead.";
    case "weak_password":
      return "Password is too weak. Use at least 8 characters with a mix of letters and numbers.";
    case "over_email_send_rate_limit":
      return "Too many attempts. Please wait a minute and try again.";
    case "same_password":
      return "New password must be different from the old one.";
    default:
      return fallback;
  }
}
