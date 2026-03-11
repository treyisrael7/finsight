"use client";

import { useState, useEffect } from "react";
import { Target, DollarSign, ArrowRight } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface ProfileGoal {
  short_term: string[];
  medium_term: string[];
  long_term: string[];
}

interface GoalProgress {
  [key: string]: {
    current: number;
    target: number;
    deadline: string;
  };
}

export default function TrackProgress() {
  const [goals, setGoals] = useState<ProfileGoal | null>(null);
  const [goalProgress, setGoalProgress] = useState<GoalProgress>({});
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return;

        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("financial_goals")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (profile?.financial_goals) {
          setGoals(profile.financial_goals);
        }

        const { data: progress, error: progressError } = await supabase
          .from("goal_progress")
          .select("*")
          .eq("user_id", user.id);

        if (progressError) throw progressError;

        const progressMap = (progress || []).reduce(
          (acc, curr) => ({
            ...acc,
            [curr.goal_name]: {
              current: curr.current_amount,
              target: curr.target_amount,
              deadline: curr.deadline,
            },
          }),
          {} as GoalProgress
        );

        setGoalProgress(progressMap);
      } catch (error) {
        console.error("Error fetching goals:", error);
        toast.error("Failed to load goals");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const calculateProgress = (goalName: string) => {
    const progress = goalProgress[goalName];
    if (!progress) return 0;
    return Math.min(Math.round((progress.current / progress.target) * 100), 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-1/4 rounded bg-[var(--finsight-surface)] animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-lg bg-[var(--finsight-surface)] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!goals) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--finsight-border)] bg-[var(--finsight-surface)]">
          <DollarSign className="h-6 w-6 text-[var(--finsight-muted-text)]" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-[var(--finsight-primary-text)]">
          No goals set
        </h3>
        <p className="mt-1 text-sm text-[var(--finsight-secondary-text)]">
          Set up your financial goals in your profile.
        </p>
        <Link
          href="/profile"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--finsight-accent-blue)] transition-colors hover:underline"
        >
          Set up goals
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const allGoals = [
    ...goals.short_term,
    ...goals.medium_term,
    ...goals.long_term,
  ];

  const topGoals = allGoals
    .map((goal) => ({
      name: goal,
      progress: calculateProgress(goal),
      data: goalProgress[goal],
    }))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)]">
            <Target className="h-5 w-5 text-[var(--finsight-accent-blue)]" />
          </div>
          <h2 className="text-base font-semibold tracking-tight text-[var(--finsight-primary-text)]">
            Top goals
          </h2>
        </div>
        <Link
          href="/goals"
          className="text-sm font-medium text-[var(--finsight-secondary-text)] transition-colors hover:text-[var(--finsight-accent-blue)]"
        >
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {topGoals.map((goal) => (
          <motion.div
            key={goal.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)]/80 p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-[var(--finsight-primary-text)]">
                {goal.name}
              </h3>
              <span className="text-xs font-medium text-[var(--finsight-muted-text)]">
                {goal.progress}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--finsight-surface)]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${goal.progress}%`,
                  backgroundColor: "var(--finsight-accent-blue)",
                }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--finsight-secondary-text)]">
              {formatCurrency(goal.data?.current ?? 0)} /{" "}
              {formatCurrency(goal.data?.target ?? 0)}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
