import React from "react";
import Link from "next/link";
import { motion, useScroll } from "framer-motion";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      const previous = scrollY.getPrevious();
      if (previous && latest > previous && latest > 150) {
        setHidden(true);
      } else {
        setHidden(false);
      }
    });

    return () => unsubscribe();
  }, [scrollY]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        className="backdrop-blur-md bg-white/70 border-b border-gray-200/20 sticky top-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: 1,
          y: hidden ? -100 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 text-transparent bg-clip-text hover:opacity-80 transition">
                  FinSight
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/chat"
                className="text-gray-600 hover:text-teal-600 hover:scale-105 transition-all"
              >
                Chatbot
              </Link>
              <Link
                href="/resources"
                className="text-gray-600 hover:text-teal-600 hover:scale-105 transition-all"
              >
                Resources
              </Link>
              <Link
                href="/profile"
                className="text-gray-600 hover:text-teal-600 hover:scale-105 transition-all"
              >
                Profile
              </Link>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Main Content */}
      <main className="flex-grow bg-[var(--background)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        className="border-t border-gray-200 mt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 text-sm">
            <p>© {new Date().getFullYear()} FinSight. All rights reserved.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
