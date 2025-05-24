"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '@/types/database';

type Profile = Database['public']['Tables']['user_profiles']['Row'];

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getProfileContext = () => {
    if (!profile) return '';

    const context = [];
    
    if (profile.full_name) {
      context.push(`User's name: ${profile.full_name}`);
    }
    
    if (profile.risk_profile) {
      context.push(`Risk tolerance: ${profile.risk_profile}`);
    }
    
    if (profile.financial_goals) {
      const goals = profile.financial_goals as {
        short_term: string[];
        medium_term: string[];
        long_term: string[];
      };
      
      if (goals.short_term?.length) {
        context.push(`Short-term goals (1-2 years): ${goals.short_term.join(', ')}`);
      }
      if (goals.medium_term?.length) {
        context.push(`Medium-term goals (3-5 years): ${goals.medium_term.join(', ')}`);
      }
      if (goals.long_term?.length) {
        context.push(`Long-term goals (5+ years): ${goals.long_term.join(', ')}`);
      }
    }

    return context.join('\n');
  };

  return {
    profile,
    isLoading,
    error,
    getProfileContext
  };
} 