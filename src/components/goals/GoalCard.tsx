'use client';

import { Pencil, Trash2, Save, X } from 'lucide-react';
import { useState } from 'react';
import type { Database } from '@/types/supabase';
import { formatCurrency, formatDate, calculateProgress } from './utils';

type Goal = Database['public']['Tables']['financial_goals']['Row'];

interface GoalCardProps {
  goal: Goal;
  onEditClick: (goal: Goal) => void;
  onSaveProgress: (goalId: string) => void;
  onCancelEdit: () => void;
  onDeleteGoal: (goalId: string) => void;
  onEditValuesChange: (field: 'current_amount' | 'target_amount' | 'deadline', value: string | number) => void;
  editingGoal?: Goal | null;
  isDarkMode: boolean;
}

export default function GoalCard({
  goal,
  onEditClick,
  onSaveProgress,
  onCancelEdit,
  onDeleteGoal,
  onEditValuesChange,
  editingGoal,
  isDarkMode,
}: GoalCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const isEditing = goal.id === editingGoal?.id; // This will be controlled by the parent component

  const handleDeleteClick = () => {
    setIsDeleting(true);
  };

  const handleConfirmDelete = () => {
    onDeleteGoal(goal.id);
    setIsDeleting(false);
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
  };

  const progress = calculateProgress(goal.current_amount, goal.target_amount);

  return (
    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border border-border shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{goal.title}</h3>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => onSaveProgress(goal.id)}
                className="p-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white transition-colors"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={onCancelEdit}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-colors`}
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEditClick(goal)}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-colors`}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteClick}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400' : 'bg-red-100 hover:bg-red-200 text-red-600'} transition-colors`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Progress</span>
            <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{progress}%</span>
          </div>
          <div className={`w-full ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200/50'} rounded-full h-2`}>
            <div
              className="bg-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {isEditing ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                Current Amount
              </label>
              <input
                type="number"
                value={goal.current_amount}
                onChange={(e) => onEditValuesChange('current_amount', parseFloat(e.target.value))}
                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                Target Amount
              </label>
              <input
                type="number"
                value={goal.target_amount}
                onChange={(e) => onEditValuesChange('target_amount', parseFloat(e.target.value))}
                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                min="0"
                step="0.01"
              />
            </div>
            <div className="col-span-2">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                Target Date
              </label>
              <input
                type="date"
                value={goal.deadline}
                onChange={(e) => onEditValuesChange('deadline', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current</span>
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{formatCurrency(goal.current_amount)}</p>
            </div>
            <div>
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Target</span>
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{formatCurrency(goal.target_amount)}</p>
            </div>
            <div>
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Deadline</span>
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{formatDate(goal.deadline)}</p>
            </div>
            <div>
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</span>
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium capitalize`}>{goal.status}</p>
            </div>
          </div>
        )}
      </div>

      {isDeleting && (
        <div className={`mt-4 p-4 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} rounded-md`}>
          <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>Are you sure you want to delete this goal?</p>
          <div className="mt-2 flex space-x-2">
            <button
              onClick={handleConfirmDelete}
              className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Yes, Delete
            </button>
            <button
              onClick={handleCancelDelete}
              className={`px-3 py-1 text-sm font-medium ${isDarkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'} rounded-md`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 