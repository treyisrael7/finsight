"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import SignupForm from "../../components/auth/SignupForm";

export default function SignupPage() {
  const router = useRouter();

  const handleSignupSuccess = () => {
    router.push("/verify-email");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Join FinSight</h1>
          <p className="text-gray-600">Start your financial journey today</p>
        </div>

        <SignupForm onSuccess={handleSignupSuccess} />

        <div className="text-center mt-4">
          <Link 
            href="/"
            className="text-sm text-gray-600 hover:text-teal-500 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
