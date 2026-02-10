'use client';

import type { Goal } from './types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const calculateProgress = (current: number, target: number): number => {
  if (!target || target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

export const calculateTermProgress = (goals: Goal[] = [], term: 'short_term' | 'medium_term' | 'long_term'): number => {
  if (!goals || !Array.isArray(goals)) return 0;
  
  const termGoals = goals.filter(goal => goal.category === term);
  if (termGoals.length === 0) return 0;
  
  const totalProgress = termGoals.reduce((sum, goal) => 
    sum + calculateProgress(goal.current_amount, goal.target_amount), 0);
  return Math.round(totalProgress / termGoals.length);
};

export const calculateTotalProgress = (goals: Goal[] = []): number => {
  if (!goals || !Array.isArray(goals) || goals.length === 0) return 0;
  
  const totalProgress = goals.reduce((sum, goal) => 
    sum + calculateProgress(goal.current_amount, goal.target_amount), 0);
  return Math.round(totalProgress / goals.length);
};

export function calculateTermFromDeadline(deadline: string): 'short_term' | 'medium_term' | 'long_term' {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  
  // Calculate years difference
  const yearsDiff = (deadlineDate.getFullYear() - today.getFullYear()) + 
                   (deadlineDate.getMonth() - today.getMonth()) / 12;

  if (yearsDiff <= 1) {
    return 'short_term';
  } else if (yearsDiff <= 5) {
    return 'medium_term';
  } else {
    return 'long_term';
  }
} 