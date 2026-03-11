"use client";

import { motion } from "framer-motion";
import { MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import LogoutButton from "@/components/auth/LogoutButton";
import TrackProgress from "@/components/dashboard/TrackProgress";

interface DashboardClientProps {
  user: SupabaseUser;
  profile: {
    full_name: string | null;
  } | null;
}

export default function DashboardClient({ user, profile }: DashboardClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--finsight-bg)] finsight-grid-bg">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 border-b border-[var(--finsight-border)] bg-[var(--finsight-surface)]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/dashboard"
              className="text-xl font-semibold tracking-tight text-[var(--finsight-primary-text)]"
            >
              FinSight
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm font-medium text-[var(--finsight-secondary-text)] transition-colors hover:text-[var(--finsight-accent-blue)]"
              >
                <User className="h-5 w-5" />
                Profile
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 rounded-xl border border-[var(--finsight-border)] bg-[var(--finsight-card)] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_0_0_1px_var(--finsight-border)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
        >
          <h1 className="text-xl font-semibold tracking-tight text-[var(--finsight-primary-text)]">
            Welcome back, {profile?.full_name || "User"}
          </h1>
          <p className="mt-1 text-sm text-[var(--finsight-secondary-text)]">
            Let&apos;s continue your financial journey together.
          </p>
        </motion.section>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Track progress */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-xl border border-[var(--finsight-border)] bg-[var(--finsight-card)] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_0_0_1px_var(--finsight-border)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
          >
            <TrackProgress />
          </motion.section>

          {/* Chat with AI */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-xl border border-[var(--finsight-border)] bg-[var(--finsight-card)] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_0_0_1px_var(--finsight-border)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)]">
                <MessageSquare className="h-5 w-5 text-[var(--finsight-accent-blue)]" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-[var(--finsight-primary-text)]">
                Chat with AI
              </h2>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)]/80 p-4">
                <h3 className="font-medium text-[var(--finsight-primary-text)]">
                  Get personalized advice
                </h3>
                <p className="mt-1 text-sm text-[var(--finsight-secondary-text)]">
                  Ask questions about your finances.
                </p>
              </div>
              <div className="rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)]/80 p-4">
                <h3 className="font-medium text-[var(--finsight-primary-text)]">
                  Financial planning
                </h3>
                <p className="mt-1 text-sm text-[var(--finsight-secondary-text)]">
                  Get help with your goals.
                </p>
              </div>
            </div>
            <Link
              href="/chat"
              className="mt-5 flex w-full items-center justify-center rounded-lg bg-[var(--finsight-accent-blue)] py-2.5 px-4 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              Start chat
            </Link>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
