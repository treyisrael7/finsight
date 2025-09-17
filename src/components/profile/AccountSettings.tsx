"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import FormInput from "../auth/FormInput";
import LoadingSpinner from "../auth/LoadingSpinner";
import { LogOut, User, Bell, Shield, HelpCircle } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

interface AccountSettingsProps {
  isDarkMode: boolean;
}

export default function AccountSettings({ isDarkMode }: AccountSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const supabase = createClientComponentClient();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsLoading(true);

    try {
      // Delete the user's account
      const { error } = await supabase.rpc('delete_user');

      if (error) throw error;

      // Sign out the user
      await supabase.auth.signOut();

      toast.success("Account deleted successfully");
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
      setShowDeleteConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (document.referrer.includes('/chat')) {
      router.push('/chat');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Account Settings
        </h2>
        
        {/* Change Password Section */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md mb-6`}>
          <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Change Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <FormInput
              id="currentPassword"
              type="password"
              label="Current Password"
              placeholder="Enter current password"
              onChange={setCurrentPassword}
              isDarkMode={isDarkMode}
            />
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
              className={`w-full py-2 px-4 rounded-lg text-white font-medium
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-teal-600 hover:bg-teal-700'}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner />
                  Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </motion.button>
          </form>
        </div>

        {/* Delete Account Section */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md mb-6`}>
          <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Delete Account
          </h3>
          <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {showDeleteConfirm 
              ? "Are you sure? This action cannot be undone."
              : "Permanently delete your account and all associated data."}
          </p>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleDeleteAccount}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-lg text-white font-medium
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner />
                Deleting...
              </span>
            ) : showDeleteConfirm ? (
              "Confirm Delete"
            ) : (
              "Delete Account"
            )}
          </motion.button>
        </div>

        {/* Back Button */}
        <div className="flex justify-center mt-6">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleBack}
            className={`px-6 py-2 rounded-lg font-medium
              ${isDarkMode 
                ? 'text-gray-300 hover:text-teal-400' 
                : 'text-gray-600 hover:text-teal-500'} transition-colors`}
          >
            ← Back
          </motion.button>
        </div>
      </div>
    </div>
  );
} 