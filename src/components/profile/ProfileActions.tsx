'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/auth/LoadingSpinner';

interface ProfileActionsProps {
  isEditing: boolean;
  isLoading: boolean;
  onBack: () => void;
  onEdit: () => void;
  onCancel: () => void;
}

export default function ProfileActions({
  isEditing,
  isLoading,
  onBack,
  onEdit,
  onCancel,
}: ProfileActionsProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <div className="flex items-center justify-between border-t border-[var(--finsight-border)] pt-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-[var(--finsight-muted-text)] transition-colors hover:text-[var(--finsight-accent-blue)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--finsight-secondary-text)] transition-colors hover:text-[var(--finsight-primary-text)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="profile-form"
              disabled={isLoading}
              className="rounded-lg bg-[var(--finsight-accent-blue)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner />
                  Saving...
                </span>
              ) : (
                'Save changes'
              )}
            </button>
          </>
        ) : (
          <button
            onClick={onEdit}
            className="rounded-lg bg-[var(--finsight-accent-blue)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          >
            Edit profile
          </button>
        )}
      </div>
    </div>
  );
}
