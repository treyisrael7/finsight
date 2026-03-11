'use client';

import { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import Link from 'next/link';

interface FinancialGoalsProps {
  isEditing: boolean;
  goals: {
    short_term: string[];
    medium_term: string[];
    long_term: string[];
  };
  onGoalChange: (term: 'short_term' | 'medium_term' | 'long_term', goal: string) => void;
}

const goalOptions = {
  short_term: [
    'Build emergency fund',
    'Pay off credit card debt',
    'Save for vacation',
    'Start investing',
    'Improve credit score',
  ],
  medium_term: [
    'Buy a house',
    'Start a business',
    'Save for wedding',
    'Pay off student loans',
    'Save for down payment',
  ],
  long_term: [
    'Retirement planning',
    'College fund for children',
    'Wealth building',
    'Estate planning',
    'Financial independence',
  ],
};

const cardClass =
  'rounded-xl border border-[var(--finsight-border)] bg-[var(--finsight-card)] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_0_0_1px_var(--finsight-border)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]';
const inputClass =
  'flex-1 rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)] px-4 py-2.5 text-[var(--finsight-primary-text)] placeholder-[var(--finsight-muted-text)] focus:border-[var(--finsight-accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--finsight-accent-blue)]/20';

export default function FinancialGoals({ isEditing, goals, onGoalChange }: FinancialGoalsProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  const getTermBadgeClass = (term: string) => {
    const base = 'rounded-full px-3 py-1.5 text-sm font-medium';
    switch (term) {
      case 'short_term':
        return `${base} border border-[var(--finsight-accent-blue)]/40 bg-[var(--finsight-accent-blue)]/10 text-[var(--finsight-accent-blue)]`;
      case 'medium_term':
        return `${base} border border-[var(--finsight-accent-green)]/40 bg-[var(--finsight-accent-green)]/10 text-[var(--finsight-accent-green)]`;
      default:
        return `${base} border border-[var(--finsight-border)] bg-[var(--finsight-surface)] text-[var(--finsight-secondary-text)]`;
    }
  };

  if (isEditing) {
    return (
      <div className={cardClass}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)]">
              <Target className="h-5 w-5 text-[var(--finsight-accent-blue)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--finsight-primary-text)]">
              Financial goals
            </h3>
          </div>
          <Link
            href="/goals"
            className="text-sm font-medium text-[var(--finsight-accent-blue)] transition-colors hover:underline"
          >
            Track progress
          </Link>
        </div>
        <div className="space-y-8">
          {(['short_term', 'medium_term', 'long_term'] as const).map((term) => (
            <div key={term} className="space-y-4">
              <h4 className="text-base font-medium text-[var(--finsight-primary-text)]">
                {term === 'short_term'
                  ? 'Short term (1–2 years)'
                  : term === 'medium_term'
                    ? 'Medium term (3–5 years)'
                    : 'Long term (5+ years)'}
              </h4>
              {goalOptions[term].map((goal) => (
                <label
                  key={goal}
                  className={`flex cursor-pointer items-center rounded-xl border-2 p-4 transition-all ${
                    goals[term].includes(goal)
                      ? 'border-[var(--finsight-accent-blue)] bg-[var(--finsight-accent-blue)]/10'
                      : 'border-[var(--finsight-border)] hover:border-[var(--finsight-accent-blue)]/40 hover:bg-[var(--finsight-surface)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={goals[term].includes(goal)}
                    onChange={() => onGoalChange(term, goal)}
                    className="sr-only"
                  />
                  <div
                    className={`mr-3 flex h-5 w-5 items-center justify-center rounded border ${
                      goals[term].includes(goal)
                        ? 'border-[var(--finsight-accent-blue)] bg-[var(--finsight-accent-blue)]'
                        : 'border-[var(--finsight-border)]'
                    }`}
                  >
                    {goals[term].includes(goal) && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium text-[var(--finsight-primary-text)]">{goal}</span>
                </label>
              ))}
              {goals[term].filter((g) => !goalOptions[term].includes(g)).map((customGoal) => (
                <div
                  key={customGoal}
                  className="flex items-center justify-between rounded-xl border-2 border-[var(--finsight-accent-blue)] bg-[var(--finsight-accent-blue)]/10 p-4"
                >
                  <label className="flex cursor-pointer items-center m-0">
                    <input
                      type="checkbox"
                      checked={goals[term].includes(customGoal)}
                      onChange={() => onGoalChange(term, customGoal)}
                      className="sr-only"
                    />
                    <div className="mr-3 flex h-5 w-5 items-center justify-center rounded border border-[var(--finsight-accent-blue)] bg-[var(--finsight-accent-blue)]">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[var(--finsight-primary-text)]">
                      {customGoal}
                    </span>
                  </label>
                </div>
              ))}
              <div className="border-t border-[var(--finsight-border)] pt-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Add custom goal..."
                    className={inputClass}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const value = input.value.trim();
                        if (value) {
                          onGoalChange(term, value);
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                      const value = input?.value.trim();
                      if (value) {
                        onGoalChange(term, value);
                        input.value = '';
                      }
                    }}
                    className="rounded-lg bg-[var(--finsight-accent-blue)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)]">
            <Target className="h-5 w-5 text-[var(--finsight-accent-blue)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--finsight-primary-text)]">
            Financial goals
          </h3>
        </div>
        <Link
          href="/goals"
          className="text-sm font-medium text-[var(--finsight-accent-blue)] transition-colors hover:underline"
        >
          Track progress
        </Link>
      </div>
      <div className="space-y-8">
        {(['short_term', 'medium_term', 'long_term'] as const).map((term) => (
          <div key={term} className="space-y-4">
            <h4 className="text-base font-medium text-[var(--finsight-primary-text)]">
              {term === 'short_term'
                ? 'Short term (1–2 years)'
                : term === 'medium_term'
                  ? 'Medium term (3–5 years)'
                  : 'Long term (5+ years)'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {goals[term].length > 0 ? (
                goals[term].map((goal) => (
                  <span key={goal} className={getTermBadgeClass(term)}>
                    {goal}
                  </span>
                ))
              ) : (
                <p className="italic text-[var(--finsight-muted-text)]">
                  No {term.replace('_', ' ')} goals set
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
