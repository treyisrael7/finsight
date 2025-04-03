import { motion } from "framer-motion";
import { Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] p-4 ${
          message.isUser
            ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl rounded-br-none shadow-lg"
            : "bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-none shadow-sm"
        }`}
      >
        <p className="text-[15px] leading-relaxed">{message.content}</p>
        <span
          className={`text-xs mt-2 block ${message.isUser ? "text-teal-100" : "text-gray-500"}`}
        >
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  );
}
