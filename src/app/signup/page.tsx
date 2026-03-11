"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";
import ThemeToggle from "@/components/ThemeToggle";
import { useState, useEffect } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignupSuccess = () => {
    router.push("/verify-email");
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
            Join FinSight
          </h1>
          <p className="mt-1.5 text-sm text-[var(--finsight-secondary-text)]">
            Start your financial journey today
          </p>
        </div>

        <SignupForm onSuccess={handleSignupSuccess} />

        <p className="mt-6 text-center text-sm text-[var(--finsight-secondary-text)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--finsight-accent-blue)] transition-colors hover:underline"
          >
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-[var(--finsight-muted-text)] transition-colors hover:text-[var(--finsight-accent-blue)]"
          >
            ← Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
