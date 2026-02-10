'use client';

import { useState, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { toast } from 'react-hot-toast';
import { calculateTermFromDeadline } from './utils';
import type { Goal, OrganizedGoals } from './types';

interface NewGoal {
  title: string;
  current_amount: number;
  target_amount: number;
  deadline: string;
  status: string;
}

export function useGoals(userId: string, supabase: SupabaseClient<Database>) {
  const [goals, setGoals] = useState<OrganizedGoals>({
    short_term: [],
    medium_term: [],
    long_term: []
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Goal> | null>(null);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    target_amount: 0,
    current_amount: 0,
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active'
  });

  const fetchGoals = useCallback(async () => {
    try {
      // First get the profile goals
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('financial_goals')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile goals:', profileError);
        throw profileError;
      }

      // Then get the goal progress
      let { data: progress, error: progressError } = await supabase
        .from('goal_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) {
        console.error('Error fetching goal progress:', progressError);
        throw progressError;
      }

      // Convert progress array to organized goals
      const organizedGoals: OrganizedGoals = {
        short_term: [],
        medium_term: [],
        long_term: []
      };

      // If we have profile goals but no progress, create initial progress entries
      if (profile?.financial_goals && (!progress || progress.length === 0)) {
        const goalsToCreate = [];
        
        for (const [category, goals] of Object.entries(profile.financial_goals as {
          short_term: string[];
          medium_term: string[];
          long_term: string[];
        })) {
          for (const goalName of goals) {
            goalsToCreate.push({
              user_id: userId,
              goal_name: goalName,
              category,
              current_amount: 0,
              target_amount: 0,
              deadline: new Date().toISOString(),
              status: 'active'
            });
          }
        }

        if (goalsToCreate.length > 0) {
          const { error: insertError } = await supabase
            .from('goal_progress')
            .insert(goalsToCreate);

          if (insertError) {
            console.error('Error creating goals:', insertError);
            throw insertError;
          }

          // Fetch the newly created goals
          const { data: newProgress, error: newProgressError } = await supabase
            .from('goal_progress')
            .select('*')
            .eq('user_id', userId);

          if (newProgressError) throw newProgressError;
          progress = newProgress;
        }
      }

      // Organize goals by category
      if (progress) {
        progress.forEach(goal => {
          if (goal.category) {
            organizedGoals[goal.category as keyof OrganizedGoals].push({
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
      }
      
      setGoals(organizedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    }
  }, [supabase, userId]);

  const handleAddGoal = async () => {
    try {
      if (!newGoal.title || !newGoal.target_amount || !newGoal.deadline) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Calculate the term based on the deadline
      const calculatedTerm = calculateTermFromDeadline(newGoal.deadline);
      
      // Insert into goal_progress
      const { data: insertedGoal, error: insertError } = await supabase
        .from('goal_progress')
        .insert([
          {
            user_id: userId,
            goal_name: newGoal.title,
            target_amount: Number(newGoal.target_amount),
            current_amount: Number(newGoal.current_amount || 0),
            deadline: newGoal.deadline,
            category: calculatedTerm,
            status: 'active',
          },
        ])
        .select()
        .single();

      if (insertError) {
        // Check if it's a unique constraint violation
        if (insertError.code === '23505' || insertError.message?.includes('unique constraint')) {
          toast.error('A goal with this name already exists. Please choose a different name.');
          return;
        }
        console.error('Error inserting goal:', insertError);
        throw insertError;
      }

      if (!insertedGoal) {
        throw new Error('Failed to insert goal');
      }

      // Reset form and close modal
      setIsAddModalOpen(false);
      setNewGoal({
        title: '',
        target_amount: 0,
        current_amount: 0,
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
      });

      // Refresh goals list
      await fetchGoals();
      toast.success('Goal added successfully');
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to add goal. Please try again.');
    }
  };

  const handleEditClick = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditValues({
      current_amount: goal.current_amount,
      target_amount: goal.target_amount,
      deadline: goal.deadline
    });
  };

  const handleSaveProgress = async (goalId: string) => {
    if (!editValues) return;

    try {
      const { error } = await supabase
        .from('goal_progress')
        .update({
          current_amount: editValues.current_amount,
          target_amount: editValues.target_amount,
          deadline: editValues.deadline,
          category: calculateTermFromDeadline(editValues.deadline || '')
        })
        .eq('id', goalId);

      if (error) throw error;

      setEditingGoalId(null);
      setEditValues(null);
      fetchGoals();
      toast.success('Progress updated successfully');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const handleCancelEdit = () => {
    setEditingGoalId(null);
    setEditValues(null);
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      // Delete the goal from goal_progress table
      const { error: deleteError } = await supabase
        .from('goal_progress')
        .delete()
        .eq('id', goalId);

      if (deleteError) throw deleteError;

      fetchGoals();
      toast.success('Goal deleted successfully');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const handleEditValuesChange = (field: 'current_amount' | 'target_amount' | 'deadline', value: string | number) => {
    if (editValues) {
      // Convert string numbers to actual numbers
      const numericValue = typeof value === 'string' ? parseFloat(value) : value;
      setEditValues({ ...editValues, [field]: numericValue });
    }
  };

  const handleNewGoalChange = (field: keyof NewGoal, value: string | number) => {
    setNewGoal(prev => ({
      ...prev,
      [field]: field === 'title' ? value : Number(value)
    }));
  };

  return {
    goals,
    isAddModalOpen,
    setIsAddModalOpen,
    editingGoalId,
    editValues,
    newGoal,
    handleAddGoal,
    handleEditClick,
    handleSaveProgress,
    handleCancelEdit,
    handleDeleteGoal,
    handleEditValuesChange,
    handleNewGoalChange,
    fetchGoals
  };
}

function calculateTerm(deadline: string): 'short_term' | 'medium_term' | 'long_term' {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const monthsDiff = (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (monthsDiff <= 6) return 'short_term';
  if (monthsDiff <= 24) return 'medium_term';
  return 'long_term';
} 