"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Conversation } from '@/types/chat';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

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
  refreshKey = 0
}: ChatHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    setMounted(true);
    const htmlElement = document.documentElement;
    setIsDarkMode(htmlElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDarkMode(htmlElement.classList.contains('dark'));
    });

    observer.observe(htmlElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Not authenticated');
      }

      // Get session for access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session');
      }

      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data.conversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [supabase, refreshKey]);

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent conversation selection when clicking delete
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Not authenticated');
      }

      // Get session for access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session');
      }

      // Optimistically update the UI
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        onSelectConversation(null);
      }

      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        // If deletion fails, revert the optimistic update
        await fetchConversations();
        throw new Error('Failed to delete conversation');
      }

      // Call the parent's onDeleteConversation handler
      onDeleteConversation(conversationId);
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation');
      // Refresh the conversations list to ensure UI is in sync
      await fetchConversations();
    }
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="animate-pulse">
          <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4 mb-4`}></div>
          <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2 mb-4`}></div>
          <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-2/3`}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} overflow-y-auto h-full`}>
      <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Chat History</h2>
      <button
        onClick={() => onSelectConversation(null)}
        className="w-full mb-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
      >
        New Chat
      </button>
      {conversations.length === 0 ? (
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No previous conversations</p>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-300'} rounded-lg ${isDarkMode ? 'shadow-sm' : 'shadow-md'} hover:shadow-lg transition-shadow cursor-pointer ${
                selectedConversation?.id === conversation.id ? 'ring-2 ring-emerald-500' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {conversation.title || 'New Conversation'}
                </h3>
                <button
                  onClick={(e) => handleDelete(conversation.id, e)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition-colors`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {(() => {
                  const d = conversation.updated_at && new Date(conversation.updated_at);
                  return d && !isNaN(d.getTime())
                    ? (
                      <>
                        <div>{format(d, 'MMM d')}</div>
                        <div>{format(d, 'h:mm a')}</div>
                      </>
                    )
                    : 'No date';
                })()}
              </div>
              {conversation.messages && conversation.messages.length > 0 && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2 mt-2`}>
                  {(() => {
                    const messages = conversation.messages;
                    if (messages.length === 1) {
                      return messages[0].content;
                    }
                    // Show a summary of the conversation
                    const firstMessage = messages[0].content;
                    const lastMessage = messages[messages.length - 1].content;
                    return `${firstMessage.slice(0, 30)}... → ${lastMessage.slice(0, 30)}...`;
                  })()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 