'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import FormInput from '../auth/FormInput';
import LoadingSpinner from '../auth/LoadingSpinner';

interface AccountSettingsProps {
  isDarkMode?: boolean;
}

export default function AccountSettings({ isDarkMode }: AccountSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password';
      toast.error(msg);
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
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success('Account deleted successfully');
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete account';
      toast.error(msg);
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
    if (typeof document !== 'undefined' && document.referrer.includes('/chat')) {
      router.push('/chat');
    } else {
      router.push('/dashboard');
    }
  };

  const sectionClass =
    'rounded-xl border border-[var(--finsight-border)] bg-[var(--finsight-card)] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_0_0_1px_var(--finsight-border)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-xl font-semibold text-[var(--finsight-primary-text)]">
          Account settings
        </h2>

        <div className={`mb-6 ${sectionClass}`}>
          <h3 className="mb-4 text-lg font-medium text-[var(--finsight-primary-text)]">
            Change password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <FormInput
              id="currentPassword"
              type="password"
              label="Current password"
              placeholder="Enter current password"
              onChange={setCurrentPassword}
            />
            <FormInput
              id="newPassword"
              type="password"
              label="New password"
              placeholder="Enter new password"
              onChange={setNewPassword}
            />
            <FormInput
              id="confirmPassword"
              type="password"
              label="Confirm new password"
              placeholder="Confirm new password"
              onChange={setConfirmPassword}
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[var(--finsight-accent-blue)] px-4 py-2 font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  Updating...
                </span>
              ) : (
                'Update password'
              )}
            </motion.button>
          </form>
        </div>

        <div className={`mb-6 ${sectionClass}`}>
          <h3 className="mb-4 text-lg font-medium text-[var(--finsight-primary-text)]">
            Delete account
          </h3>
          <p className="mb-4 text-[var(--finsight-secondary-text)]">
            {showDeleteConfirm
              ? 'Are you sure? This action cannot be undone.'
              : 'Permanently delete your account and all associated data.'}
          </p>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleDeleteAccount}
            disabled={isLoading}
            className="w-full rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner />
                Deleting...
              </span>
            ) : showDeleteConfirm ? (
              'Confirm delete'
            ) : (
              'Delete account'
            )}
          </motion.button>
        </div>

        <div className="mt-6 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleBack}
            className="rounded-lg px-6 py-2 font-medium text-[var(--finsight-secondary-text)] transition-colors hover:text-[var(--finsight-accent-blue)]"
          >
            ← Back
          </motion.button>
        </div>
      </div>
    </div>
  );
}
