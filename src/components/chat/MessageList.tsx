import { Message } from "@/types/chat";
import { motion } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import { Loader2 } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isDarkMode?: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at);
    const dateKey = date.toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
        <div key={dateKey} className="space-y-4">
          <div className="flex justify-center">
            <span className="rounded-full border border-[var(--finsight-border)] bg-[var(--finsight-surface)] px-3 py-1 text-xs text-[var(--finsight-muted-text)]">
              {(() => {
                const date = new Date(dateKey);
                if (isToday(date)) return "Today";
                if (isYesterday(date)) return "Yesterday";
                return format(date, "MMMM d, yyyy");
              })()}
            </span>
          </div>
          {dateMessages.map((message) => (
            <motion.div
              key={message.id}
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
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
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
          ))}
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="rounded-xl border border-[var(--finsight-border)] bg-[var(--finsight-card)] px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--finsight-accent-blue)]" />
              <span className="text-sm text-[var(--finsight-secondary-text)]">
                Thinking...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
