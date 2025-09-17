'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, BookOpen, MessageSquare } from 'lucide-react';
import type { Database } from '@/types/supabase';
import { GoalsList } from './GoalsList';
import GoalsHeader from './GoalsHeader';
import GoalProgress from './GoalProgress';
import { useGoals } from './useGoals';
import { formatCurrency, formatDate, calculateProgress } from './utils';

export default function GoalsClient() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const supabase = createClientComponentClient<Database>();

  // Handle theme hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function getUserSession() {
      console.log('Getting user session...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (session?.user) {
          console.log('Session found, user ID:', session.user.id);
          setUserId(session.user.id);
        } else {
          console.log('No session found');
        }
      } catch (error) {
        console.error('Error in getUserSession:', error);
      } finally {
        setIsLoading(false);
      }
    }

    getUserSession();
  }, [supabase.auth]);

  const {
    goals,
    isAddModalOpen,
    setIsAddModalOpen,
    handleAddGoal,
    handleEditClick,
    handleSaveProgress,
    handleCancelEdit,
    handleDeleteGoal,
    handleEditValuesChange,
    handleNewGoalChange,
    newGoal,
    fetchGoals
  } = useGoals(userId || '', supabase);

  useEffect(() => {
    if (userId) {
      console.log('User ID available, fetching goals...');
      fetchGoals();
    }
  }, [fetchGoals, userId]);

  // Calculate progress metrics
  const allGoals = [
    ...(goals.short_term || []),
    ...(goals.medium_term || []),
    ...(goals.long_term || [])
  ];

  const totalProgress = allGoals.length > 0
    ? Math.round(allGoals.reduce((acc, goal) => acc + (goal.current_amount / goal.target_amount), 0) / allGoals.length * 100)
    : 0;

  const activeGoals = allGoals.filter(goal => goal.status === 'active');
  const completedGoals = allGoals.filter(goal => goal.status === 'completed');

  // Find next milestone (goal closest to completion)
  const nextMilestone = activeGoals.length > 0
    ? activeGoals.reduce((closest, current) => {
        const closestProgress = closest.current_amount / closest.target_amount;
        const currentProgress = current.current_amount / current.target_amount;
        return currentProgress > closestProgress ? current : closest;
      })
    : undefined;

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
        <GoalsHeader isDarkMode={isDarkMode} onAddClick={() => setIsAddModalOpen(true)} />

        {/* Progress Section */}
        <div className="mt-8">
          <GoalProgress
            isDarkMode={isDarkMode}
            totalProgress={totalProgress}
            activeGoals={activeGoals.length}
            completedGoals={completedGoals.length}
            nextMilestone={nextMilestone}
            onAddClick={() => setIsAddModalOpen(true)}
            onUpdateClick={() => {}}
          />
        </div>

        {/* Goals List */}
        <div className="mt-8">
          <GoalsList userId={userId} />
        </div>
      </div>
    </div>
  );
} 