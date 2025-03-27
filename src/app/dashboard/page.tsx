"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/subabase";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
      } else {
        const email = data.session.user.email;

        if (email) {
          setUserEmail(email);
        } else {
          console.warn("No email found on session user.");
          await supabase.auth.signOut();
          router.push("/login");
        }
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Welcome back 👋</h1>
      <p className="text-gray-500 mb-4">Logged in as {userEmail}</p>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Log Out
      </button>
    </div>
  );
}
