"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from "@/types/database";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PersonalInfo from "@/components/profile/PersonalInfo";
import FinancialGoals from "@/components/profile/FinancialGoals";
import ProfileActions from "@/components/profile/ProfileActions";
import AccountSettings from "@/components/profile/AccountSettings";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";

type Profile = Database['public']['Tables']['user_profiles']['Row'];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [formData, setFormData] = useState({
    full_name: "",
    risk_profile: "",
    financial_goals: {
      short_term: [] as string[],
      medium_term: [] as string[],
      long_term: [] as string[]
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<{
    name: string;
    term: 'short_term' | 'medium_term' | 'long_term';
  } | null>(null);
  const [goalProgress, setGoalProgress] = useState<{
    current: number;
    target: number;
    deadline: string;
  }>({
    current: 0,
    target: 0,
    deadline: new Date().toISOString().split('T')[0]
  });

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
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.replace('/login');
          return;
        }

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          toast.error('Failed to load profile');
          return;
        }

        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          risk_profile: data.risk_profile || "",
          financial_goals: data.financial_goals as any || {
            short_term: [],
            medium_term: [],
            long_term: []
          }
        });
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router, supabase]);

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (formData.full_name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return false;
    }
    if (!formData.risk_profile) {
      toast.error('Please select your risk profile');
      return false;
    }
    const hasGoals = Object.values(formData.financial_goals).some(goals => goals.length > 0);
    if (!hasGoals) {
      toast.error('Please select at least one financial goal');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: formData.full_name.trim(),
          risk_profile: formData.risk_profile,
          financial_goals: formData.financial_goals,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      setProfile(prev => ({
        ...prev!,
        full_name: formData.full_name.trim(),
        risk_profile: formData.risk_profile,
        financial_goals: formData.financial_goals
      }));
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGoalChange = async (term: 'short_term' | 'medium_term' | 'long_term', goal: string) => {
    const isSelected = formData.financial_goals[term].includes(goal);
    if (!isSelected) {
      // If selecting a goal, show the modal
      setSelectedGoal({ name: goal, term });
      setGoalProgress({
        current: 0,
        target: 0,
        deadline: new Date().toISOString().split('T')[0]
      });
      setIsModalOpen(true);
    } else {
      // If unselecting a goal, delete it from financial_goals
      try {
        const { error } = await supabase
          .from('financial_goals')
          .delete()
          .eq('user_id', profile!.id)
          .eq('title', goal)
          .eq('category', term);

        if (error) throw error;

        setFormData(prev => ({
          ...prev,
          financial_goals: {
            ...prev.financial_goals,
            [term]: prev.financial_goals[term].filter(g => g !== goal)
          }
        }));
      } catch (error) {
        console.error('Error deleting goal:', error);
        toast.error('Failed to delete goal');
      }
    }
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

      // Add the goal to financial_goals table
      const { error: insertError } = await supabase
        .from('financial_goals')
        .insert({
          user_id: profile!.id,
          title: selectedGoal.name,
          current_amount: Number(goalProgress.current),
          target_amount: Number(goalProgress.target),
          deadline: new Date(goalProgress.deadline).toISOString(),
          category: selectedGoal.term,
          status: 'active'
        });

      if (insertError) throw insertError;

      // Update the form data
      setFormData(prev => ({
        ...prev,
        financial_goals: {
          ...prev.financial_goals,
          [selectedGoal.term]: [...prev.financial_goals[selectedGoal.term], selectedGoal.name]
        }
      }));

      setIsModalOpen(false);
      setSelectedGoal(null);
      toast.success('Goal added successfully!');
    } catch (error: any) {
      console.error('Error adding goal:', error);
      toast.error(error.message || 'Failed to add goal');
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]" />
          <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className={`rounded-2xl shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-800/90' : 'bg-white'}`}>
          <ProfileHeader />

          {!profile?.full_name && !isEditing && (
            <div className="px-6 py-4 bg-teal-50 dark:bg-teal-900/20 border-b border-teal-100 dark:border-teal-800">
              <p className="text-teal-800 dark:text-teal-200 text-sm">
                Welcome! Please complete your profile by clicking "Edit Profile" below. This will help personalize your experience with FinSight.
              </p>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Account Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' ? (
              <>
                {isEditing ? (
                  <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                    <PersonalInfo
                      isEditing={isEditing}
                      formData={formData}
                      onFormChange={handleFormChange}
                    />

                    <FinancialGoals
                      isEditing={isEditing}
                      goals={formData.financial_goals}
                      onGoalChange={handleGoalChange}
                    />

                    <ProfileActions
                      isEditing={isEditing}
                      isLoading={isLoading}
                      onBack={handleBack}
                      onEdit={() => setIsEditing(true)}
                      onCancel={() => setIsEditing(false)}
                    />
                  </form>
                ) : (
                  <>
                    <PersonalInfo
                      isEditing={isEditing}
                      formData={formData}
                      onFormChange={handleFormChange}
                    />

                    <FinancialGoals
                      isEditing={isEditing}
                      goals={formData.financial_goals}
                      onGoalChange={handleGoalChange}
                    />

                    <ProfileActions
                      isEditing={isEditing}
                      isLoading={isLoading}
                      onBack={handleBack}
                      onEdit={() => setIsEditing(true)}
                      onCancel={() => setIsEditing(false)}
                    />
                  </>
                )}
              </>
            ) : (
              <AccountSettings isDarkMode={isDarkMode} />
            )}
          </div>
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
                  Set Goal Progress
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
                    Save Goal
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