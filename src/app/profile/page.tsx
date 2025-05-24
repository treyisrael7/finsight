"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from "@/types/database";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PersonalInfo from "@/components/profile/PersonalInfo";
import FinancialGoals from "@/components/profile/FinancialGoals";
import ProfileActions from "@/components/profile/ProfileActions";
import AccountSettings from "@/components/profile/AccountSettings";
import { toast } from "react-hot-toast";

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
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login');
          return;
        }

        console.log('\n=== FETCHING PROFILE ===');
        console.log('User ID:', session.user.id);
        console.log('Email:', session.user.email);

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        console.log('\n=== FETCH RESULT ===');
        console.log('Profile data:', data);
        console.log('Error:', error);
        console.log('===========================\n');

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      console.log('\n=== SAVING PROFILE DATA ===');
      console.log('User ID:', session.user.id);
      console.log('Email:', session.user.email);
      console.log('Form Data:', {
        full_name: formData.full_name.trim(),
        risk_profile: formData.risk_profile,
        financial_goals: formData.financial_goals
      });

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: session.user.id,
          email: session.user.email!,
          full_name: formData.full_name.trim(),
          risk_profile: formData.risk_profile,
          financial_goals: formData.financial_goals,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      console.log('\n=== SAVE RESULT ===');
      console.log('Saved data:', data);
      console.log('Error:', error);
      console.log('===========================\n');

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

  const handleGoalChange = (term: 'short_term' | 'medium_term' | 'long_term', goal: string) => {
    setFormData(prev => {
      const currentGoals = prev.financial_goals[term];
      const newGoals = currentGoals.includes(goal)
        ? currentGoals.filter(g => g !== goal)
        : [...currentGoals, goal];
      
      return {
        ...prev,
        financial_goals: {
          ...prev.financial_goals,
          [term]: newGoals
        }
      };
    });
  };

  const handleBack = () => {
    if (document.referrer.includes('/chat')) {
      router.push('/chat');
    } else {
      router.push('/dashboard');
    }
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
    </div>
  );
} 