'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { LayoutDashboard, User, MessageSquare } from 'lucide-react';
import type { Database } from '@/types/supabase';
import { GoalsList } from './goals/GoalsList';
import GoalsHeader from './goals/GoalsHeader';
import GoalProgress from './goals/GoalProgress';
import { toast } from 'react-hot-toast';

interface ProfileGoal {
  short_term: string[];
  medium_term: string[];
  long_term: string[];
}

interface GoalProgressMap {
  [key: string]: {
    current: number;
    target: number;
    deadline: string;
  };
}

interface GoalsClientProps {
  userData?: unknown;
  profileData?: { financial_goals: ProfileGoal | null } | null;
  progressData?: unknown[];
}

export default function GoalsClient(props: GoalsClientProps = {}) {
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<ProfileGoal | null>(null);
  const [goalProgress, setGoalProgress] = useState<GoalProgressMap>({});
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function getUserSession() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error);
          return;
        }
        if (user) setUserId(user.id);
      } catch (error) {
        console.error('Error in getUserSession:', error);
      } finally {
        setIsLoading(false);
      }
    }
    getUserSession();
  }, [supabase.auth]);

  const fetchGoals = async () => {
    if (!userId) return;
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('financial_goals')
        .eq('id', userId)
        .single();
      if (profileError) throw profileError;
      if (profile?.financial_goals) setGoals(profile.financial_goals);

      const { data: progress, error: progressError } = await supabase
        .from('goal_progress')
        .select('*')
        .eq('user_id', userId);
      if (progressError) throw progressError;

      const progressMap = (progress || []).reduce((acc, curr) => ({
        ...acc,
        [curr.goal_name]: {
          current: curr.current_amount,
          target: curr.target_amount,
          deadline: curr.deadline,
        },
      }), {} as GoalProgressMap);
      setGoalProgress(progressMap);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchGoals();
  }, [userId]);

  const allGoals = goals
    ? [...(goals.short_term || []), ...(goals.medium_term || []), ...(goals.long_term || [])]
    : [];
  const totalProgress = allGoals.length > 0
    ? Math.round(
        allGoals.reduce((acc, goal) => {
          const p = goalProgress[goal];
          return acc + (p ? p.current / p.target : 0);
        }, 0) / allGoals.length * 100
      )
    : 0;
  const activeGoals = allGoals.filter((g) => {
    const p = goalProgress[g];
    return p && p.current < p.target;
  });
  const completedGoals = allGoals.filter((g) => {
    const p = goalProgress[g];
    return p && p.current >= p.target;
  });
  const nextMilestone = activeGoals.length > 0
    ? activeGoals.reduce((closest, current) => {
        const cP = goalProgress[closest];
        const curP = goalProgress[current];
        const cRatio = cP ? cP.current / cP.target : 0;
        const curRatio = curP ? curP.current / curP.target : 0;
        return curRatio > cRatio ? current : closest;
      })
    : undefined;

  const calculateTermProgress = (termGoals: string[]) => {
    if (termGoals.length === 0) return 0;
    const total = termGoals.reduce((acc, goal) => {
      const p = goalProgress[goal];
      return acc + (p ? p.current / p.target : 0);
    }, 0);
    return Math.round((total / termGoals.length) * 100);
  };
  const shortTermProgress = calculateTermProgress(goals?.short_term || []);
  const mediumTermProgress = calculateTermProgress(goals?.medium_term || []);
  const longTermProgress = calculateTermProgress(goals?.long_term || []);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--finsight-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--finsight-border)] border-t-[var(--finsight-accent-blue)]" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--finsight-bg)] p-4 text-center finsight-grid-bg">
        <h1 className="mb-4 text-2xl font-semibold text-[var(--finsight-primary-text)]">Welcome to FinSight</h1>
        <p className="mb-8 text-[var(--finsight-secondary-text)]">Please sign in to view and manage your financial goals.</p>
        <Link
          href="/login"
          className="rounded-lg bg-[var(--finsight-accent-blue)] px-6 py-3 text-white transition-colors hover:opacity-90"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--finsight-bg)] finsight-grid-bg">
      <header className="sticky top-0 z-40 border-b border-[var(--finsight-border)] bg-[var(--finsight-surface)]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-[var(--finsight-secondary-text)] transition-colors hover:text-[var(--finsight-accent-blue)]"
              >
                <LayoutDashboard className="h-6 w-6" />
              </Link>
              <Link
                href="/chat"
                className="text-[var(--finsight-secondary-text)] transition-colors hover:text-[var(--finsight-accent-blue)]"
              >
                <MessageSquare className="h-6 w-6" />
              </Link>
            </div>
            <Link
              href="/profile"
              className="text-[var(--finsight-secondary-text)] transition-colors hover:text-[var(--finsight-accent-blue)]"
            >
              <User className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <GoalsHeader onAddClick={() => {}} />

        <div className="mt-8">
          <GoalProgress
            totalProgress={totalProgress}
            shortTermProgress={shortTermProgress}
            mediumTermProgress={mediumTermProgress}
            longTermProgress={longTermProgress}
          />
        </div>

        <div className="mt-8">
          <GoalsList userId={userId} onGoalsUpdate={fetchGoals} />
        </div>
      </div>
    </div>
  );
}
