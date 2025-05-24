import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);

    // Check if user has completed profile setup
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, risk_profile, financial_goals')
        .eq('id', user.id)
        .single();

      // If profile is not complete, redirect to profile setup
      if (!profile?.full_name || !profile?.risk_profile || !profile?.financial_goals) {
        return NextResponse.redirect(new URL('/profile-setup', request.url));
      }
    }
  }

  // If profile is complete or no code, redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url));
} 