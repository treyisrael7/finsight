"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Conversation } from "@/types/chat";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

interface ChatHistoryProps {
  onSelectConversation: (conversation: Conversation | null) => void;
  selectedConversation: Conversation | null;
  onDeleteConversation: (conversationId: string) => void;
  refreshKey?: number;
}

export default function ChatHistory({
  onSelectConversation,
  selectedConversation,
  onDeleteConversation,
  refreshKey = 0,
}: ChatHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not authenticated");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      const response = await fetch("/api/conversations", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch conversations");
      const data = await response.json();
      setConversations(data.conversations);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [supabase, refreshKey]);

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not authenticated");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        onSelectConversation(null);
      }
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) {
        await fetchConversations();
        throw new Error("Failed to delete conversation");
      }
      onDeleteConversation(conversationId);
    } catch (err) {
      console.error("Error deleting conversation:", err);
      setError("Failed to delete conversation");
      await fetchConversations();
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex h-full flex-col bg-[var(--finsight-surface)] p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-3/4 rounded bg-[var(--finsight-card)]" />
          <div className="h-4 w-1/2 rounded bg-[var(--finsight-card)]" />
          <div className="h-4 w-2/3 rounded bg-[var(--finsight-card)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col bg-[var(--finsight-surface)] p-4">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[var(--finsight-surface)] p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--finsight-muted-text)]">
        Chat history
      </h2>
      <button
        onClick={() => onSelectConversation(null)}
        className="mb-4 w-full rounded-lg bg-[var(--finsight-accent-blue)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
      >
        New chat
      </button>
      {conversations.length === 0 ? (
        <p className="text-sm text-[var(--finsight-muted-text)]">No previous conversations</p>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => {
            const isSelected = selectedConversation?.id === conversation.id;
            return (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  isSelected
                    ? "border-[var(--finsight-accent-blue)] bg-[var(--finsight-accent-blue)]/10 ring-1 ring-[var(--finsight-accent-blue)]/30"
                    : "border-[var(--finsight-border)] bg-[var(--finsight-card)] hover:border-[var(--finsight-accent-blue)]/30 hover:bg-[var(--finsight-card)]"
                }`}
              >
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <h3 className="truncate text-sm font-medium text-[var(--finsight-primary-text)]">
                    {conversation.title || "New conversation"}
                  </h3>
                  <button
                    onClick={(e) => handleDelete(conversation.id, e)}
                    className="shrink-0 rounded p-1 text-[var(--finsight-muted-text)] transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-xs text-[var(--finsight-muted-text)]">
                  {(() => {
                    const d =
                      conversation.updated_at && new Date(conversation.updated_at);
                    return d && !isNaN(d.getTime()) ? (
                      <>
                        <div>{format(d, "MMM d")}</div>
                        <div>{format(d, "h:mm a")}</div>
                      </>
                    ) : (
                      "No date"
                    );
                  })()}
                </div>
                {conversation.messages && conversation.messages.length > 0 && (
                  <p className="mt-2 line-clamp-2 text-xs text-[var(--finsight-secondary-text)]">
                    {(() => {
                      const msgs = conversation.messages;
                      if (msgs.length === 1) return msgs[0].content;
                      const first = msgs[0].content;
                      const last = msgs[msgs.length - 1].content;
                      return `${first.slice(0, 30)}... → ${last.slice(0, 30)}...`;
                    })()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
