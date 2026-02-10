"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Target, BookOpen, Sparkles, Shield, Brain, TrendingUp } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('preventRedirect', 'true');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <motion.section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Gradient */}
        <motion.div 
          className="absolute left-1/2 right-1/2 -mx-[50vw] w-[100vw] h-full bg-gradient-to-br from-emerald-600 via-teal-500 to-blue-600"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
        >
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10"></div>
          {/* Floating Orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Login Button */}
        <motion.div
          className="absolute top-8 right-8 z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/login"
              className="group bg-white/20 backdrop-blur-sm text-white border border-white/30 px-6 py-2 rounded-lg text-base font-semibold hover:bg-white/20 transition flex items-center gap-2"
            >
              Login
              <motion.div
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Shield className="w-4 h-4" />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-white mb-6"
              animate={{
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.1)",
                  "0 0 30px rgba(255,255,255,0.2)",
                  "0 0 20px rgba(255,255,255,0.1)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Your AI-Powered
              <motion.span 
                className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-blue-200"
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear"
                }}
              >
                Financial Guide
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto"
              animate={{
                opacity: [0.9, 1, 0.9]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Skip the boring financial advice. Get real insights, clear explanations, and actionable tips through natural conversations.
            </motion.p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="#features"
                  className="group bg-white text-emerald-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2"
                >
                  Learn More
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/signup"
                  className="group bg-emerald-500/10 text-white border border-white/20 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-emerald-500/20 transition flex items-center gap-2"
                >
                  Get Started
                  <motion.div
                    animate={{ rotate: [0, 10, 0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ 
            y: [0, 10, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2,
            ease: "easeInOut"
          }}
        >
          <div className="relative w-6 h-10">
            <div className="absolute inset-0 border-2 border-white/30 rounded-full flex justify-center overflow-hidden">
              <motion.div 
                className="w-1 h-3 bg-white/50 rounded-full mt-2"
                animate={{ 
                  y: [0, 12, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "easeInOut"
                }}
              />
            </div>
            <motion.div 
              className="absolute inset-0 border-2 border-white/30 rounded-full"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.1, 0.3]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        id="features"
        className={`py-24 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} relative overflow-hidden`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('/images/grid.svg')]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Why You'll Love It
            </h2>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Financial advice that actually makes sense, minus the jargon
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageSquare className="w-6 h-6" />,
                title: "Natural Conversations",
                description: "No financial jargon here. Just clear, straightforward advice.",
              },
              {
                icon: <Target className="w-6 h-6" />,
                title: "Smart Money Moves",
                description: "Get personalized tips that actually make sense for your situation.",
              },
              {
                icon: <Brain className="w-6 h-6" />,
                title: "AI That Adapts",
                description: "Your AI guide learns your style and adapts to how you think about money.",
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Smart Insights",
                description: "Get personalized financial insights and recommendations based on your goals.",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Your Money, Your Rules",
                description: "We keep your chats private and never store sensitive financial info.",
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: "Always Here to Help",
                description: "Need advice at 2 AM? Your AI guide is ready when you are.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring", 
                  stiffness: 400, 
                  damping: 25 
                }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-2xl ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border border-gray-700' 
                    : 'bg-white border border-gray-100'
                } shadow-lg hover:shadow-xl transition-all duration-200`}
              >
                <motion.div 
                  className={`p-3 rounded-lg w-fit mb-4 ${
                    isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <div className="text-emerald-500">{feature.icon}</div>
                </motion.div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="relative py-24 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
        >
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10"></div>
          {/* Floating Orbs */}
          <motion.div
            className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"
            animate={{
              x: [0, 40, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            animate={{
              textShadow: [
                "0 0 20px rgba(255,255,255,0.1)",
                "0 0 30px rgba(255,255,255,0.2)",
                "0 0 20px rgba(255,255,255,0.1)"
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p 
            className="text-xl text-white/90 mb-8"
            animate={{
              opacity: [0.9, 1, 0.9]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Join now and let's make managing money a little less complicated
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-white text-emerald-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
              >
                Get Started
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-emerald-500/10 text-white border border-white/20 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-emerald-500/20 transition"
              >
                Login
                <Shield className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </MainLayout>
  );
}
