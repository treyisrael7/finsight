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
  isDarkMode?: boolean;
}

const inputClass =
  'mt-1 block w-full rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)] px-3.5 py-2 text-[var(--finsight-primary-text)] placeholder-[var(--finsight-muted-text)] focus:border-[var(--finsight-accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--finsight-accent-blue)]/20';

export default function AddGoalModal({
  isOpen,
  onClose,
  onAdd,
  newGoal,
  onNewGoalChange,
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl border border-[var(--finsight-border)] bg-[var(--finsight-card)] p-6 text-left align-middle shadow-xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold leading-6 text-[var(--finsight-primary-text)]"
                >
                  Add new goal
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--finsight-secondary-text)]">
                      Goal title
                    </label>
                    <input
                      type="text"
                      value={newGoal.title || ''}
                      onChange={(e) => onNewGoalChange('title', e.target.value)}
                      className={inputClass}
                      placeholder="Enter goal title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--finsight-secondary-text)]">
                      Initial amount
                    </label>
                    <input
                      type="number"
                      value={newGoal.current_amount ?? ''}
                      onChange={(e) => onNewGoalChange('current_amount', e.target.value)}
                      className={inputClass}
                      min={0}
                      step={0.01}
                      placeholder="Enter initial amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--finsight-secondary-text)]">
                      Target amount
                    </label>
                    <input
                      type="number"
                      value={newGoal.target_amount ?? ''}
                      onChange={(e) => onNewGoalChange('target_amount', e.target.value)}
                      className={inputClass}
                      min={0}
                      step={0.01}
                      placeholder="Enter target amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--finsight-secondary-text)]">
                      Target date
                    </label>
                    <input
                      type="date"
                      value={newGoal.deadline || ''}
                      onChange={(e) => onNewGoalChange('deadline', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)] px-4 py-2 text-sm font-medium text-[var(--finsight-primary-text)] transition-colors hover:bg-[var(--finsight-card)]"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-[var(--finsight-accent-blue)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                    onClick={onAdd}
                  >
                    Add goal
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
