"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import ChatHistory from "@/components/chat/ChatHistory";
import ChatInterface from "@/components/chat/ChatInterface";
import { Conversation, Message } from "@/types/chat";

interface ChatClientProps {
  user: User;
}

export default function ChatClient({ user }: ChatClientProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectConversation = (conversation: Conversation | null) => {
    setSelectedConversation(conversation);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
    }
    setRefreshKey((prev) => prev + 1);
  };

  const handleNewMessage = (message: Message) => {
    if (selectedConversation) {
      setSelectedConversation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...(prev.messages || []), message],
        };
      });
      setRefreshKey((prev) => prev + 1);
    }
  };

  const handleNewConversation = (conversationId: string) => {
    const newConversation: Conversation = {
      id: conversationId,
      title: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [],
    };
    setSelectedConversation(newConversation);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen w-full bg-[var(--finsight-bg)]">
      <div className="w-64 flex-shrink-0 border-r border-[var(--finsight-border)]">
        <ChatHistory
          key={refreshKey}
          refreshKey={refreshKey}
          onSelectConversation={handleSelectConversation}
          selectedConversation={selectedConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>
      <div className="flex flex-1 flex-col min-w-0">
        <ChatInterface
          conversationId={selectedConversation?.id || null}
          onNewMessage={handleNewMessage}
          onNewConversation={handleNewConversation}
        />
      </div>
    </div>
  );
}
