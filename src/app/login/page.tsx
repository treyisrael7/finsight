"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import Link from "next/link";
import FormInput from "@/components/auth/FormInput";
import LoadingSpinner from "@/components/auth/LoadingSpinner";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Welcome back!", {
        duration: 2000,
        position: "top-center",
      });

      window.location.href = "/dashboard";
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred during login";
      console.error("Login error:", error);
      toast.error(message, {
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message.includes("User not found")) {
          toast.error("No account found with this email address", {
            duration: 3000,
            position: "top-center",
          });
        } else {
          throw error;
        }
        return;
      }

      toast.success("Password reset instructions sent to your email", {
        duration: 3000,
        position: "top-center",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset instructions";
      toast.error(message, {
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    supabase.auth.signOut().then(() => {
      window.location.replace("/");
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--finsight-bg)] finsight-grid-bg flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ThemeToggle />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-xl border border-[var(--finsight-border)] bg-[var(--finsight-card)] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),0_0_0_1px_var(--finsight-border)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.24)]"
      >
        <div className="text-center">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-[var(--finsight-primary-text)] hover:text-[var(--finsight-accent-blue)] transition-colors"
          >
            FinSight
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[var(--finsight-primary-text)]">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-[var(--finsight-secondary-text)]">
            Continue your financial journey
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <FormInput
            id="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            onChange={setEmail}
          />

          <FormInput
            id="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            onChange={setPassword}
          />

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--finsight-border)] bg-[var(--finsight-surface)] text-[var(--finsight-accent-blue)] focus:ring-[var(--finsight-accent-blue)]/30"
              />
              <span className="text-sm text-[var(--finsight-secondary-text)]">
                Remember me
              </span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isLoading}
              className="text-sm font-medium text-[var(--finsight-secondary-text)] transition-colors hover:text-[var(--finsight-accent-blue)] disabled:opacity-50"
            >
              Forgot password?
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-[var(--finsight-accent-blue)] py-3 px-4 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner />
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--finsight-secondary-text)]">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-[var(--finsight-accent-blue)] transition-colors hover:underline"
          >
            Sign up
          </Link>
        </p>

        <p className="mt-4 text-center">
          <a
            href="/"
            onClick={handleBackToHome}
            className="text-sm text-[var(--finsight-muted-text)] transition-colors hover:text-[var(--finsight-accent-blue)]"
          >
            ← Back to home
          </a>
        </p>
      </motion.div>
    </div>
  );
}
