import { Message } from "@/types/chat";
import { motion } from "framer-motion";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <motion.div
          key={message.id}
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
            {!message.isUser && message.sentiment && (
              <div className="mt-2 text-xs text-gray-500">
                <span className={`inline-block px-2 py-1 rounded ${
                  message.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                  message.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  Sentiment: {message.sentiment}
                  {message.confidence && ` (${(message.confidence * 100).toFixed(1)}%)`}
                </span>
              </div>
            )}
            <div className="mt-1 text-xs opacity-50">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </motion.div>
      ))}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-start"
        >
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
