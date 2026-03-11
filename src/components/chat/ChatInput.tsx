"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything about finance..."
          className="flex-1 rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)] px-4 py-2.5 text-[var(--finsight-primary-text)] placeholder-[var(--finsight-muted-text)] focus:border-[var(--finsight-accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--finsight-accent-blue)]/20 disabled:opacity-60"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="flex items-center justify-center rounded-lg bg-[var(--finsight-accent-blue)] px-4 py-2.5 text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Sending..." : <Send className="h-5 w-5" />}
        </button>
      </div>
    </form>
  );
}
