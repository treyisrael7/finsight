"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Target, User, Shield, X, Edit2 } from 'lucide-react';
import FormInput from "@/components/auth/FormInput";
import LoadingSpinner from "@/components/auth/LoadingSpinner";
import ThemeToggle from "@/components/ThemeToggle";
import { calculateTermFromDeadline } from '@/components/goals/utils';

export default function ProfileSetupPage() {
  const [name, setName] = useState('');
  const [riskProfile, setRiskProfile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [goals, setGoals] = useState({
    short_term: [] as string[],
    medium_term: [] as string[],
    long_term: [] as string[]
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<{
    name: string;
    term: 'short_term' | 'medium_term' | 'long_term';
  } | null>(null);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalProgress, setGoalProgress] = useState<{
    current: number;
    target: number;
    deadline: string;
  }>({
    current: 0,
    target: 0,
    deadline: new Date().toISOString().split('T')[0]
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

  const handleGoalChange = async (term: 'short_term' | 'medium_term' | 'long_term', goal: string) => {
    const isSelected = goals[term].includes(goal);
    if (!isSelected) {
      // If selecting a goal, show the modal
      setSelectedGoal({ name: goal, term });
      setGoalProgress({
        current: 0,
        target: 0,
        deadline: new Date().toISOString().split('T')[0]
      });
      setIsEditingGoal(false);
      setIsModalOpen(true);
    } else {
      // If unselecting a goal, just remove it
      setGoals(prev => ({
        ...prev,
        [term]: prev[term].filter(g => g !== goal)
      }));
    }
  };

  const handleEditGoal = async (term: 'short_term' | 'medium_term' | 'long_term', goal: string) => {
    setSelectedGoal({ name: goal, term });
    setIsEditingGoal(true);
    
    // Fetch existing goal progress from database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: goalData } = await supabase
          .from('goal_progress')
          .select('current_amount, target_amount, deadline')
          .eq('user_id', user.id)
          .eq('goal_name', goal)
          .single();

        if (goalData) {
          setGoalProgress({
            current: goalData.current_amount || 0,
            target: goalData.target_amount || 0,
            deadline: goalData.deadline ? new Date(goalData.deadline).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          });
        } else {
          setGoalProgress({
            current: 0,
            target: 0,
            deadline: new Date().toISOString().split('T')[0]
          });
        }
      }
    } catch (error) {
      console.error('Error fetching goal data:', error);
      setGoalProgress({
        current: 0,
        target: 0,
        deadline: new Date().toISOString().split('T')[0]
      });
    }
    
    setIsModalOpen(true);
  };

  const handleSaveGoalProgress = async () => {
    if (!selectedGoal) return;

    try {
      // Validate the data
      if (goalProgress.current < 0 || goalProgress.target <= 0) {
        toast.error('Please enter valid amounts');
        return;
      }

      if (!goalProgress.deadline) {
        toast.error('Please select a deadline');
        return;
      }

      // Calculate the term based on the deadline
      const calculatedTerm = calculateTermFromDeadline(goalProgress.deadline);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      if (isEditingGoal) {
        // Update existing goal progress
        const { error: updateError } = await supabase
          .from('goal_progress')
          .update({
            current_amount: Number(goalProgress.current),
            target_amount: Number(goalProgress.target),
            deadline: new Date(goalProgress.deadline).toISOString(),
            category: calculatedTerm
          })
          .eq('user_id', user.id)
          .eq('goal_name', selectedGoal.name);

        if (updateError) throw updateError;

        // If the term changed, update the goals array
        if (calculatedTerm !== selectedGoal.term) {
          setGoals(prev => ({
            ...prev,
            [selectedGoal.term]: prev[selectedGoal.term].filter(g => g !== selectedGoal.name),
            [calculatedTerm]: [...prev[calculatedTerm as keyof typeof prev], selectedGoal.name]
          }));
        }

        toast.success('Goal updated successfully!');
      } else {
        // Add new goal to the goals array
        setGoals(prev => ({
          ...prev,
          [calculatedTerm]: [...prev[calculatedTerm as keyof typeof prev], selectedGoal.name]
        }));

        // Use upsert to handle both insert and update
        const { error: progressError } = await supabase
          .from('goal_progress')
          .upsert({
            user_id: user.id,
            goal_name: selectedGoal.name,
            current_amount: Number(goalProgress.current),
            target_amount: Number(goalProgress.target),
            deadline: new Date(goalProgress.deadline).toISOString(),
            category: calculatedTerm
          }, {
            onConflict: 'user_id,goal_name'
          });

        if (progressError) throw progressError;
        toast.success('Goal saved successfully!');
      }

      setIsModalOpen(false);
      setSelectedGoal(null);
      setIsEditingGoal(false);
    } catch (error: any) {
      console.error('Error saving goal:', error);
      toast.error(error.message || 'Failed to save goal');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !riskProfile) {
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
          full_name: name,
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
                  <div className={`p-2 ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-50'} rounded-lg`}>
                    <User className={`w-5 h-5 ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                </div>

                <FormInput
                  id="name"
                  type="text"
                  label="Name"
                  placeholder="Enter your name"
                  onChange={setName}
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
                        <div
                          key={goal}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'hover:bg-gray-700/50' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <label className="flex items-center space-x-3 cursor-pointer m-0">
                            <input
                              type="checkbox"
                              checked={goals[term].includes(goal)}
                              onChange={() => handleGoalChange(term, goal)}
                              className={`w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 ${
                                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'
                              }`}
                            />
                            <span className="text-foreground">{goal}</span>
                          </label>
                          {goals[term].includes(goal) && (
                            <button
                              onClick={() => handleEditGoal(term, goal)}
                              className={`p-1.5 rounded-full hover:bg-gray-200/50 transition-colors ${
                                isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                              }`}
                              title="Edit goal"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Show custom goals */}
                      {goals[term].filter(goal => !goalOptions[term].includes(goal)).map(customGoal => (
                        <div
                          key={customGoal}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-800/50 hover:bg-gray-700/50' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <label className="flex items-center space-x-3 cursor-pointer m-0">
                            <input
                              type="checkbox"
                              checked={goals[term].includes(customGoal)}
                              onChange={() => handleGoalChange(term, customGoal)}
                              className={`w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 ${
                                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'
                              }`}
                            />
                            <span className="text-foreground">{customGoal}</span>
                          </label>
                          <button
                            onClick={() => handleEditGoal(term, customGoal)}
                            className={`p-1.5 rounded-full hover:bg-gray-200/50 transition-colors ${
                              isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                            }`}
                            title="Edit goal"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Custom Goal Input */}
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            placeholder="Add custom goal..."
                            className={`flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900/20 transition-colors
                              ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                const value = input.value.trim();
                                if (value) {
                                  handleGoalChange(term, value);
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              const value = input.value.trim();
                              if (value) {
                                handleGoalChange(term, value);
                                input.value = '';
                              }
                            }}
                            className={`px-4 py-2.5 rounded-lg ${
                              isDarkMode 
                                ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                                : 'bg-teal-500 hover:bg-teal-600 text-white'
                            } transition-colors`}
                          >
                            Add
                          </button>
                        </div>
                      </div>
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

      {/* Add Goal Progress Modal */}
      <AnimatePresence>
        {isModalOpen && selectedGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-2xl p-6 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-xl`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {isEditingGoal ? 'Edit Goal Progress' : 'Set Goal Progress'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={`p-2 rounded-full hover:bg-gray-200/50 transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Current Amount
                  </label>
                  <input
                    type="number"
                    value={goalProgress.current || ''}
                    onChange={(e) => setGoalProgress(prev => ({
                      ...prev,
                      current: e.target.value === '' ? 0 : parseFloat(e.target.value)
                    }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-gray-600 text-gray-100' 
                        : 'bg-white/50 border-gray-300 text-gray-900'
                    }`}
                    min="0"
                    step="100"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Target Amount
                  </label>
                  <input
                    type="number"
                    value={goalProgress.target || ''}
                    onChange={(e) => setGoalProgress(prev => ({
                      ...prev,
                      target: e.target.value === '' ? 0 : parseFloat(e.target.value)
                    }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-gray-600 text-gray-100' 
                        : 'bg-white/50 border-gray-300 text-gray-900'
                    }`}
                    min="0"
                    step="100"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={goalProgress.deadline}
                    onChange={(e) => setGoalProgress(prev => ({
                      ...prev,
                      deadline: e.target.value
                    }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-gray-600 text-gray-100' 
                        : 'bg-white/50 border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className={`px-4 py-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveGoalProgress}
                    className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white transition-colors"
                  >
                    {isEditingGoal ? 'Update Goal' : 'Save Goal'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 