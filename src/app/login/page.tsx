"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase"; // Ensure this path is correct
import { rateLimiter } from "@/lib/rateLimit"; // Ensure this path is correct

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    // Check rate limiting
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
        // Reset rate limit on successful login
        rateLimiter.reset(email);
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) router.push("/dashboard");
    };
    getSession();
  }, [router]);

  return (
    <div className="max-w-sm mx-auto mt-16 p-6 border rounded">
      <h1 className="text-xl font-bold mb-4">Login to FinSight</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isRateLimited && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-4 py-3 rounded mb-4">
          Too many login attempts. Please try again later.
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
            placeholder="Enter your password"
            className="border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
            onChange={(e) => setPassword(e.target.value)}
            disabled={isRateLimited}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading || isRateLimited}
          className={`w-full py-2 px-4 rounded text-white font-medium
            ${
              isLoading || isRateLimited
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>
      </div>
    </div>
  );
}