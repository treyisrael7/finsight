"use client";

import { motion } from "framer-motion";

interface ErrorMessageProps {
  type: "error" | "warning";
  message?: string;
  messages?: string[];
}

export default function ErrorMessage({
  type,
  message,
  messages,
}: ErrorMessageProps) {
  const isError = type === "error";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-lg border px-4 py-3 text-sm ${
        isError
          ? "border-red-500/30 bg-red-500/10 text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-400"
          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300"
      }`}
    >
      {message ? (
        <p>{message}</p>
      ) : (
        <ul className="list-disc list-inside space-y-0.5">
          {messages?.map((msg, index) => <li key={index}>{msg}</li>)}
        </ul>
      )}
    </motion.div>
  );
}
