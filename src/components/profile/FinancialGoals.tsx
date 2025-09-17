import { useState, useEffect } from 'react';
import { Target } from "lucide-react";
import Link from 'next/link';

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
          return 'bg-orange-200 text-orange-900';
        case 'medium_term':
          return 'bg-blue-200 text-blue-900';
        default:
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-50'} rounded-lg`}>
              <Target className={`w-5 h-5 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Financial Goals</h3>
          </div>
          <Link
            href="/goals"
            className={`text-sm font-medium ${
              isDarkMode 
                ? 'text-teal-400 hover:text-teal-300' 
                : 'text-teal-600 hover:text-teal-500'
            } transition-colors`}
          >
            Track Progress
          </Link>
        </div>
        <div className="space-y-8">
          {(['short_term', 'medium_term', 'long_term'] as const).map((term) => (
            <div key={term} className="space-y-4">
              <h4 className="text-base font-medium text-foreground">
                {term === 'short_term' ? 'Short Term (1-2 years)' :
                 term === 'medium_term' ? 'Medium Term (3-5 years)' :
                 'Long Term (5+ years)'}
              </h4>
              
              {goalOptions[term].map(goal => (
                <label
                  key={goal}
                  className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${goals[term].includes(goal)
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

              {/* Show custom goals */}
              {goals[term].filter(goal => !goalOptions[term].includes(goal)).map(customGoal => (
                <div
                  key={customGoal}
                  className={`relative flex items-center justify-between p-4 rounded-xl border-2 transition-all
                    border-teal-500 ${isDarkMode ? 'bg-teal-900/20' : 'bg-teal-50'}`}
                >
                  <label className="flex items-center cursor-pointer m-0">
                    <input
                      type="checkbox"
                      checked={goals[term].includes(customGoal)}
                      onChange={() => onGoalChange(term, customGoal)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-center w-5 h-5 rounded border mr-3 bg-teal-500 border-teal-500">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-foreground">{customGoal}</span>
                  </label>
                </div>
              ))}

              {/* Custom Goal Input */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Add custom goal..."
                    className={`flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900/20 transition-colors
                      ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const value = input.value.trim();
                        if (value) {
                          onGoalChange(term, value);
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      const value = input.value.trim();
                      if (value) {
                        onGoalChange(term, value);
                        input.value = '';
                      }
                    }}
                    className={`px-4 py-2.5 rounded-lg ${
                      isDarkMode 
                        ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                        : 'bg-teal-500 hover:bg-teal-600 text-white'
                    } transition-colors`}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-6 ${cardClasses}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${isDarkMode ? 'bg-primary/10' : 'bg-primary/10'} rounded-lg`}>
            <Target className={`w-5 h-5 ${isDarkMode ? 'text-primary' : 'text-primary'}`} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Financial Goals</h3>
        </div>
        <Link
          href="/goals"
          className={`text-sm font-medium ${
            isDarkMode 
              ? 'text-teal-400 hover:text-teal-300' 
              : 'text-teal-600 hover:text-teal-500'
          } transition-colors`}
        >
          Track Progress
        </Link>
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