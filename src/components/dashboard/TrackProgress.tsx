'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
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

interface TrackProgressProps {
  isDarkMode: boolean;
}

export default function TrackProgress({ isDarkMode }: TrackProgressProps) {
  const [goals, setGoals] = useState<ProfileGoal | null>(null);
  const [goalProgress, setGoalProgress] = useState<GoalProgress>({});
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return;

        // Fetch profile goals
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('financial_goals')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        
        if (profile.financial_goals) {
          setGoals(profile.financial_goals);
        }

        // Fetch goal progress
        const { data: progress, error: progressError } = await supabase
          .from('goal_progress')
          .select('*')
          .eq('user_id', user.id);

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

    fetchGoals();
  }, []);

  const calculateProgress = (goalName: string) => {
    const progress = goalProgress[goalName];
    if (!progress) return 0;
    return Math.min(Math.round((progress.current / progress.target) * 100), 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!goals) {
    return (
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="text-center py-4">
          <DollarSign className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
            No Goals Set
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Set up your financial goals in your profile.
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300"
          >
            Set Up Goals
            <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      </div>
    );
  }

  // Get the top 3 goals with highest progress
  const allGoals = [
    ...goals.short_term,
    ...goals.medium_term,
    ...goals.long_term
  ];

  const topGoals = allGoals
    .map(goal => ({
      name: goal,
      progress: calculateProgress(goal),
      data: goalProgress[goal]
    }))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
            <Target className={`w-4 h-4 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
          </div>
          <h2 className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Top Goals
          </h2>
        </div>
        <Link
          href="/goals"
          className={`text-xs font-medium ${
            isDarkMode 
              ? 'text-teal-400 hover:text-teal-300' 
              : 'text-teal-600 hover:text-teal-500'
          } transition-colors`}
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {topGoals.map((goal) => (
          <motion.div
            key={goal.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {goal.name}
              </h3>
              <span className={`text-xs font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {goal.progress}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-teal-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between mt-1.5 text-xs">
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {formatCurrency(goal.data?.current || 0)} / {formatCurrency(goal.data?.target || 0)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 