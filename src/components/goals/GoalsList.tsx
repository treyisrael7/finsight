'use client';

import { useEffect, useState } from 'react';
import GoalCard from './GoalCard';
import AddGoalModal from './AddGoalModal';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { toast } from 'react-hot-toast';
import { calculateTermFromDeadline, calculateProgress, formatCurrency, formatDate } from './utils';

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
  isDarkMode?: boolean;
}

export function GoalsList({ userId, onGoalsUpdate }: GoalsListProps) {
  const [goals, setGoals] = useState<{
    short_term: Goal[];
    medium_term: Goal[];
    long_term: Goal[];
  }>({
    short_term: [],
    medium_term: [],
    long_term: [],
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    current_amount: '',
    deadline: new Date().toISOString().split('T')[0],
    category: 'short_term' as const,
  });
  const supabase = createClientComponentClient<Database>();

  const fetchGoals = async () => {
    try {
      const { data: progress, error: progressError } = await supabase
        .from('goal_progress')
        .select('*')
        .eq('user_id', userId);
      if (progressError) throw progressError;

      const organizedGoals = {
        short_term: [] as Goal[],
        medium_term: [] as Goal[],
        long_term: [] as Goal[],
      };
      progress?.forEach((goal) => {
        if (goal.category) {
          const category = goal.category as keyof typeof organizedGoals;
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
            updated_at: goal.updated_at,
          });
        }
      });
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
    setNewGoal((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddGoal = async () => {
    try {
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
      const targetAmount = Number(newGoal.target_amount);
      const currentAmount = newGoal.current_amount.trim() ? Number(newGoal.current_amount) : 0;
      if (isNaN(targetAmount) || targetAmount <= 0) {
        toast.error('Please enter a valid target amount greater than 0');
        return;
      }
      if (isNaN(currentAmount) || currentAmount < 0) {
        toast.error('Please enter a valid current amount (0 or greater)');
        return;
      }
      const deadlineDate = new Date(newGoal.deadline);
      if (deadlineDate < new Date()) {
        toast.error('Please select a future date for the deadline');
        return;
      }
      const calculatedTerm = calculateTermFromDeadline(newGoal.deadline);

      const { data: existingGoal, error: checkError } = await supabase
        .from('goal_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('goal_name', newGoal.title)
        .single();
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      if (existingGoal) {
        toast.error('A goal with this name already exists');
        return;
      }

      const { error } = await supabase
        .from('goal_progress')
        .insert({
          user_id: userId,
          goal_name: newGoal.title.trim(),
          target_amount: targetAmount,
          current_amount: currentAmount,
          deadline: newGoal.deadline,
          category: calculatedTerm,
          status: 'active',
        })
        .select()
        .single();
      if (error) {
        if (error.code === '23505') toast.error('A goal with this name already exists');
        else toast.error('Failed to add goal: ' + error.message);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('financial_goals')
        .eq('id', userId)
        .single();
      if (profileError) throw profileError;
      const currentGoals = profile?.financial_goals || {
        short_term: [],
        medium_term: [],
        long_term: [],
      };
      if (!currentGoals[calculatedTerm].includes(newGoal.title)) {
        const updatedGoals = {
          ...currentGoals,
          [calculatedTerm]: [...currentGoals[calculatedTerm], newGoal.title],
        };
        await supabase.from('user_profiles').update({ financial_goals: updatedGoals }).eq('id', userId);
      }
      await fetchGoals();
      setIsAddModalOpen(false);
      setNewGoal({
        title: '',
        target_amount: '',
        current_amount: '',
        deadline: new Date().toISOString().split('T')[0],
        category: 'short_term',
      });
      toast.success('Goal added successfully');
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to add goal');
    }
  };

  const handleEditClick = (goal: Goal) => setEditingGoal(goal);
  const handleCancelEdit = () => setEditingGoal(null);
  const handleEditValuesChange = (
    field: 'current_amount' | 'target_amount' | 'deadline',
    value: string | number
  ) => {
    if (!editingGoal) return;
    setEditingGoal((prev) =>
      prev ? { ...prev, [field]: value } : null
    );
  };

  const handleSaveProgress = async (goalId: string) => {
    try {
      if (!editingGoal) return;
      if (!editingGoal.target_amount || editingGoal.target_amount <= 0) {
        toast.error('Please enter a valid target amount greater than 0');
        return;
      }
      if (editingGoal.current_amount < 0) {
        toast.error('Current amount cannot be negative');
        return;
      }
      if (!editingGoal.deadline) {
        toast.error('Please select a deadline');
        return;
      }
      const deadlineDate = new Date(editingGoal.deadline);
      if (isNaN(deadlineDate.getTime())) {
        toast.error('Please enter a valid date');
        return;
      }
      const calculatedTerm = calculateTermFromDeadline(editingGoal.deadline);
      const { error } = await supabase
        .from('goal_progress')
        .update({
          current_amount: editingGoal.current_amount,
          target_amount: editingGoal.target_amount,
          deadline: editingGoal.deadline,
          category: calculatedTerm,
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
      const { error } = await supabase.from('goal_progress').delete().eq('id', goalId);
      if (error) throw error;
      await fetchGoals();
      toast.success('Goal deleted successfully');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const renderGoalsByCategory = (
    category: 'short_term' | 'medium_term' | 'long_term',
    title: string
  ) => {
    const categoryGoals = goals[category] || [];
    if (categoryGoals.length === 0) return null;
    return (
      <div className="min-w-0 flex-1">
        <h2 className="mb-4 text-xl font-semibold text-[var(--finsight-primary-text)]">{title}</h2>
        <div className="space-y-4">
          {categoryGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal.title}
              progress={calculateProgress(goal.current_amount, goal.target_amount || 0)}
              goalData={goal}
              isEditing={editingGoal?.id === goal.id}
              editValues={
                editingGoal?.id === goal.id
                  ? {
                      current: goal.current_amount,
                      target: goal.target_amount || 0,
                      deadline: goal.deadline || '',
                    }
                  : null
              }
              onEditClick={() => handleEditClick(goal)}
              onSaveProgress={handleSaveProgress}
              onCancelEdit={handleCancelEdit}
              onDeleteGoal={handleDeleteGoal}
              onEditValuesChange={(field, value) => {
                const fieldMap = {
                  current: 'current_amount' as const,
                  target: 'target_amount' as const,
                  deadline: 'deadline' as const,
                };
                handleEditValuesChange(fieldMap[field], value);
              }}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--finsight-primary-text)]">
          Your goals
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-lg bg-[var(--finsight-accent-blue)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          Add goal
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 p-0 md:grid-cols-3">
        {renderGoalsByCategory('short_term', 'Short term')}
        {renderGoalsByCategory('medium_term', 'Medium term')}
        {renderGoalsByCategory('long_term', 'Long term')}
      </div>

      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddGoal}
        newGoal={newGoal}
        onNewGoalChange={handleNewGoalChange}
      />
    </div>
  );
}
