'use client';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizedGoals {
  short_term: Goal[];
  medium_term: Goal[];
  long_term: Goal[];
}

export interface ProfileGoal {
  id: string;
  user_id: string;
  financial_goals: Goal[];
  created_at: string;
  updated_at: string;
} 