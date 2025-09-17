import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/components/auth/LoadingSpinner";

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

  // Render null on the server to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center justify-between pt-6 border-t border-border">
      <button
        onClick={onBack}
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="flex items-center space-x-2">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="profile-form"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <LoadingSpinner />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </>
        ) : (
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
} 