'use client';

interface GoalProgressProps {
  totalProgress: number;
  shortTermProgress: number;
  mediumTermProgress: number;
  longTermProgress: number;
}

export default function GoalProgress({
  totalProgress,
  shortTermProgress,
  mediumTermProgress,
  longTermProgress,
}: GoalProgressProps) {
  const barTrack = "h-2 w-full overflow-hidden rounded-full bg-[var(--finsight-surface)]";
  const barFill = "h-2 rounded-full transition-all duration-300";
  const labelClass = "text-sm text-[var(--finsight-secondary-text)]";
  const valueClass = "text-sm font-medium text-[var(--finsight-primary-text)]";

  return (
    <div className="rounded-xl border border-[var(--finsight-border)] bg-[var(--finsight-card)] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_0_0_1px_var(--finsight-border)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
      <h2 className="mb-6 text-xl font-semibold tracking-tight text-[var(--finsight-primary-text)]">
        Goal progress
      </h2>

      <div className="space-y-6">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className={labelClass}>Overall progress</span>
            <span className={valueClass}>{totalProgress}%</span>
          </div>
          <div className={barTrack}>
            <div
              className={barFill}
              style={{
                width: `${totalProgress}%`,
                backgroundColor: 'var(--finsight-accent-blue)',
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className={labelClass}>Short term</span>
              <span className={valueClass}>{shortTermProgress}%</span>
            </div>
            <div className={barTrack}>
              <div
                className={barFill}
                style={{
                  width: `${shortTermProgress}%`,
                  backgroundColor: 'var(--finsight-accent-blue)',
                  opacity: 0.9,
                }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className={labelClass}>Medium term</span>
              <span className={valueClass}>{mediumTermProgress}%</span>
            </div>
            <div className={barTrack}>
              <div
                className={barFill}
                style={{
                  width: `${mediumTermProgress}%`,
                  backgroundColor: 'var(--finsight-accent-blue)',
                  opacity: 0.75,
                }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className={labelClass}>Long term</span>
              <span className={valueClass}>{longTermProgress}%</span>
            </div>
            <div className={barTrack}>
              <div
                className={barFill}
                style={{
                  width: `${longTermProgress}%`,
                  backgroundColor: 'var(--finsight-accent-blue)',
                  opacity: 0.6,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
