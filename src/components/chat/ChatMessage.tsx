import { Message } from '@/types/chat';
import { motion } from 'framer-motion';

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
        className={`max-w-[80%] rounded-lg p-4 ${
          message.isUser
            ? "bg-emerald-500 text-white"
            : "bg-white shadow-md"
        }`}
      >
        <p className={message.isUser ? "text-white" : "text-gray-800"}>
          {message.content}
        </p>
        <div className="mt-1 text-xs opacity-50">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
}
