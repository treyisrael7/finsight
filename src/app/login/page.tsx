"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Link from "next/link";
import FormInput from "@/components/auth/FormInput";
import LoadingSpinner from "@/components/auth/LoadingSpinner";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    setMounted(true);
    const htmlElement = document.documentElement;
    setIsDarkMode(htmlElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDarkMode(htmlElement.classList.contains('dark'));
    });

    observer.observe(htmlElement, { attributes: true, attributeFilter: ['class'] });

    // Check session state (silently)
    const checkSession = async () => {
      await supabase.auth.getSession();
    };
    checkSession();

    return () => observer.disconnect();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      toast.success('Welcome back!', {
        duration: 2000,
        position: 'top-center',
      });
      
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'An error occurred during login', {
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address', {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message.includes('User not found')) {
          toast.error('No account found with this email address', {
            duration: 3000,
            position: 'top-center',
          });
        } else {
          throw error;
        }
        return;
      }

      toast.success('Password reset instructions sent to your email', {
        duration: 3000,
        position: 'top-center',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset instructions', {
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Clear any existing session
    supabase.auth.signOut().then(() => {
      // Use replace to prevent back button from going to login
      window.location.replace('/');
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'} py-12 px-4 sm:px-6 lg:px-8`}>
      <ThemeToggle />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-md w-full space-y-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-2xl shadow-xl`}
      >
        <div className="text-center">
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Welcome Back
          </h1>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Continue your financial journey</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <FormInput
            id="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            onChange={setEmail}
            isDarkMode={isDarkMode}
          />

          <FormInput
            id="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            onChange={setPassword}
            isDarkMode={isDarkMode}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={`h-4 w-4 rounded border-gray-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-teal-500 focus:ring-teal-500' 
                    : 'text-teal-500 focus:ring-teal-500'
                }`}
              />
              <label
                htmlFor="remember-me"
                className={`ml-2 block text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Remember me
              </label>
            </div>

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isLoading}
              className={`text-sm font-medium ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-teal-400' 
                  : 'text-gray-600 hover:text-teal-500'
              } transition-colors`}
            >
              Forgot password?
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
              ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
              }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <LoadingSpinner />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        <div className="text-center mt-4">
          <Link
            href="/signup"
            className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-teal-400' : 'text-gray-600 hover:text-teal-500'} transition-colors`}
          >
            Don't have an account? Sign up
          </Link>
        </div>

        <div className="text-center">
          <a
            href="/"
            onClick={handleBackToHome}
            className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-teal-400' : 'text-gray-600 hover:text-teal-500'} transition-colors`}
          >
            ← Back to Home
          </a>
        </div>
      </motion.div>
    </div>
  );
}
