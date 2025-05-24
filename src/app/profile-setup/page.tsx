"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Target, User, Shield } from 'lucide-react';
import FormInput from "@/components/auth/FormInput";
import LoadingSpinner from "@/components/auth/LoadingSpinner";
import ThemeToggle from "@/components/ThemeToggle";

export default function ProfileSetupPage() {
  const [fullName, setFullName] = useState('');
  const [riskProfile, setRiskProfile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [goals, setGoals] = useState({
    short_term: [] as string[],
    medium_term: [] as string[],
    long_term: [] as string[]
  });
  const router = useRouter();
  const supabase = createClientComponentClient();

  const goalOptions = {
    short_term: [
      "Build emergency fund",
      "Pay off credit card debt",
      "Save for vacation",
      "Start investing",
      "Improve credit score"
    ],
    medium_term: [
      "Buy a house",
      "Start a business",
      "Save for wedding",
      "Pay off student loans",
      "Save for down payment"
    ],
    long_term: [
      "Retirement planning",
      "College fund for children",
      "Wealth building",
      "Estate planning",
      "Financial independence"
    ]
  };

  useEffect(() => {
    setMounted(true);
    const htmlElement = document.documentElement;
    setIsDarkMode(htmlElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDarkMode(htmlElement.classList.contains('dark'));
    });

    observer.observe(htmlElement, { attributes: true, attributeFilter: ['class'] });

    // Check if profile is already complete
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name, risk_profile, financial_goals')
          .eq('id', user.id)
          .single();

        if (profile?.full_name && profile?.risk_profile && profile?.financial_goals?.length > 0) {
          router.push('/dashboard');
        }
      }
    };

    checkProfile();
    return () => observer.disconnect();
  }, [router, supabase]);

  const handleGoalChange = (term: 'short_term' | 'medium_term' | 'long_term', goal: string) => {
    setGoals(prev => {
      const currentGoals = prev[term];
      const newGoals = currentGoals.includes(goal)
        ? currentGoals.filter(g => g !== goal)
        : [...currentGoals, goal];
      
      return {
        ...prev,
        [term]: newGoals
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !riskProfile) {
      toast.error('Please fill in all required fields', {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }

    // Validate goals
    const hasGoals = Object.values(goals).some(termGoals => termGoals.length > 0);
    if (!hasGoals) {
      toast.error('Please select at least one financial goal', {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // First, check if the profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      // Update or insert profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          risk_profile: riskProfile,
          financial_goals: goals,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (profileError) throw profileError;

      toast.success('Profile setup complete!', {
        duration: 2000,
        position: 'top-center',
      });

      // Force a hard navigation to the dashboard
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to update profile', {
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
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <ThemeToggle />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className={`rounded-2xl shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-800/90' : 'bg-white'}`}>
          <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">
              Complete Your Profile
            </h1>
            <p className="text-white/90">
              Let's personalize your financial journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="space-y-6">
              <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-sm border border-border`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'} rounded-lg`}>
                    <User className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                </div>

                <FormInput
                  id="fullName"
                  type="text"
                  label="Full Name"
                  placeholder="Enter your full name"
                  onChange={setFullName}
                  isDarkMode={isDarkMode}
                />
              </div>

              <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-sm border border-border`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-100'} rounded-lg`}>
                    <Shield className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Risk Profile</h3>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Risk Tolerance
                  </label>
                  <select
                    value={riskProfile}
                    onChange={(e) => setRiskProfile(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900/20 transition-colors
                      ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}
                  >
                    <option value="">Select your risk tolerance</option>
                    <option value="conservative">Conservative - Prefer stable, low-risk investments</option>
                    <option value="moderate">Moderate - Balance between risk and return</option>
                    <option value="aggressive">Aggressive - Comfortable with higher risk for higher returns</option>
                  </select>
                </div>
              </div>

              <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-sm border border-border`}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`p-2 ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'} rounded-lg`}>
                    <Target className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Financial Goals</h3>
                </div>

                {(['short_term', 'medium_term', 'long_term'] as const).map((term) => (
                  <div key={term} className="space-y-4 mb-6 last:mb-0">
                    <h4 className="text-base font-medium text-foreground">
                      {term === 'short_term' ? 'Short Term (1-2 years)' :
                       term === 'medium_term' ? 'Medium Term (3-5 years)' :
                       'Long Term (5+ years)'}
                    </h4>
                    
                    <div className="space-y-2">
                      {goalOptions[term].map(goal => (
                        <label
                          key={goal}
                          className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                            ${goals[term].includes(goal)
                              ? `border-teal-500 ${isDarkMode ? 'bg-teal-900/20' : 'bg-teal-50'}`
                              : `border-border hover:border-teal-200 hover:bg-card`}`}
                        >
                          <input
                            type="checkbox"
                            checked={goals[term].includes(goal)}
                            onChange={() => handleGoalChange(term, goal)}
                            className="sr-only"
                          />
                          <div className={`flex items-center justify-center w-5 h-5 rounded border mr-3
                            ${goals[term].includes(goal)
                              ? 'bg-teal-500 border-teal-500'
                              : isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-border bg-white'}`}
                          >
                            {goals[term].includes(goal) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-medium text-foreground">{goal}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
                  Setting up...
                </span>
              ) : (
                "Complete Setup"
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
} 