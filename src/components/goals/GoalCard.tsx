'use client';

import { Pencil, Trash2, Save, X } from 'lucide-react';
import { useState } from 'react';
import type { Database } from '@/types/supabase';
import { formatCurrency, formatDate, calculateProgress } from './utils';

interface GoalCardProps {
  goal: string;
  progress: number;
  goalData: {
    id: string;
    current_amount: number;
    target_amount: number | null;
    deadline: string | null;
    status?: string;
  };
  isEditing: boolean;
  editValues: { current: number; target: number; deadline: string } | null;
  onEditClick: (goalId: string) => void;
  onSaveProgress: (goalId: string) => void;
  onCancelEdit: () => void;
  onDeleteGoal: (goalId: string) => void;
  onEditValuesChange: (field: 'current' | 'target' | 'deadline', value: string | number) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

const inputClass =
  'w-full rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)] px-3.5 py-2 text-[var(--finsight-primary-text)] placeholder-[var(--finsight-muted-text)] focus:border-[var(--finsight-accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--finsight-accent-blue)]/20';

export default function GoalCard({
  goal,
  progress,
  goalData,
  isEditing,
  editValues,
  onEditClick,
  onSaveProgress,
  onCancelEdit,
  onDeleteGoal,
  onEditValuesChange,
  formatCurrency,
  formatDate,
}: GoalCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="rounded-xl border border-[var(--finsight-border)] bg-[var(--finsight-card)] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_0_0_1px_var(--finsight-border)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--finsight-primary-text)]">{goal}</h3>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => onSaveProgress(goalData.id)}
                className="rounded-lg bg-[var(--finsight-accent-blue)] p-2 text-white transition-colors hover:opacity-90"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={onCancelEdit}
                className="rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)] p-2 text-[var(--finsight-secondary-text)] transition-colors hover:bg-[var(--finsight-card)]"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEditClick(goalData.id)}
                className="rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)] p-2 text-[var(--finsight-secondary-text)] transition-colors hover:text-[var(--finsight-accent-blue)]"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsDeleting(true)}
                className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-600 transition-colors hover:bg-red-500/20 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-[var(--finsight-secondary-text)]">Progress</span>
            <span className="font-medium text-[var(--finsight-primary-text)]">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--finsight-surface)]">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: 'var(--finsight-accent-blue)',
              }}
            />
          </div>
        </div>

        {isEditing && editValues ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--finsight-secondary-text)]">
                Current amount
              </label>
              <input
                type="number"
                value={editValues.current || ''}
                onChange={(e) =>
                  onEditValuesChange('current', e.target.value === '' ? 0 : parseFloat(e.target.value))
                }
                className={inputClass}
                min={0}
                step={0.01}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--finsight-secondary-text)]">
                Target amount
              </label>
              <input
                type="number"
                value={editValues.target || ''}
                onChange={(e) =>
                  onEditValuesChange('target', e.target.value === '' ? 0 : parseFloat(e.target.value))
                }
                className={inputClass}
                min={0}
                step={0.01}
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[var(--finsight-secondary-text)]">
                Target date
              </label>
              <input
                type="date"
                value={editValues.deadline || ''}
                onChange={(e) => onEditValuesChange('deadline', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[var(--finsight-muted-text)]">Current</span>
              <p className="font-medium text-[var(--finsight-primary-text)]">
                {formatCurrency(goalData.current_amount ?? 0)}
              </p>
            </div>
            <div>
              <span className="text-[var(--finsight-muted-text)]">Target</span>
              <p className="font-medium text-[var(--finsight-primary-text)]">
                {formatCurrency(goalData.target_amount ?? 0)}
              </p>
            </div>
            <div>
              <span className="text-[var(--finsight-muted-text)]">Deadline</span>
              <p className="font-medium text-[var(--finsight-primary-text)]">
                {formatDate(goalData.deadline ?? '')}
              </p>
            </div>
            <div>
              <span className="text-[var(--finsight-muted-text)]">Status</span>
              <p className="font-medium capitalize text-[var(--finsight-primary-text)]">
                {goalData.status || 'active'}
              </p>
            </div>
          </div>
        )}
      </div>

      {isDeleting && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            Are you sure you want to delete this goal?
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                onDeleteGoal(goalData.id);
                setIsDeleting(false);
              }}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Yes, delete
            </button>
            <button
              onClick={() => setIsDeleting(false)}
              className="rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)] px-3 py-1.5 text-sm font-medium text-[var(--finsight-primary-text)] hover:bg-[var(--finsight-card)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
