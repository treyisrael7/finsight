import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

export default function ProfileHeader() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const htmlElement = document.documentElement;
    setIsDarkMode(htmlElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDarkMode(htmlElement.classList.contains('dark'));
    });

    observer.observe(htmlElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Render null on the server to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="px-6 py-8 bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-white/10 rounded-full">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          <p className="mt-1 text-white/90">Manage your personal information and preferences</p>
        </div>
      </div>
    </div>
  );
}