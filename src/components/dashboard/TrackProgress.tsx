'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp, DollarSign, Edit2, Check, X } from 'lucide-react';
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
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    current: number;
    target: number;
    deadline: string;
  } | null>(null);
  const supabase = createClientComponentClient();

  const initializeGoalProgress = async (goals: ProfileGoal) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get all goals from all terms
      const allGoals = [
        ...goals.short_term,
        ...goals.medium_term,
        ...goals.medium_term,
        ...goals.long_term
      ];

      // For each goal, check if progress exists, if not create it
      for (const goal of allGoals) {
        const { data: existingProgress } = await supabase
          .from('goal_progress')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('goal_name', goal)
          .single();

        if (!existingProgress) {
          // Set default values based on goal type
          let targetAmount = 0;
          let deadline = new Date();

          if (goal.includes('emergency fund')) {
            targetAmount = 10000; // $10,000 emergency fund
            deadline.setFullYear(deadline.getFullYear() + 1);
          } else if (goal.includes('credit card')) {
            targetAmount = 5000; // $5,000 credit card debt
            deadline.setFullYear(deadline.getFullYear() + 1);
          } else if (goal.includes('vacation')) {
            targetAmount = 3000; // $3,000 vacation fund
            deadline.setFullYear(deadline.getFullYear() + 1);
          } else if (goal.includes('house')) {
            targetAmount = 50000; // $50,000 down payment
            deadline.setFullYear(deadline.getFullYear() + 3);
          } else if (goal.includes('wedding')) {
            targetAmount = 20000; // $20,000 wedding fund
            deadline.setFullYear(deadline.getFullYear() + 2);
          } else if (goal.includes('student loans')) {
            targetAmount = 30000; // $30,000 student loans
            deadline.setFullYear(deadline.getFullYear() + 2);
          } else if (goal.includes('retirement')) {
            targetAmount = 1000000; // $1M retirement
            deadline.setFullYear(deadline.getFullYear() + 30);
          } else if (goal.includes('college fund')) {
            targetAmount = 100000; // $100K college fund
            deadline.setFullYear(deadline.getFullYear() + 18);
          } else {
            // Default values for other goals
            targetAmount = 10000;
            deadline.setFullYear(deadline.getFullYear() + 2);
          }

          await supabase
            .from('goal_progress')
            .insert({
              user_id: session.user.id,
              goal_name: goal,
              current_amount: 0,
              target_amount: targetAmount,
              deadline: deadline.toISOString()
            });
        }
      }
    } catch (error) {
      console.error('Error initializing goal progress:', error);
    }
  };

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch profile goals
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('financial_goals')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;
        
        if (profile.financial_goals) {
          setGoals(profile.financial_goals);
          // Initialize progress for new goals
          await initializeGoalProgress(profile.financial_goals);
        }

        // Fetch goal progress
        const { data: progress, error: progressError } = await supabase
          .from('goal_progress')
          .select('*')
          .eq('user_id', session.user.id);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTermColor = (term: string) => {
    if (isDarkMode) {
      switch (term) {
        case 'short_term':
          return 'bg-orange-900 text-orange-200';
        case 'medium_term':
          return 'bg-blue-900 text-blue-200';
        default:
          return 'bg-purple-900 text-purple-200';
      }
    } else {
      switch (term) {
        case 'short_term':
          return 'bg-orange-200 text-orange-900';
        case 'medium_term':
          return 'bg-blue-200 text-blue-900';
        default:
          return 'bg-purple-200 text-purple-900';
      }
    }
  };

  const handleEditClick = (goal: string) => {
    const progress = goalProgress[goal];
    setEditingGoal(goal);
    setEditValues({
      current: progress?.current || 0,
      target: progress?.target || 0,
      deadline: progress?.deadline || new Date().toISOString().split('T')[0]
    });
  };

  const handleSaveProgress = async (goal: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !editValues) return;

      // Validate the data
      if (editValues.current < 0 || editValues.target <= 0) {
        toast.error('Please enter valid amounts');
        return;
      }

      if (!editValues.deadline) {
        toast.error('Please select a deadline');
        return;
      }

      // Format the data for the database
      const progressData = {
        user_id: session.user.id,
        goal_name: goal,
        current_amount: Number(editValues.current),
        target_amount: Number(editValues.target),
        deadline: new Date(editValues.deadline).toISOString()
      };

      console.log('Saving progress:', progressData); // Debug log

      const { error } = await supabase
        .from('goal_progress')
        .upsert(progressData, {
          onConflict: 'user_id,goal_name'
        });

      if (error) {
        console.error('Database error:', error); // Debug log
        throw error;
      }

      // Update local state
      setGoalProgress(prev => ({
        ...prev,
        [goal]: {
          current: Number(editValues.current),
          target: Number(editValues.target),
          deadline: editValues.deadline
        }
      }));

      setEditingGoal(null);
      setEditValues(null);
      toast.success('Progress updated successfully!');
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast.error(error.message || 'Failed to update progress');
    }
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
    setEditValues(null);
  };

  if (isLoading) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="flex items-center space-x-3 mb-5">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
            <Target className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
          </div>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Track Progress
          </h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4`} />
          <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2`} />
        </div>
      </div>
    );
  }

  if (!goals) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="flex items-center space-x-3 mb-5">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
            <Target className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
          </div>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Track Progress
          </h2>
        </div>
        <div className={`text-center py-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No goals set yet</p>
          <Link
            href="/profile"
            className={`text-sm font-medium mt-2 inline-block ${
              isDarkMode 
                ? 'text-teal-400 hover:text-teal-300' 
                : 'text-teal-600 hover:text-teal-500'
            } transition-colors`}
          >
            Set up your profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
            <Target className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
          </div>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Track Progress
          </h2>
        </div>
        <Link
          href="/profile"
          className={`text-sm font-medium ${
            isDarkMode 
              ? 'text-teal-400 hover:text-teal-300' 
              : 'text-teal-600 hover:text-teal-500'
          } transition-colors`}
        >
          Update Goals
        </Link>
      </div>

      <div className="space-y-6">
        {(['short_term', 'medium_term', 'long_term'] as const).map((term) => (
          <div key={term} className="space-y-3">
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {term === 'short_term' ? 'Short Term (1-2 years)' :
               term === 'medium_term' ? 'Medium Term (3-5 years)' :
               'Long Term (5+ years)'}
            </h3>
            <div className="space-y-3">
              {goals[term].map((goal) => {
                const progress = calculateProgress(goal);
                const goalData = goalProgress[goal];
                const isEditing = editingGoal === goal;

                return (
                  <motion.div
                    key={goal}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {goal}
                      </h4>
                      {!isEditing && (
                        <button
                          onClick={() => handleEditClick(goal)}
                          className={`p-1 rounded-full hover:bg-gray-200/50 transition-colors ${
                            isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Current Amount
                            </label>
                            <input
                              type="number"
                              value={editValues?.current || ''}
                              onChange={(e) => setEditValues(prev => ({
                                ...prev!,
                                current: e.target.value === '' ? 0 : parseFloat(e.target.value)
                              }))}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                isDarkMode 
                                  ? 'bg-gray-800 border-gray-600 text-gray-100' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                              min="0"
                              step="100"
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Target Amount
                            </label>
                            <input
                              type="number"
                              value={editValues?.target || ''}
                              onChange={(e) => setEditValues(prev => ({
                                ...prev!,
                                target: e.target.value === '' ? 0 : parseFloat(e.target.value)
                              }))}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                isDarkMode 
                                  ? 'bg-gray-800 border-gray-600 text-gray-100' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                              min="0"
                              step="100"
                            />
                          </div>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Deadline
                          </label>
                          <input
                            type="date"
                            value={editValues?.deadline?.split('T')[0] || ''}
                            onChange={(e) => setEditValues(prev => ({
                              ...prev!,
                              deadline: e.target.value
                            }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-800 border-gray-600 text-gray-100' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={handleCancelEdit}
                            className={`px-3 py-1.5 rounded-lg ${
                              isDarkMode 
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            } transition-colors`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSaveProgress(goal)}
                            className={`px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white transition-colors`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {formatCurrency(goalData?.current || 0)} / {formatCurrency(goalData?.target || 0)}
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {progress}% Complete
                          </span>
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Due: {formatDate(goalData?.deadline || new Date().toISOString())}
                          </span>
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 