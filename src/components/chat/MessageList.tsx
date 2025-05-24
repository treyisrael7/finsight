import { Message } from '@/types/chat';
import { motion } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isDarkMode: boolean;
}

export default function MessageList({ messages, isLoading, isDarkMode }: MessageListProps) {
  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at);
    const dateKey = date.toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
        <div key={dateKey} className="space-y-4">
          <div className="flex justify-center">
            <span className={`text-xs ${isDarkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-white border border-gray-300'} px-3 py-1 rounded-full ${isDarkMode ? 'shadow-sm' : 'shadow-md'}`}>
              {(() => {
                const date = new Date(dateKey);
                if (isToday(date)) return 'Today';
                if (isYesterday(date)) return 'Yesterday';
                return format(date, 'MMMM d, yyyy');
              })()}
            </span>
          </div>
          {dateMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? "bg-emerald-500 text-white"
                    : isDarkMode
                      ? "bg-gray-800 text-gray-100 shadow-md"
                      : "bg-white text-gray-800 shadow-md"
                }`}
              >
                <p className={message.role === 'user' ? "text-white" : isDarkMode ? "text-gray-100" : "text-gray-800"}>
                  {message.content}
                </p>
                <div className={`mt-1 text-xs ${message.role === 'user' ? "text-white/70" : isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {new Date(message.created_at).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className={`max-w-[80%] rounded-lg p-4 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-md`}>
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Thinking...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
