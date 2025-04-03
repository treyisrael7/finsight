import { useState } from "react";
import { motion } from "framer-motion";
import { validatePassword } from "@/lib/validation";
import { rateLimiter } from "@/lib/rateLimit";
import { supabase } from "../../../lib/supabase";
import ErrorMessage from "./ErrorMessage";
import FormInput from "./FormInput";
import LoadingSpinner from "./LoadingSpinner";

interface SignupFormProps {
  onSuccess: () => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
      />

      <FormInput
        id="password"
        type="password"
        label="Password"
        placeholder="Create a password"
        onChange={setPassword}
        disabled={isRateLimited}
      />

      <FormInput
        id="confirmPassword"
        type="password"
        label="Confirm Password"
        placeholder="Confirm your password"
        onChange={setConfirmPassword}
        disabled={isRateLimited}
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
