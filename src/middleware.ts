import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check auth state
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the current path
  const path = req.nextUrl.pathname;

  // If user is not signed in and the current path is not /login or /signup
  // and they're trying to access a protected route, redirect to login
  if (!session && !['/login', '/signup', '/'].includes(path)) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in
  if (session) {
    // If trying to access login/signup, redirect to dashboard
    if (['/login', '/signup'].includes(path)) {
      const redirectUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If trying to access dashboard or other protected routes, check profile completion
    if (path === '/dashboard' || path.startsWith('/chat')) {
      // Use getUser() to securely get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const redirectUrl = new URL('/login', req.url);
        return NextResponse.redirect(redirectUrl);
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, risk_profile, financial_goals')
        .eq('id', user.id)
        .single();

      // If profile is not complete, redirect to profile setup
      if (!profile?.full_name || !profile?.risk_profile || !profile?.financial_goals) {
        const redirectUrl = new URL('/profile-setup', req.url);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 