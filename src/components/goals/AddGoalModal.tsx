'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface NewGoal {
  title: string;
  target_amount: string;
  current_amount: string;
  deadline: string;
  category: 'short_term' | 'medium_term' | 'long_term';
}

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
  newGoal: NewGoal;
  onNewGoalChange: (field: keyof NewGoal, value: string | number) => void;
  isDarkMode: boolean;
}

export default function AddGoalModal({
  isOpen,
  onClose,
  onAdd,
  newGoal,
  onNewGoalChange,
  isDarkMode,
}: AddGoalModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <Dialog.Title
                  as="h3"
                  className={`text-lg font-medium leading-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  Add New Goal
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Goal Title
                    </label>
                    <input
                      type="text"
                      value={newGoal.title || ''}
                      onChange={(e) => onNewGoalChange('title', e.target.value)}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter goal title"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Initial Amount
                    </label>
                    <input
                      type="number"
                      value={newGoal.current_amount ?? ''}
                      onChange={(e) => onNewGoalChange('current_amount', e.target.value)}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300'
                      }`}
                      min="0"
                      step="0.01"
                      placeholder="Enter initial amount"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Target Amount
                    </label>
                    <input
                      type="number"
                      value={newGoal.target_amount ?? ''}
                      onChange={(e) => onNewGoalChange('target_amount', e.target.value)}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300'
                      }`}
                      min="0"
                      step="0.01"
                      placeholder="Enter target amount"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={newGoal.deadline || ''}
                      onChange={(e) => onNewGoalChange('deadline', e.target.value)}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-md border px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                      isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'border-transparent bg-blue-100 text-blue-900 hover:bg-blue-200'
                    }`}
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    onClick={onAdd}
                  >
                    Add Goal
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 