"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Message, Conversation } from '@/types/chat';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  conversationId: string | null;
  onNewMessage: (message: Message) => void;
  onNewConversation: (conversationId: string) => void;
}

export default function ChatInterface({ 
  conversationId, 
  onNewMessage,
  onNewConversation 
}: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages when conversation is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationId) {
        setMessages([]);
        return;
      }

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(`/api/conversations/${conversationId}/messages`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        // Sort messages by timestamp
        const sortedMessages = data.messages.sort((a: Message, b: Message) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setMessages(sortedMessages);
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Failed to load messages');
      }
    };

    loadMessages();
  }, [conversationId, supabase]);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    // Create and show user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      created_at: new Date().toISOString()
    };

    // Update local messages state with user message
    setMessages(prev => [...prev, userMessage]);
    onNewMessage(userMessage);

    // Clear input and set loading state
    const currentMessage = message.trim();
    setMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          message: currentMessage,
          conversationId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // If this is a new conversation, notify the parent
      if (!conversationId && data.conversationId) {
        onNewConversation(data.conversationId);
      }
      
      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString()
      };

      // Update messages with assistant response
      setMessages(prev => [...prev, assistantMessage]);
      onNewMessage(assistantMessage);

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg`}>
      {/* Top Bar */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex items-center justify-between z-10`}>
        <button
          onClick={handleBackToDashboard}
          className={`flex items-center ${isDarkMode ? 'text-gray-300 hover:text-emerald-400' : 'text-gray-700 hover:text-emerald-500'} transition`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back to Dashboard</span>
        </button>
        <div className={`flex items-center gap-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <Link
            href="/resources"
            className={`hover:text-emerald-500 transition`}
          >
            Resources
          </Link>
          <Link
            href="/profile"
            className={`hover:text-emerald-500 transition`}
          >
            Profile
          </Link>
        </div>
      </div>
      {/* Chat Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 text-white shadow-inner">
        <h1 className="text-2xl font-bold mb-1">💬 Chat with FinSight</h1>
        <p className="text-white/90 text-sm">
          {conversationId ? 'Your AI financial advisor is ready to help' : 'Start a new conversation'}
        </p>
      </div>
      {/* Chat Content */}
      <div className={`flex-1 overflow-y-auto p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {error && (
          <div className={`${isDarkMode ? 'bg-red-900/50 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-600'} border px-4 py-2 rounded-lg mb-4`}>
            {error}
          </div>
        )}
        <MessageList messages={messages} isLoading={isLoading} isDarkMode={isDarkMode} />
        <div ref={messagesEndRef} />
      </div>
      {/* Chat Input */}
      <form onSubmit={handleSubmit} className={`border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4 pr-20`}>
        <div className="flex space-x-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className={`flex-1 px-4 py-2 rounded-lg appearance-none focus:outline-none focus:ring-0 !ring-0 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-gray-600' 
                : 'border border-gray-300 focus:border-gray-300'
            }`}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 