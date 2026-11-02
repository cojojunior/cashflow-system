import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex bg-white">
      {/* Left Column - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none">
            <path
              d="M0 100 L100 0 L100 100 Z"
              fill="currentColor"
              className="text-teal-500"
            />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500 text-white mb-6">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path
                d="M3 17L9 11L13 15L21 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 7H21V13"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Manage your cash flow <br />
            <span className="text-teal-400">with confidence.</span>
          </h1>
          <p className="text-navy-100 text-lg max-w-md">
            The simple, secure way for Ghanaian SMEs to track income, expenses,
            and grow their business.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-navy-200 text-sm">
            &copy; {new Date().getFullYear()} SME CashFlow Manager. Built for
            Ghana.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-navy-900">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>
            <div className="lg:hidden">
              <Logo short />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900">Welcome back</h2>
            <p className="text-sm text-text-secondary mt-1">
              Sign in to your account to continue.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
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

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] p-1 text-text-muted hover:text-text-secondary focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-teal-600 hover:text-teal-500">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-text-secondary">
            Don't have an account?{" "}
            <Link
              to={ROUTES.register}
              className="font-semibold text-teal-600 hover:text-teal-500">
              Register your business
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
