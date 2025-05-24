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
  const styles = {
    error: "bg-destructive/10 border-l-4 border-destructive text-destructive",
    warning: "bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-4 rounded-md ${styles[type]}`}
    >
      {message ? (
        <p>{message}</p>
      ) : (
        <ul className="list-disc list-inside">
          {messages?.map((msg, index) => <li key={index}>{msg}</li>)}
        </ul>
      )}
    </motion.div>
  );
}
