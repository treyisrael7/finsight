import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import GoalCard from './goals/GoalCard';
import AddGoalModal from './goals/AddGoalModal';
import GoalProgress from './goals/GoalProgress';

interface Goal {
  id: string;
  name: string;
  term: 'short_term' | 'medium_term' | 'long_term';
  target: number;
  current: number;
  deadline: string;
}

interface GoalsProps {
  isDarkMode: boolean;
}

export default function Goals({ isDarkMode }: GoalsProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ current: number; target: number; deadline: string } | null>(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    term: 'short_term' as const,
    target: 0,
    deadline: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const savedGoals = localStorage.getItem('goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  const handleAddGoal = () => {
    if (newGoal.name && newGoal.target > 0 && newGoal.deadline) {
      const goal: Goal = {
        id: Date.now().toString(),
        name: newGoal.name,
        term: newGoal.term,
        target: newGoal.target,
        current: 0,
        deadline: newGoal.deadline
      };
      setGoals([...goals, goal]);
      setNewGoal({
        name: '',
        term: 'short_term',
        target: 0,
        deadline: new Date().toISOString().split('T')[0]
      });
      setIsAddModalOpen(false);
    }
  };

  const handleEditClick = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      setEditingGoalId(goalId);
      setEditValues({
        current: goal.current,
        target: goal.target,
        deadline: goal.deadline
      });
    }
  };

  const handleSaveProgress = () => {
    if (editingGoalId && editValues) {
      setGoals(goals.map(goal => 
        goal.id === editingGoalId
          ? { ...goal, ...editValues }
          : goal
      ));
      setEditingGoalId(null);
      setEditValues(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingGoalId(null);
    setEditValues(null);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const handleEditValuesChange = (field: 'current' | 'target' | 'deadline', value: string | number) => {
    if (editValues) {
      setEditValues({ ...editValues, [field]: value });
    }
  };

  const handleNewGoalChange = (field: string, value: string | number) => {
    setNewGoal(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const calculateTermProgress = (term: 'short_term' | 'medium_term' | 'long_term') => {
    const termGoals = goals.filter(goal => goal.term === term);
    if (termGoals.length === 0) return 0;
    
    const totalProgress = termGoals.reduce((sum, goal) => 
      sum + calculateProgress(goal.current, goal.target), 0);
    return Math.round(totalProgress / termGoals.length);
  };

  const totalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, goal) => 
        sum + calculateProgress(goal.current, goal.target), 0) / goals.length)
    : 0;

  const shortTermProgress = calculateTermProgress('short_term');
  const mediumTermProgress = calculateTermProgress('medium_term');
  const longTermProgress = calculateTermProgress('long_term');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Financial Goals
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            isDarkMode 
              ? 'bg-teal-500 hover:bg-teal-600 text-white' 
              : 'bg-teal-500 hover:bg-teal-600 text-white'
          } transition-colors`}
        >
          <Plus className="w-5 h-5" />
          <span>Add Goal</span>
        </button>
      </div>

      <GoalProgress
        isDarkMode={isDarkMode}
        totalProgress={totalProgress}
        shortTermProgress={shortTermProgress}
        mediumTermProgress={mediumTermProgress}
        longTermProgress={longTermProgress}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => (
          <GoalCard
            key={goal.id}
            goal={goal.name}
            progress={calculateProgress(goal.current, goal.target)}
            goalData={goal}
            isEditing={editingGoalId === goal.id}
            editValues={editValues}
            isDarkMode={isDarkMode}
            onEditClick={() => handleEditClick(goal.id)}
            onSaveProgress={handleSaveProgress}
            onCancelEdit={handleCancelEdit}
            onDeleteGoal={() => handleDeleteGoal(goal.id)}
            onEditValuesChange={handleEditValuesChange}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        ))}
      </div>

      <AddGoalModal
        isOpen={isAddModalOpen}
        isDarkMode={isDarkMode}
        newGoal={newGoal}
        onClose={() => setIsAddModalOpen(false)}
        onAddGoal={handleAddGoal}
        onNewGoalChange={handleNewGoalChange}
      />
    </div>
  );
} 