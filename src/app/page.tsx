'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/subabase';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Learn Finance the Fun Way
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Master financial literacy through interactive lessons, games, and challenges.
          Start your journey to financial freedom today!
        </p>
        <Link
          href="/learn"
          className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Start Learning
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose FinLingo?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-600 text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold mb-2">Gamified Learning</h3>
            <p className="text-gray-600">
              Learn through interactive exercises, earn points, and track your progress with our engaging gamification system.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-600 text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Structured Curriculum</h3>
            <p className="text-gray-600">
              Follow carefully designed learning paths from basic concepts to advanced financial strategies.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-600 text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Achievement System</h3>
            <p className="text-gray-600">
              Earn badges, maintain streaks, and compete with others on the leaderboard.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-50 rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Financial Journey?</h2>
        <p className="text-gray-600 mb-6">
          Join thousands of learners who are already improving their financial literacy with FinLingo.
        </p>
        <Link
          href="/signup"
          className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Sign Up Now
        </Link>
      </section>
    </MainLayout>
  );
}
