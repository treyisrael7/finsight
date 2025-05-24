"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Loading() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const htmlElement = document.documentElement;
    const theme = localStorage.getItem('theme') || 'system';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    setIsDarkMode(isDark);

    const observer = new MutationObserver(() => {
      setIsDarkMode(htmlElement.classList.contains('dark'));
    });

    observer.observe(htmlElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Set initial background color based on system preference
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'system';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)]">
        <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg transition-colors duration-200`}>
          <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-200`}>
            <div className={`h-6 w-48 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded animate-pulse mb-2 transition-colors duration-200`} />
            <div className={`h-4 w-32 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded animate-pulse transition-colors duration-200`} />
          </div>

          <div className="flex-1 p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`h-12 rounded-lg animate-pulse transition-colors duration-200 ${
                    i % 2 === 0 
                      ? isDarkMode 
                        ? "bg-gray-700 w-64" 
                        : "bg-gray-100 w-64"
                      : isDarkMode
                        ? "bg-teal-900/50 w-48"
                        : "bg-teal-100 w-48"
                  }`}
                />
              </div>
            ))}
          </div>

          <div className={`p-4 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} transition-colors duration-200`}>
            <div className="flex space-x-4">
              <div className={`flex-1 h-10 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg animate-pulse transition-colors duration-200`} />
              <div className={`w-20 h-10 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-lg animate-pulse transition-colors duration-200`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
