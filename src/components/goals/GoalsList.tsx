'use client';

import { useEffect, useState } from 'react';
import GoalCard from './GoalCard';
import AddGoalModal from './AddGoalModal';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { toast } from 'react-hot-toast';
import { calculateTermFromDeadline } from './utils';

interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number | null;
  current_amount: number;
  deadline: string | null;
  category: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface GoalsListProps {
  userId: string;
  onGoalsUpdate: () => Promise<void>;
  isDarkMode: boolean;
}

export function GoalsList({ userId, onGoalsUpdate, isDarkMode }: GoalsListProps) {
  const [goals, setGoals] = useState<{
    short_term: Goal[];
    medium_term: Goal[];
    long_term: Goal[];
  }>({
    short_term: [],
    medium_term: [],
    long_term: []
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    current_amount: '',
    deadline: new Date().toISOString().split('T')[0],
    category: 'short_term' as const
  });
  const supabase = createClientComponentClient<Database>();

  const fetchGoals = async () => {
    try {
      // Fetch goal progress
      const { data: progress, error: progressError } = await supabase
        .from('goal_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) throw progressError;
      
      console.log('Fetched progress:', progress);
      
      // Organize goals by category
      const organizedGoals = {
        short_term: [] as Goal[],
        medium_term: [] as Goal[],
        long_term: [] as Goal[]
      };

      progress?.forEach(goal => {
        if (goal.category) {
          const category = goal.category as keyof typeof organizedGoals;
          console.log('Processing goal:', goal.goal_name, 'Category:', category);
          organizedGoals[category].push({
            id: goal.id,
            user_id: goal.user_id,
            title: goal.goal_name,
            target_amount: goal.target_amount,
            current_amount: goal.current_amount,
            deadline: goal.deadline,
            category: goal.category,
            status: goal.status,
            created_at: goal.created_at,
            updated_at: goal.updated_at
          });
        }
      });
      
      console.log('Organized goals:', organizedGoals);
      setGoals(organizedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [userId]);

  const handleNewGoalChange = (field: keyof typeof newGoal, value: string | number) => {
    setNewGoal(prev => ({ ...prev, [field]: value }));
  };

  const handleAddGoal = async () => {
    try {
      // Validate required fields
      if (!newGoal.title.trim()) {
        toast.error('Please enter a goal title');
        return;
      }

      if (!newGoal.target_amount.trim()) {
        toast.error('Please enter a target amount');
        return;
      }

      if (!newGoal.deadline) {
        toast.error('Please select a target date');
        return;
      }

      // Calculate the term based on the deadline
      const calculatedTerm = calculateTermFromDeadline(newGoal.deadline);
      console.log('Adding new goal:', {
        title: newGoal.title,
        deadline: newGoal.deadline,
        calculatedTerm,
        target_amount: Number(newGoal.target_amount),
        current_amount: newGoal.current_amount.trim() ? Number(newGoal.current_amount) : 0
      });
      
      // Check if goal with same name already exists
      const { data: existingGoal, error: checkError } = await supabase
        .from('goal_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('goal_name', newGoal.title)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking for existing goal:', checkError);
        throw checkError;
      }

      if (existingGoal) {
        toast.error('A goal with this name already exists');
        return;
      }
      
      // Add to goal_progress table
      const { data, error } = await supabase
        .from('goal_progress')
        .insert({
          user_id: userId,
          goal_name: newGoal.title,
          target_amount: Number(newGoal.target_amount),
          current_amount: newGoal.current_amount.trim() ? Number(newGoal.current_amount) : 0,
          deadline: newGoal.deadline,
          category: calculatedTerm,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting goal:', error);
        if (error.code === '23505') { // Unique violation
          toast.error('A goal with this name already exists');
        } else {
          toast.error('Failed to add goal: ' + error.message);
        }
        return;
      }

      console.log('Inserted goal:', data);

      // Update user_profiles table to include the new goal
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('financial_goals')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      const currentGoals = profile?.financial_goals || {
        short_term: [],
        medium_term: [],
        long_term: []
      };

      // Add the new goal to the appropriate category if it's not already there
      if (!currentGoals[calculatedTerm].includes(newGoal.title)) {
        const updatedGoals = {
          ...currentGoals,
          [calculatedTerm]: [...currentGoals[calculatedTerm], newGoal.title]
        };

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ financial_goals: updatedGoals })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating profile goals:', updateError);
          throw updateError;
        }
      }

      // Refresh goals
      await fetchGoals();
      setIsAddModalOpen(false);
      setNewGoal({
        title: '',
        target_amount: '',
        current_amount: '',
        deadline: new Date().toISOString().split('T')[0],
        category: 'short_term' as const
      });
      toast.success('Goal added successfully');
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to add goal');
    }
  };

  const handleEditClick = (goal: Goal) => {
    setEditingGoal(goal);
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
  };

  const handleEditValuesChange = (field: 'current_amount' | 'target_amount' | 'deadline', value: string | number) => {
    if (!editingGoal) return;
    setEditingGoal(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleSaveProgress = async (goalId: string) => {
    try {
      if (!editingGoal) return;

      // Recalculate the term based on the new deadline
      const calculatedTerm = calculateTermFromDeadline(editingGoal.deadline || '');

      const { error } = await supabase
        .from('goal_progress')
        .update({
          current_amount: editingGoal.current_amount,
          target_amount: editingGoal.target_amount,
          deadline: editingGoal.deadline,
          category: calculatedTerm
        })
        .eq('id', goalId);

      if (error) throw error;

      await fetchGoals();
      setEditingGoal(null);
      toast.success('Goal updated successfully');
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('goal_progress')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      await fetchGoals();
      toast.success('Goal deleted successfully');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const renderGoalsByCategory = (category: 'short_term' | 'medium_term' | 'long_term', title: string) => {
    const categoryGoals = goals[category] || [];
    if (categoryGoals.length === 0) return null;

    return (
      <div className="flex-1 min-w-0">
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{title}</h2>
        <div className="space-y-4">
          {categoryGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEditClick={handleEditClick}
              onSaveProgress={handleSaveProgress}
              onCancelEdit={handleCancelEdit}
              onDeleteGoal={handleDeleteGoal}
              onEditValuesChange={handleEditValuesChange}
              editingGoal={editingGoal}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Goals</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Add Goal
        </button>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
          {renderGoalsByCategory('short_term', 'Short Term Goals')}
          {renderGoalsByCategory('medium_term', 'Medium Term Goals')}
          {renderGoalsByCategory('long_term', 'Long Term Goals')}
        </div>
      </div>

      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddGoal}
        newGoal={newGoal}
        onNewGoalChange={handleNewGoalChange}
        isDarkMode={isDarkMode}
      />
    </div>
  );
} 