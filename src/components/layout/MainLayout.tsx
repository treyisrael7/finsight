import React from 'react';
import Link from 'next/link';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-green-600">FinLingo</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/learn" className="text-gray-700 hover:text-green-600">
                Learn
              </Link>
              <Link href="/leaderboard" className="text-gray-700 hover:text-green-600">
                Leaderboard
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-green-600">
                Profile
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>© {new Date().getFullYear()} FinLingo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 