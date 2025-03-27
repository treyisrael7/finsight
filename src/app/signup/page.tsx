"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/subabase";
import { validatePassword } from "@/lib/validation";
import { rateLimiter } from "@/lib/rateLimit";

export default function SignupPage() {
  const router = useRouter();
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

    // Check rate limiting
    if (rateLimiter.isRateLimited(email)) {
      setIsRateLimited(true);
      setIsLoading(false);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setValidationErrors(["Passwords do not match"]);
      setIsLoading(false);
      return;
    }

    // Validate password strength
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
        // Reset rate limit on successful signup
        rateLimiter.reset(email);
        router.push("/verify-email");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 p-6 border rounded">
      <h1 className="text-xl font-bold mb-4">Create Account</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-4 py-3 rounded mb-4">
          <ul className="list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {isRateLimited && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-4 py-3 rounded mb-4">
          Too many attempts. Please try again later.
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
            onChange={(e) => setEmail(e.target.value)}
            disabled={isRateLimited}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Create a password"
            className="border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
            onChange={(e) => setPassword(e.target.value)}
            disabled={isRateLimited}
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            className="border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isRateLimited}
          />
        </div>

        <button
          onClick={handleSignup}
          disabled={isLoading || isRateLimited}
          className={`w-full py-2 px-4 rounded text-white font-medium
            ${
              isLoading || isRateLimited
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>
      </div>
    </div>
  );
}
