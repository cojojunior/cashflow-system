import { supabase } from "@/lib/supabase";
import { authErrorMessage, normalizeError } from "@/lib/errors";

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

export const authService = {
  async signUp({ email, password, fullName }: SignUpData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/login`, // Redirect after email confirmation
      },
    });
    if (error) throw new Error(authErrorMessage(error.code, error.message));
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(authErrorMessage(error.code, error.message));
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(normalizeError(error).message);
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) throw new Error(authErrorMessage(error.code, error.message));
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(authErrorMessage(error.code, error.message));
  },

  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },
};
