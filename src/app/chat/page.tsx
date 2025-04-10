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

    // Set up auth state listener
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

  // Show loading state while checking auth
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

  // Don't render anything if not authenticated
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

    // TODO: Add actual API call here
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "This is a placeholder response. The actual AI integration will be implemented soon.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Top Bar */}
      <div className="backdrop-blur-md bg-white/70 border-b border-gray-200/20 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center text-gray-600 hover:text-emerald-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMessages([])}
                className="text-sm text-gray-600 hover:text-emerald-500 transition-colors"
              >
                Clear Chat
              </button>
              <Link
                href="/resources"
                className="text-sm text-gray-600 hover:text-emerald-500 transition-colors"
              >
                Resources
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto px-4 py-6"
      >
        <div className="flex flex-col h-[calc(100vh-5rem)] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Chat Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
            <h1 className="text-2xl font-bold mb-1">Chat with FinSight</h1>
            <p className="text-white/90 text-sm">
              Your AI financial advisor is ready to help
            </p>
          </div>

          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-white to-gray-50">
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
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                      }}
                      className="px-4 py-2 bg-white rounded-full text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <MessageList messages={messages} isLoading={isLoading} />
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4">
            <ChatInput
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
