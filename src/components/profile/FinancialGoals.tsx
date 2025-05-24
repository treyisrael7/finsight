import { useState, useEffect } from 'react';
import { Target } from "lucide-react";

interface FinancialGoalsProps {
  isEditing: boolean;
  goals: {
    short_term: string[];
    medium_term: string[];
    long_term: string[];
  };
  onGoalChange: (term: 'short_term' | 'medium_term' | 'long_term', goal: string) => void;
}

const goalOptions = {
  short_term: [
    "Build emergency fund",
    "Pay off credit card debt",
    "Save for vacation",
    "Start investing",
    "Improve credit score"
  ],
  medium_term: [
    "Buy a house",
    "Start a business",
    "Save for wedding",
    "Pay off student loans",
    "Save for down payment"
  ],
  long_term: [
    "Retirement planning",
    "College fund for children",
    "Wealth building",
    "Estate planning",
    "Financial independence"
  ]
};

export default function FinancialGoals({ isEditing, goals, onGoalChange }: FinancialGoalsProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const htmlElement = document.documentElement;
    setIsDarkMode(htmlElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDarkMode(htmlElement.classList.contains('dark'));
    });

    observer.observe(htmlElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const getTermColor = (term: string) => {
    if (isDarkMode) {
      switch (term) {
        case 'short_term':
          return 'bg-orange-900 text-orange-200';
        case 'medium_term':
          return 'bg-blue-900 text-blue-200';
        default:
          return 'bg-purple-900 text-purple-200';
      }
    } else {
      switch (term) {
        case 'short_term':
          // Use bg-orange-200 and text-orange-900 as suggested for better light mode contrast
          return 'bg-orange-200 text-orange-900';
        case 'medium_term':
          // Use bg-blue-200 and text-blue-900 as suggested for better light mode contrast
          return 'bg-blue-200 text-blue-900';
        default:
          // Use bg-purple-200 and text-purple-900 as suggested for better light mode contrast
          return 'bg-purple-200 text-purple-900';
      }
    }
  };

  const cardClasses = isDarkMode
    ? 'shadow-md border border-gray-700 bg-gray-800/90'
    : 'shadow-sm border border-border bg-white';

  if (isEditing) {
    return (
      <div className={`rounded-xl p-6 ${cardClasses}`}>
        <div className="flex items-center space-x-3 mb-6">
          {/* Use client-side dark mode check for icon background and color */}
          <div className={`p-2 ${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-50'} rounded-lg`}>
            <Target className={`w-5 h-5 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Financial Goals</h3>
        </div>
        <div className="space-y-8">
          {(['short_term', 'medium_term', 'long_term'] as const).map((term) => (
            <div key={term} className="space-y-4">
              <h4 className="text-base font-medium text-foreground">
                {term === 'short_term' ? 'Short Term (1-2 years)' :
                 term === 'medium_term' ? 'Medium Term (3-5 years)' :
                 'Long Term (5+ years)'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goalOptions[term].map(goal => (
                  <label
                    key={goal}
                    className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${goals[term].includes(goal)
                        // Use client-side dark mode check for selected goal background
                        ? `border-teal-500 ${isDarkMode ? 'bg-teal-900/20' : 'bg-teal-50'}`
                        : 'border-border hover:border-teal-200 hover:bg-card'}`}
                  >
                    <input
                      type="checkbox"
                      checked={goals[term].includes(goal)}
                      onChange={() => onGoalChange(term, goal)}
                      className="sr-only"
                    />
                    <div className={`flex items-center justify-center w-5 h-5 rounded border mr-3
                      ${goals[term].includes(goal)
                        ? 'bg-teal-500 border-teal-500'
                        : 'border-border'}`}
                    >
                      {goals[term].includes(goal) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">{goal}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-6 ${cardClasses}`}>
      <div className="flex items-center space-x-3 mb-6">
         {/* Use client-side dark mode check for icon background and color */}
        <div className={`p-2 ${isDarkMode ? 'bg-primary/10' : 'bg-primary/10'} rounded-lg`}>
          <Target className={`w-5 h-5 ${isDarkMode ? 'text-primary' : 'text-primary'}`} />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Financial Goals</h3>
      </div>
      <div className="space-y-8">
        {(['short_term', 'medium_term', 'long_term'] as const).map((term) => (
          <div key={term} className="space-y-4">
            <h4 className="text-base font-medium text-foreground">
              {term === 'short_term' ? 'Short Term (1-2 years)' :
               term === 'medium_term' ? 'Medium Term (3-5 years)' :
               'Long Term (5+ years)'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {goals[term].length > 0 ? (
                goals[term].map((goal) => (
                  <span
                    key={goal}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${getTermColor(term)}`}
                  >
                    {goal}
                  </span>
                ))
              ) : (
                <p className="text-muted-foreground italic">No {term.replace('_', ' ')} goals set</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 