'use client';

import { Plus, RefreshCw } from 'lucide-react';
import type { Database } from '@/types/supabase';

type Goal = Database['public']['Tables']['financial_goals']['Row'];

interface GoalProgressProps {
  isDarkMode: boolean;
  totalProgress: number;
  shortTermProgress: number;
  mediumTermProgress: number;
  longTermProgress: number;
}

export default function GoalProgress({
  isDarkMode,
  totalProgress,
  shortTermProgress,
  mediumTermProgress,
  longTermProgress,
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

        {/* Term Progress */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Short Term</span>
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{shortTermProgress}%</span>
            </div>
            <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${shortTermProgress}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Medium Term</span>
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{mediumTermProgress}%</span>
            </div>
            <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${mediumTermProgress}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Long Term</span>
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{longTermProgress}%</span>
            </div>
            <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${longTermProgress}%` }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
} 