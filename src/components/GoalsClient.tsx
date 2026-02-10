'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from 'next-themes';
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

interface GoalProgress {
  [key: string]: {
    current: number;
    target: number;
    deadline: string;
  };
}

interface GoalsClientProps {
  userData?: any;
  profileData?: { financial_goals: any; } | null;
  progressData?: any[];
}

export default function GoalsClient(props: GoalsClientProps = {}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<ProfileGoal | null>(null);
  const [goalProgress, setGoalProgress] = useState<GoalProgress>({});
  const supabase = createClientComponentClient<Database>();

  // Handle theme hydration
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

        if (user) {
          setUserId(user.id);
        }
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
      // Fetch profile goals
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('financial_goals')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      
      if (profile.financial_goals) {
        setGoals(profile.financial_goals);
      }

      // Fetch goal progress
      const { data: progress, error: progressError } = await supabase
        .from('goal_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) throw progressError;
      
      // Convert progress array to object for easier access
      const progressMap = progress.reduce((acc, curr) => ({
        ...acc,
        [curr.goal_name]: {
          current: curr.current_amount,
          target: curr.target_amount,
          deadline: curr.deadline
        }
      }), {});
      
      setGoalProgress(progressMap);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchGoals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Calculate progress metrics
  const allGoals = goals ? [
    ...(goals.short_term || []),
    ...(goals.medium_term || []),
    ...(goals.long_term || [])
  ] : [];

  const totalProgress = allGoals.length > 0
    ? Math.round(allGoals.reduce((acc, goal) => {
        const progress = goalProgress[goal];
        return acc + (progress ? progress.current / progress.target : 0);
      }, 0) / allGoals.length * 100)
    : 0;

  const activeGoals = allGoals.filter(goal => {
    const progress = goalProgress[goal];
    return progress && progress.current < progress.target;
  });

  const completedGoals = allGoals.filter(goal => {
    const progress = goalProgress[goal];
    return progress && progress.current >= progress.target;
  });

  // Find next milestone (goal closest to completion)
  const nextMilestone = activeGoals.length > 0
    ? activeGoals.reduce((closest, current) => {
        const closestProgress = goalProgress[closest];
        const currentProgress = goalProgress[current];
        const closestRatio = closestProgress ? closestProgress.current / closestProgress.target : 0;
        const currentRatio = currentProgress ? currentProgress.current / currentProgress.target : 0;
        return currentRatio > closestRatio ? current : closest;
      })
    : undefined;

  // Calculate progress for each term type
  const calculateTermProgress = (termGoals: string[]) => {
    if (termGoals.length === 0) return 0;
    const totalProgress = termGoals.reduce((acc, goal) => {
      const progress = goalProgress[goal];
      return acc + (progress ? progress.current / progress.target : 0);
    }, 0);
    return Math.round((totalProgress / termGoals.length) * 100);
  };

  const shortTermProgress = calculateTermProgress(goals?.short_term || []);
  const mediumTermProgress = calculateTermProgress(goals?.medium_term || []);
  const longTermProgress = calculateTermProgress(goals?.long_term || []);

  // Don't render theme-specific classes until after hydration
  if (!mounted) {
    return null;
  }

  const isDarkMode = resolvedTheme === 'dark';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to FinSight</h1>
        <p className="text-gray-600 mb-8">Please sign in to view and manage your financial goals.</p>
        <button
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <div className={`sticky top-0 z-40 backdrop-blur-sm border-b ${
        isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-foreground hover:text-blue-600 transition-colors">
                <LayoutDashboard className="w-6 h-6" />
              </Link>
              <Link href="/chat" className="text-foreground hover:text-blue-600 transition-colors">
                <MessageSquare className="w-6 h-6" />
              </Link>
            </div>
            <Link href="/profile" className="text-foreground hover:text-blue-600 transition-colors">
              <User className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <GoalsHeader isDarkMode={isDarkMode} onAddClick={() => {}} />

        {/* Progress Section */}
        <div className="mt-8">
          <GoalProgress
            isDarkMode={isDarkMode}
            totalProgress={totalProgress}
            shortTermProgress={shortTermProgress}
            mediumTermProgress={mediumTermProgress}
            longTermProgress={longTermProgress}
          />
        </div>

        {/* Goals List */}
        <div className="mt-8">
          <GoalsList userId={userId} onGoalsUpdate={fetchGoals} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
} 