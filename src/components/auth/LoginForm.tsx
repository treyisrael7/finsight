"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { rateLimiter } from "@/lib/rateLimit";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ErrorMessage from "./ErrorMessage";
import FormInput from "./FormInput";
import LoadingSpinner from "./LoadingSpinner";

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const supabase = createClientComponentClient();

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    if (rateLimiter.isRateLimited(email)) {
      setIsRateLimited(true);
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        rateLimiter.reset(email);
        onSuccess();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <ErrorMessage type="error" message={error} />}
      {isRateLimited && (
        <ErrorMessage
          type="warning"
          message="Too many attempts. Please try again later."
        />
      )}

      <FormInput
        id="email"
        type="email"
        label="Email"
        placeholder="Enter your email"
        onChange={setEmail}
        disabled={isRateLimited}
      />

      <FormInput
        id="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        onChange={setPassword}
        disabled={isRateLimited}
      />

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleLogin}
        disabled={isLoading || isRateLimited}
        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
          ${
            isLoading || isRateLimited
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
          }`}
      >
        {isLoading ? (
          <span className="flex items-center">
            <LoadingSpinner />
            Signing In...
          </span>
        ) : (
          "Sign In"
        )}
      </motion.button>
    </div>
  );
}
