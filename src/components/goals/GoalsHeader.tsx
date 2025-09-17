'use client';

interface GoalsHeaderProps {
  isDarkMode: boolean;
}

export default function GoalsHeader({ isDarkMode }: GoalsHeaderProps) {
  return (
    <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 text-white shadow-inner">
      <h1 className="text-2xl font-bold mb-1">Financial Goals</h1>
      <p className="text-white/90 text-sm">Track and manage your financial objectives</p>
    </div>
  );
} 