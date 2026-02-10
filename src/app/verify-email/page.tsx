"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ThemeToggle from "@/components/ThemeToggle";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    setMounted(true);
    const htmlElement = document.documentElement;
    setIsDarkMode(htmlElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDarkMode(htmlElement.classList.contains('dark'));
    });

    observer.observe(htmlElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        router.push("/dashboard");
      }
    };
    checkSession();
  }, [router, supabase]);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'} py-12 px-4 sm:px-6 lg:px-8`}>
      <ThemeToggle />
      <div className={`max-w-sm w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-xl text-center`}>
        <h1 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Check Your Email</h1>
        <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          We've sent you a verification link. Please check your email and click
          the link to verify your account.
        </p>
        <div className={`${isDarkMode ? 'bg-blue-900/50 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-600'} border px-4 py-3 rounded mb-6`}>
          <p className="text-sm">
            Didn't receive the email? Check your spam folder or try signing up
            again.
          </p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className={`${isDarkMode ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'} font-medium transition-colors`}
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}
