'use client';

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

export default function ProfileHeader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="border-b border-[var(--finsight-border)] bg-[var(--finsight-card)] px-6 py-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--finsight-border)] bg-[var(--finsight-surface)]">
          <User className="h-8 w-8 text-[var(--finsight-accent-blue)]" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--finsight-primary-text)]">
            Profile settings
          </h1>
          <p className="mt-1 text-sm text-[var(--finsight-secondary-text)]">
            Manage your personal information and preferences
          </p>
        </div>
      </div>
    </div>
  );
}
