import { motion } from "framer-motion";

export default function LoadingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-start"
    >
      <div className="rounded-xl border border-[var(--finsight-border)] bg-[var(--finsight-card)] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 rounded-full animate-bounce"
            style={{ backgroundColor: "var(--finsight-accent-blue)" }}
          />
          <div
            className="h-2 w-2 rounded-full animate-bounce [animation-delay:0.2s]"
            style={{ backgroundColor: "var(--finsight-accent-blue)" }}
          />
          <div
            className="h-2 w-2 rounded-full animate-bounce [animation-delay:0.4s]"
            style={{ backgroundColor: "var(--finsight-accent-blue)" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
