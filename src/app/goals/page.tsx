import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import GoalsClient from '@/components/GoalsClient';
import LoadingState from '@/components/ui/LoadingState';

export default async function GoalsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Fetch user profile and goals
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('financial_goals')
    .eq('id', user.id)
    .single();

  // Fetch goal progress
  const { data: goalProgress } = await supabase
    .from('goal_progress')
    .select('*')
    .eq('user_id', user.id);

  return (
    <Suspense fallback={<LoadingState message="Loading goals..." />}>
      <GoalsClient 
        userData={user}
        profileData={profile}
        progressData={goalProgress || []} 
      />
    </Suspense>
  );
} 