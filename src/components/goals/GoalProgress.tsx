'use client';

import { Plus, RefreshCw } from 'lucide-react';
import type { Database } from '@/types/supabase';

type Goal = Database['public']['Tables']['financial_goals']['Row'];

interface GoalProgressProps {
  isDarkMode: boolean;
  totalProgress: number;
  activeGoals: number;
  completedGoals: number;
  nextMilestone: Goal | undefined;
  onAddClick: () => void;
}

export default function GoalProgress({
  isDarkMode,
  totalProgress,
  activeGoals,
  completedGoals,
  nextMilestone,
  onAddClick,
}: GoalProgressProps) {
  return (
    <div className={`p-6 rounded-xl ${
      isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'
    } backdrop-blur-sm border ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    } shadow-sm`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Goal Progress</h2>
      </div>

      <div className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500 dark:text-gray-400">Overall Progress</span>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{totalProgress}%</span>
          </div>
          <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2">
            <div
              className="bg-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* Goal Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Goals</p>
            <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activeGoals}</p>
          </div>
          <div className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed Goals</p>
            <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{completedGoals}</p>
          </div>
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <div className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <p className="text-sm text-gray-500 dark:text-gray-400">Next Milestone</p>
            <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{nextMilestone.title}</p>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500 dark:text-gray-400">Progress</span>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {Math.round((nextMilestone.current_amount / nextMilestone.target_amount) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(nextMilestone.current_amount / nextMilestone.target_amount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 