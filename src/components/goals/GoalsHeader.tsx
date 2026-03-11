'use client';

interface GoalsHeaderProps {
  onAddClick?: () => void;
}

export default function GoalsHeader({ onAddClick }: GoalsHeaderProps) {
  return (
    <div className="rounded-xl border border-[var(--finsight-border)] bg-[var(--finsight-card)] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_0_0_1px_var(--finsight-border)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--finsight-primary-text)]">
        Financial goals
      </h1>
      <p className="mt-1 text-sm text-[var(--finsight-secondary-text)]">
        Track and manage your financial objectives
      </p>
    </div>
  );
}
