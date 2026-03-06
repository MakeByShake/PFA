'use client';

import { Goal, GoalFormData } from '../types';
import { GoalCard } from './goal-card';
import { Target } from 'lucide-react';

interface GoalsListProps {
  goals: Goal[];
  onIncrement: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: GoalFormData) => void;
}

export function GoalsList({ goals, onIncrement, onDelete, onEdit }: GoalsListProps) {
  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-zinc-800/50 mb-4">
          <Target className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="text-lg font-medium text-zinc-300 mb-1">
          Нет целей
        </h3>
        <p className="text-sm text-zinc-500 max-w-[250px]">
          Добавьте свою первую цель и начните путь к успеху
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onIncrement={onIncrement}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
