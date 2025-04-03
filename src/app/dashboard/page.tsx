"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { motion } from "framer-motion";
import { MessageSquare, BookOpen, Target } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
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
        const email = session.user.email;
        if (email) {
          setUserEmail(email);
          setAuthStatus("authenticated");
        } else {
          console.warn("No email found on session user.");
          await supabase.auth.signOut();
          setAuthStatus("unauthenticated");
          router.replace("/login");
        }
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
        <div className="p-8 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const features = [
    {
      title: "Chat with FinSight",
      description: "Get personalized financial advice",
      icon: MessageSquare,
      onClick: () => router.push("/chat"),
    },
    {
      title: "Learning Resources",
      description: "Browse financial learning materials",
      icon: BookOpen,
      onClick: () => router.push("/resources"),
    },
    {
      title: "Financial Goals",
      description: "Set and track your goals",
      icon: Target,
      onClick: () => {},
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Top Bar */}
      <div className="backdrop-blur-md bg-white/70 border-b border-gray-200/20 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-blue-500 text-transparent bg-clip-text">
              FinSight
            </h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-emerald-500 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl shadow-xl p-12 text-white mb-12"
        >
          <h1 className="text-4xl font-bold mb-3">Welcome back 👋</h1>
          <p className="text-white/90 text-lg">Logged in as {userEmail}</p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.button
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={feature.onClick}
              className="group p-8 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all text-left hover:-translate-y-1 hover:border-emerald-300 cursor-pointer"
            >
              <div className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl p-3 w-fit mb-6 shadow-md">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-2 text-gray-800 group-hover:text-emerald-600">
                {feature.title}
              </h3>
              <p className="text-gray-600 group-hover:text-gray-800">
                {feature.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
