import { useState, useEffect } from 'react';
import { User, Shield, Info } from "lucide-react";

interface PersonalInfoProps {
  isEditing: boolean;
  formData: {
    full_name: string;
    risk_profile: string;
  };
  onFormChange: (field: string, value: string) => void;
}

export default function PersonalInfo({ isEditing, formData, onFormChange }: PersonalInfoProps) {
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

  const iconBgClassTeal = isDarkMode ? 'bg-teal-900/30' : 'bg-transparent';
  const iconColorClassTeal = isDarkMode ? 'text-teal-300' : 'text-teal-700';
  
  const iconBgClassBlue = isDarkMode ? 'bg-blue-900/30' : 'bg-transparent';
  const iconColorClassBlue = isDarkMode ? 'text-blue-300' : 'text-blue-700';

  const riskBadgeClasses = isDarkMode
    ? 'bg-blue-900/30 text-blue-300'
    : 'bg-blue-200 text-blue-900';

  const cardClasses = isDarkMode
    ? 'shadow-md border border-gray-700 bg-gray-800/90'
    : 'shadow-sm border border-border bg-white';

  if (isEditing) {
    return (
      <div className="space-y-8">
        <div className={`rounded-xl p-6 ${cardClasses}`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 ${iconBgClassTeal} rounded-lg`}>
              <User className={`w-5 h-5 ${iconColorClassTeal}`} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-foreground">Name</label>
                <div className="group relative">
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-card text-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-border shadow-lg">
                    Your name will be used by the AI assistant to personalize your experience
                  </div>
                </div>
              </div>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => onFormChange('full_name', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900/20 transition-colors"
                placeholder="Enter your name"
                required
                minLength={2}
                maxLength={50}
              />
              {formData.full_name.length > 0 && formData.full_name.length < 2 && (
                <p className="mt-1 text-sm text-destructive">Name must be at least 2 characters long</p>
              )}
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 ${cardClasses}`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 ${iconBgClassBlue} rounded-lg`}>
              <Shield className={`w-5 h-5 ${iconColorClassBlue}`} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Risk Profile</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Risk Tolerance</label>
            <select
              value={formData.risk_profile}
              onChange={(e) => onFormChange('risk_profile', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900/20 transition-colors"
              required
            >
              <option value="">Select your risk tolerance</option>
              <option value="conservative">Conservative - Prefer stable, low-risk investments</option>
              <option value="moderate">Moderate - Balance between risk and return</option>
              <option value="aggressive">Aggressive - Comfortable with higher risk for higher returns</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className={`rounded-xl p-6 ${cardClasses}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-2 ${iconBgClassTeal} rounded-lg`}>
            <User className={`w-5 h-5 ${iconColorClassTeal}`} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">Your Name</p>
          <p className="mt-1 text-lg font-medium text-foreground">
            {formData.full_name || (
              <span className="text-muted-foreground italic">Not set - Click Edit Profile to set your name</span>
            )}
          </p>
        </div>
      </div>

      <div className={`rounded-xl p-6 ${cardClasses}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-2 ${iconBgClassBlue} rounded-lg`}>
            <Shield className={`w-5 h-5 ${iconColorClassBlue}`} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Risk Profile</h3>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">Risk Tolerance</p>
          <div className="mt-1 flex items-center">
            <span className="text-lg font-medium text-foreground capitalize">
              {formData.risk_profile || (
                <span className="text-muted-foreground italic">Not set - Click Edit Profile to set your risk tolerance</span>
              )}
            </span>
            {formData.risk_profile && (
              <span className={`ml-2 px-2.5 py-0.5 text-xs font-medium rounded-full ${riskBadgeClasses}`}>
                {formData.risk_profile === 'conservative' ? 'Low Risk' :
                 formData.risk_profile === 'moderate' ? 'Medium Risk' : 'High Risk'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 