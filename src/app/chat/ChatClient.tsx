"use client";

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import ChatHistory from '@/components/chat/ChatHistory';
import ChatInterface from '@/components/chat/ChatInterface';
import { Conversation, Message } from '@/types/chat';

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
    // Clear the selected conversation if it's the one being deleted
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
    }
    // Force a refresh of the conversation list
    setRefreshKey(prev => prev + 1);
  };

  const handleNewMessage = (message: Message) => {
    // Update the selected conversation with the new message
    if (selectedConversation) {
      setSelectedConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...(prev.messages || []), message]
        };
      });
      // Refresh the conversation list to show the latest message
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleNewConversation = (conversationId: string) => {
    // Create a new conversation object
    const newConversation: Conversation = {
      id: conversationId,
      title: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: []
    };
    setSelectedConversation(newConversation);
    // Refresh the conversation list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex h-screen w-full">
      <div className="w-64 flex-shrink-0">
        <ChatHistory 
          key={refreshKey}
          refreshKey={refreshKey}
          onSelectConversation={handleSelectConversation}
          selectedConversation={selectedConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>
      <div className="flex-1">
        <ChatInterface 
          conversationId={selectedConversation?.id || null}
          onNewMessage={handleNewMessage}
          onNewConversation={handleNewConversation}
        />
      </div>
    </div>
  );
} 