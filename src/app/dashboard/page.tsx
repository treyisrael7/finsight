import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import LoadingState from '@/components/ui/LoadingState';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  return (
    <Suspense fallback={<LoadingState message="Loading dashboard..." />}>
      <DashboardClient user={user} profile={profile} />
    </Suspense>
  );
}
