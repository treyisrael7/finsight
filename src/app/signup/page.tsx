"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import SignupForm from "../../components/auth/SignupForm";
import ThemeToggle from "@/components/ThemeToggle";
import { useState, useEffect } from "react";

export default function SignupPage() {
  const router = useRouter();
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

  const handleSignupSuccess = () => {
    router.push("/verify-email");
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
            Join FinSight
          </h1>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Start your financial journey today</p>
        </div>

        <SignupForm onSuccess={handleSignupSuccess} isDarkMode={isDarkMode} />

        <div className="text-center mt-4">
          <Link
            href="/"
            className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-teal-400' : 'text-gray-600 hover:text-teal-500'} transition-colors`}
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
