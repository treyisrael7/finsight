"use client";

import { motion } from "framer-motion";

const summaryItems = [
  { label: "Income", value: "$6,240", sub: "month" },
  { label: "Expenses", value: "$4,180", sub: "month" },
  { label: "Savings rate", value: "33%", sub: "" },
  { label: "Free cash flow", value: "$2,060", sub: "month" },
];

const chartHeights = [40, 55, 48, 62, 52, 70, 58];

export default function ProductMockup() {
  return (
    <div className="relative w-full max-w-[380px] pt-6">
      {/* Layer 1: AI chat card — top layer, slight shadow and lift */}
      <motion.div
        className="relative z-30 rounded-xl border border-finsight-border bg-finsight-card shadow-[0_8px_32px_rgba(0,0,0,0.24),0_0_0_1px_rgba(255,255,255,0.04)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        style={{
          padding: "1rem 1rem 1.25rem",
          marginBottom: "-6px",
        }}
      >
        <div className="mb-3 flex items-center gap-2 border-b border-finsight-border pb-2.5">
          <div className="h-2 w-2 rounded-full bg-finsight-accent-green shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <span className="text-xs font-medium uppercase tracking-wider text-finsight-muted-text">
            FinSight AI
          </span>
        </div>
        <div className="space-y-2.5">
          <div className="rounded-lg border border-finsight-border/60 bg-finsight-bg/70 px-3.5 py-2.5">
            <p className="text-xs leading-relaxed text-finsight-secondary-text">
              &quot;Can I afford to increase my monthly investment by $200?&quot;
            </p>
          </div>
          <div className="rounded-lg border border-finsight-border bg-finsight-surface/90 px-3.5 py-2.5 shadow-sm">
            <p className="text-xs leading-[1.5] text-finsight-primary-text">
              Based on your income ($6,240) and expenses ($4,180), you have about $2,060 in free cash flow. Increasing investments by $200 is comfortable—you&apos;d still have $1,860 for savings and buffer.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Layer 2: Financial summary — second layer, slight offset and shadow */}
      <motion.div
        className="relative z-20 rounded-xl border border-finsight-border bg-finsight-surface shadow-[0_6px_24px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.04)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25 }}
        style={{
          padding: "1rem 1.25rem",
          marginLeft: "8px",
          marginRight: "8px",
          marginBottom: "-6px",
        }}
      >
        <div className="grid grid-cols-4 gap-3">
          {summaryItems.map((item, i) => (
            <div key={item.label} className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-wider text-finsight-muted-text">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-semibold tracking-tight text-finsight-primary-text">
                {item.value}
              </p>
              {item.sub && (
                <p className="mt-0.5 text-[10px] text-finsight-muted-text">{item.sub}</p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Layer 3: Chart card — base layer, slightly recessed */}
      <motion.div
        className="relative z-10 min-h-[88px] rounded-xl border border-finsight-border bg-finsight-card shadow-[0_4px_20px_rgba(0,0,0,0.18),0_0_0_1px_rgba(255,255,255,0.04)]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35 }}
        style={{
          padding: "1rem 1.25rem 1.25rem",
          marginLeft: "16px",
          marginRight: "16px",
        }}
      >
        <p className="mb-2.5 text-[10px] font-medium uppercase tracking-wider text-finsight-muted-text">
          Spending trend
        </p>
        <div className="flex h-11 items-end justify-between gap-1">
          {chartHeights.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                backgroundColor: "var(--finsight-accent-blue)",
                opacity: 0.6,
                minHeight: 4,
              }}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 0.5 + i * 0.04, duration: 0.4 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
