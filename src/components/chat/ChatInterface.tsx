"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Message, Conversation } from "@/types/chat";
import MessageList from "./MessageList";
import { motion } from "framer-motion";
import Link from "next/link";
import { Send, Loader2, LayoutDashboard, User, Target } from "lucide-react";

interface ChatInterfaceProps {
  conversationId: string | null;
  onNewMessage: (message: Message) => void;
  onNewConversation: (conversationId: string) => void;
}

export default function ChatInterface({
  conversationId,
  onNewMessage,
  onNewConversation,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationId) {
        setMessages([]);
        return;
      }
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("Not authenticated");
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("No session");
        const response = await fetch(`/api/conversations/${conversationId}/messages`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data = await response.json();
        const sortedMessages = data.messages.sort(
          (a: Message, b: Message) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setMessages(sortedMessages);
      } catch (err) {
        console.error("Error loading messages:", err);
        setError("Failed to load messages");
      }
    };
    loadMessages();
  }, [conversationId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    onNewMessage(userMessage);

    const currentMessage = message.trim();
    setMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not authenticated");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message: currentMessage, conversationId }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      const data = await response.json();

      if (!conversationId && data.conversationId) {
        onNewConversation(data.conversationId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      onNewMessage(assistantMessage);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-full flex-col bg-[var(--finsight-card)] shadow-[0_0_0_1px_var(--finsight-border)]">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-[var(--finsight-border)] bg-[var(--finsight-surface)] px-6 py-4">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-[var(--finsight-secondary-text)] transition-colors hover:text-[var(--finsight-accent-blue)]"
          >
            <LayoutDashboard className="h-6 w-6" />
          </Link>
          <Link
            href="/goals"
            className="text-[var(--finsight-secondary-text)] transition-colors hover:text-[var(--finsight-accent-blue)]"
          >
            <Target className="h-6 w-6" />
          </Link>
        </div>
        <Link
          href="/profile"
          className="text-[var(--finsight-secondary-text)] transition-colors hover:text-[var(--finsight-accent-blue)]"
        >
          <User className="h-6 w-6" />
        </Link>
      </div>

      {/* Chat header */}
      <div className="border-b border-[var(--finsight-border)] bg-[var(--finsight-card)] px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--finsight-primary-text)]">
          Chat with FinSight
        </h1>
        <p className="mt-0.5 text-sm text-[var(--finsight-secondary-text)]">
          {conversationId
            ? "Your AI financial advisor is ready to help"
            : "Start a new conversation"}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-[var(--finsight-bg)] p-4">
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        <MessageList messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-[var(--finsight-border)] bg-[var(--finsight-surface)] p-4 pl-4 pr-16"
      >
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="flex shrink-0 items-center justify-center rounded-lg bg-[var(--finsight-accent-blue)] px-4 py-2.5 text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about your finances..."
            className="flex-1 rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-card)] px-4 py-2.5 text-[var(--finsight-primary-text)] placeholder-[var(--finsight-muted-text)] focus:border-[var(--finsight-accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--finsight-accent-blue)]/20 disabled:opacity-60"
            disabled={isLoading}
          />
        </div>
      </form>
    </div>
  );
}
