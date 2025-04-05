"use client";

import { useState, useEffect } from "react";
import { Message } from "@/types/chat";
import MessageList from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setAuthStatus("unauthenticated");
          router.replace("/login");
          return;
        }
        setAuthStatus("authenticated");
      } catch (error) {
        setAuthStatus("unauthenticated");
        router.replace("/login");
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 rounded-lg"
        >
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        </motion.div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content,
        isUser: false,
        timestamp: new Date(data.timestamp),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-300 via-gray-100 to-gray-400">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto h-screen flex flex-col bg-white/70 backdrop-blur-xl shadow-2xl border-t border-b border-white/40"
      >
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-white/30 flex items-center justify-between bg-white/40 backdrop-blur-md z-10">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center text-gray-700 hover:text-emerald-500 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-4 text-sm text-gray-700">
            <button
              onClick={() => setMessages([])}
              className="hover:text-emerald-500 transition"
            >
              Clear Chat
            </button>
            <Link
              href="/resources"
              className="hover:text-emerald-500 transition"
            >
              Resources
            </Link>
          </div>
        </div>

        {/* Chat Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 text-white shadow-inner">
          <h1 className="text-2xl font-bold mb-1">💬 Chat with FinSight</h1>
          <p className="text-white/90 text-sm">
            Your AI financial advisor is ready to help
          </p>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="h-full flex items-center justify-center px-6"
            >
              <div className="max-w-md text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Welcome to FinSight Chat! 👋
                </h2>
                <p className="text-gray-600 mb-4">
                  I can help you with financial planning, investment strategies,
                  and market analysis. What would you like to know?
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "Tell me about investing basics",
                    "How to create a budget?",
                    "Explain market trends",
                  ].map((suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-4 py-2 bg-white rounded-full text-sm text-gray-700 hover:bg-emerald-100 hover:text-emerald-700 border border-gray-200 shadow-sm transition-all"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <MessageList messages={messages} isLoading={isLoading} />
          )}
        </div>

        {/* Chat Input */}
        <div className="border-t border-gray-200 bg-white/60 px-4 py-3">
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </motion.div>
    </div>
  );
}
