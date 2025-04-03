import { motion } from "framer-motion";

interface ErrorMessageProps {
  type: "error" | "warning";
  message?: string;
  messages?: string[];
}

export default function ErrorMessage({ type, message, messages }: ErrorMessageProps) {
  const styles = {
    error: "bg-red-50 border-l-4 border-red-400 text-red-700",
    warning: "bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700",
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
          {messages?.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
