"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
      }
    };
    checkSession();
  }, [router]);

  return (
    <MainLayout>
      {/* Hero Section */}
      <motion.section
        className="text-center py-20 bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-bold mb-6">Meet FinSight</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Your intelligent chatbot advisor for smarter portfolio decisions.
        </p>
        <Link
          href="/chat"
          className="bg-white text-emerald-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-200 transition"
        >
          Start Chatting
        </Link>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-16 bg-gray-100 shadow-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Why Use My Chatbot?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 px-6">
          {[
            {
              icon: "💬",
              title: "Instant Advice",
              description: "Get immediate answers to your financial questions and advice tailored to your needs.",
            },
            {
              icon: "📈",
              title: "Portfolio Insights",
              description: "Receive insights and recommendations based on your current portfolio and financial goals.",
            },
            {
              icon: "🔍",
              title: "Personalized Learning",
              description: "Learn about financial concepts through interactive conversations and tailored resources.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-200"
              whileHover={{ scale: 1.03 }}
            >
              <div className="text-emerald-500 text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg p-10 text-center text-white mt-10 mx-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-3xl font-bold mb-4">
          Ready to Enhance Your Financial Knowledge?
        </h2>
        <p className="mb-6">
          Join our community and start chatting with your personal financial advisor today!
        </p>
        <Link
          href="/signup"
          className="bg-white text-emerald-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-200 transition"
        >
          Sign Up Now
        </Link>
      </motion.section>
    </MainLayout>
  );
}
