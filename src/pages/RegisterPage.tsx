import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "@/features/auth/authService";
import { Input, Button } from "@/components/ui";
import { ROUTES } from "@/constants/app";
import { Logo } from "@/components/layout/Logo";
import { normalizeError } from "@/lib/errors";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError(null);
      await authService.signUp(data);
      setSuccess(true);
    } catch (err) {
      setError(normalizeError(err).message);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-surface-muted">
        <div className="max-w-md w-full bg-white p-8 rounded-xl border border-border text-center">
          <h2 className="text-xl font-bold text-navy-900 mb-2">
            Check your email
          </h2>
          <p className="text-text-secondary mb-6">
            We've sent a confirmation link to your email. Please verify your
            account to continue.
          </p>
          <Button onClick={() => navigate(ROUTES.login)} className="w-full">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-surface-muted">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-center mb-8">
        <Logo />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-border">
          <h2 className="text-xl font-bold text-navy-900 mb-6">
            Create your account
          </h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Full name"
              type="text"
              autoComplete="name"
              placeholder="Kwame Mensah"
              error={errors.fullName?.message}
              {...register("fullName")}
            />

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
              autoComplete="new-password"
              placeholder="At least 8 characters"
              error={errors.password?.message}
              {...register("password")}
            />

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Create account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-text-secondary">
              Already have an account?{" "}
            </span>
            <Link
              to={ROUTES.login}
              className="font-medium text-teal-600 hover:text-teal-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
