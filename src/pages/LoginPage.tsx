import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "@/features/auth/authService";
import { Input, Button } from "@/components/ui";
import { ROUTES } from "@/constants/app";
import { Logo } from "@/components/layout/Logo";
import { normalizeError } from "@/lib/errors";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || ROUTES.dashboard;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null);
      await authService.signIn(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(normalizeError(err).message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-surface-muted">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-center mb-8">
        <Logo />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-border">
          <h2 className="text-xl font-bold text-navy-900 mb-6">
            Sign in to your account
          </h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-teal-600 hover:text-teal-500">
                Forgot your password?
              </Link>
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-text-secondary">Don't have an account? </span>
            <Link
              to={ROUTES.register}
              className="font-medium text-teal-600 hover:text-teal-500">
              Register your business
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
