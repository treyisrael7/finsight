'use client';

import { motion } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
  isDarkMode?: boolean;
}

export default function LoadingState({ message = 'Loading...', isDarkMode = false }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex items-center space-x-3 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}
      >
        <div className="relative">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin border-emerald-500" />
        </div>
        <span className="text-sm font-medium">{message}</span>
      </motion.div>
    </div>
  );
} 