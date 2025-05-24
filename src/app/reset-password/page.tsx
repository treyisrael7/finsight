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

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    return () => observer.disconnect();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match', {
        duration: 3000,
        position: 'top-center',
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully', {
        duration: 2000,
        position: 'top-center',
      });
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password', {
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
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
            Reset Password
          </h1>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Enter your new password below</p>
        </div>

        <form className="space-y-6" onSubmit={handleResetPassword}>
          <FormInput
            id="newPassword"
            type="password"
            label="New Password"
            placeholder="Enter new password"
            onChange={setNewPassword}
            isDarkMode={isDarkMode}
          />

          <FormInput
            id="confirmPassword"
            type="password"
            label="Confirm New Password"
            placeholder="Confirm new password"
            onChange={setConfirmPassword}
            isDarkMode={isDarkMode}
          />

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
                Resetting...
              </span>
            ) : (
              "Reset Password"
            )}
          </motion.button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-teal-400' : 'text-gray-600 hover:text-teal-500'} transition-colors`}
          >
            ← Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 