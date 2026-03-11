import { Message } from "@/types/chat";
import { motion } from "framer-motion";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-xl px-4 py-3 ${
          message.role === "user"
            ? "bg-[var(--finsight-accent-blue)] text-white"
            : "border border-[var(--finsight-border)] bg-[var(--finsight-card)] text-[var(--finsight-primary-text)] shadow-sm"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        <div
          className={`mt-1.5 text-xs ${
            message.role === "user" ? "text-white/70" : "text-[var(--finsight-muted-text)]"
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      </div>
    </motion.div>
  );
}
