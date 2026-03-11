'use client';

import { useState, useEffect } from 'react';
import { User, Shield, Info } from 'lucide-react';

interface PersonalInfoProps {
  isEditing: boolean;
  formData: {
    full_name: string;
    risk_profile: string;
  };
  onFormChange: (field: string, value: string) => void;
}

const cardClass =
  'rounded-xl border border-[var(--finsight-border)] bg-[var(--finsight-card)] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_0_0_1px_var(--finsight-border)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]';
const inputClass =
  'w-full rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)] px-4 py-2.5 text-[var(--finsight-primary-text)] placeholder-[var(--finsight-muted-text)] focus:border-[var(--finsight-accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--finsight-accent-blue)]/20';

export default function PersonalInfo({ isEditing, formData, onFormChange }: PersonalInfoProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  if (isEditing) {
    return (
      <div className="space-y-8">
        <div className={cardClass}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)]">
              <User className="h-5 w-5 text-[var(--finsight-accent-blue)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--finsight-primary-text)]">
              Personal information
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-[var(--finsight-primary-text)]">
                  Name
                </label>
                <div className="group relative">
                  <Info className="h-4 w-4 cursor-help text-[var(--finsight-muted-text)]" />
                  <div className="absolute bottom-full right-0 z-10 mb-2 w-64 rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-card)] p-2 text-xs text-[var(--finsight-secondary-text)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    Your name will be used by the AI assistant to personalize your experience
                  </div>
                </div>
              </div>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => onFormChange('full_name', e.target.value)}
                className={inputClass}
                placeholder="Enter your name"
                required
                minLength={2}
                maxLength={50}
              />
              {formData.full_name.length > 0 && formData.full_name.length < 2 && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  Name must be at least 2 characters long
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)]">
              <Shield className="h-5 w-5 text-[var(--finsight-accent-blue)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--finsight-primary-text)]">
              Risk profile
            </h3>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--finsight-primary-text)]">
              Risk tolerance
            </label>
            <select
              value={formData.risk_profile}
              onChange={(e) => onFormChange('risk_profile', e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Select your risk tolerance</option>
              <option value="conservative">Conservative - Prefer stable, low-risk investments</option>
              <option value="moderate">Moderate - Balance between risk and return</option>
              <option value="aggressive">Aggressive - Comfortable with higher risk for higher returns</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className={cardClass}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)]">
            <User className="h-5 w-5 text-[var(--finsight-accent-blue)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--finsight-primary-text)]">
            Personal information
          </h3>
        </div>
        <div className="mt-4">
          <p className="text-sm text-[var(--finsight-muted-text)]">Your name</p>
          <p className="mt-1 text-lg font-medium text-[var(--finsight-primary-text)]">
            {formData.full_name || (
              <span className="italic text-[var(--finsight-muted-text)]">
                Not set — Click Edit Profile to set your name
              </span>
            )}
          </p>
        </div>
      </div>

      <div className={cardClass}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)]">
            <Shield className="h-5 w-5 text-[var(--finsight-accent-blue)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--finsight-primary-text)]">
            Risk profile
          </h3>
        </div>
        <div className="mt-4">
          <p className="text-sm text-[var(--finsight-muted-text)]">Risk tolerance</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-medium capitalize text-[var(--finsight-primary-text)]">
              {formData.risk_profile || (
                <span className="italic text-[var(--finsight-muted-text)]">
                  Not set — Click Edit Profile to set your risk tolerance
                </span>
              )}
            </span>
            {formData.risk_profile && (
              <span className="rounded-full border border-[var(--finsight-accent-blue)]/40 bg-[var(--finsight-accent-blue)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--finsight-accent-blue)]">
                {formData.risk_profile === 'conservative'
                  ? 'Low risk'
                  : formData.risk_profile === 'moderate'
                    ? 'Medium risk'
                    : 'High risk'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
