"use client";

import { motion } from "framer-motion";
import { MessageSquare, BookOpen, Target, LogOut, User } from "lucide-react";
import Link from "next/link";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import LogoutButton from "@/components/auth/LogoutButton";
import TrackProgress from '@/components/dashboard/TrackProgress';

interface DashboardClientProps {
  user: SupabaseUser;
  profile: {
    full_name: string | null;
  } | null;
}

export default function DashboardClient({ user, profile }: DashboardClientProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  if (!mounted) {
    return null;
  }

  const cardClasses = isDarkMode
    ? 'shadow-md border border-gray-700 bg-gray-800/90'
    : 'shadow-md border border-gray-300 bg-white';

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                FinSight
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300 hover:text-emerald-400' : 'text-gray-700 hover:text-emerald-500'} transition`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300 hover:text-emerald-400' : 'text-gray-700 hover:text-emerald-500'} transition`}>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 text-white p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-white/90">
            Let's continue your financial journey together.
          </p>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Track Your Progress Section */}
          <TrackProgress isDarkMode={isDarkMode} />

          {/* Learning Resources Section */}
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <div className="flex items-center space-x-3 mb-5">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
                <BookOpen className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
              </div>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Resources
              </h2>
            </div>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Financial Basics
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  Essential concepts for beginners
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Investment Strategies
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  Learn about different approaches
                </p>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <div className="flex items-center space-x-3 mb-5">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
                <MessageSquare className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
              </div>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Chat with AI
              </h2>
            </div>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Get Personalized Advice
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  Ask questions about your finances
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Financial Planning
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  Get help with your goals
                </p>
              </div>
            </div>
            <Link
              href="/chat"
              className={`mt-6 block w-full text-center py-2 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors`}
            >
              Start Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 