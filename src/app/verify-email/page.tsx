'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/subabase';

export default function VerifyEmailPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user.email_confirmed_at) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="max-w-sm mx-auto mt-16 p-6 border rounded text-center">
      <h1 className="text-xl font-bold mb-4">Check Your Email</h1>
      <p className="text-gray-600 mb-6">
        We've sent you a verification link. Please check your email and click the link to verify your account.
      </p>
      <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded mb-6">
        <p className="text-sm">
          Didn't receive the email? Check your spam folder or try signing up again.
        </p>
      </div>
      <button
        onClick={() => router.push('/login')}
        className="text-green-600 hover:text-green-700 font-medium"
      >
        Return to Login
      </button>
    </div>
  );
} 