"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { validatePassword } from "@/lib/validation";
import { rateLimiter } from "@/lib/rateLimit";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ErrorMessage from "./ErrorMessage";
import FormInput from "./FormInput";
import LoadingSpinner from "./LoadingSpinner";
import { toast } from "react-hot-toast";

interface SignupFormProps {
  onSuccess: () => void;
  isDarkMode?: boolean;
}

export default function SignupForm({ onSuccess, isDarkMode = false }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const supabase = createClientComponentClient();

  const handleSignup = async () => {
    setIsLoading(true);
    setError("");
    setValidationErrors([]);

    if (rateLimiter.isRateLimited(email)) {
      setIsRateLimited(true);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setValidationErrors(["Passwords do not match"]);
      setIsLoading(false);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setValidationErrors(passwordValidation.errors);
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        rateLimiter.reset(email);
        toast.success('Please check your email for a confirmation link!', {
          duration: 5000,
          position: 'top-center',
        });
        setEmail('');
        setPassword('');
        setConfirmPassword('');
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
      {validationErrors.length > 0 && (
        <ErrorMessage type="warning" messages={validationErrors} />
      )}
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
        isDarkMode={isDarkMode}
      />

      <FormInput
        id="password"
        type="password"
        label="Password"
        placeholder="Create a password"
        onChange={setPassword}
        disabled={isRateLimited}
        isDarkMode={isDarkMode}
      />

      <FormInput
        id="confirmPassword"
        type="password"
        label="Confirm Password"
        placeholder="Confirm your password"
        onChange={setConfirmPassword}
        disabled={isRateLimited}
        isDarkMode={isDarkMode}
      />

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleSignup}
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
            Creating Account...
          </span>
        ) : (
          "Sign Up"
        )}
      </motion.button>
    </div>
  );
}
