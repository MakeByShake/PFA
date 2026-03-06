'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Goal, GoalFormData, GoalFilters, GoalStats } from '@/features/goals/types';

const DEFAULT_FILTERS: GoalFilters = {
  categories: [],
  status: 'all',
  sortDirection: 'asc',
};

interface GoalsStore {
  goals: Goal[];
  filters: GoalFilters;
  title: string;
  setFilters: (filters: GoalFilters) => void;
  setTitle: (title: string) => void;
  addGoal: (data: GoalFormData) => void;
  updateGoal: (id: string, data: GoalFormData) => void;
  deleteGoal: (id: string) => void;
  incrementGoal: (id: string, amount: number) => void;
}

export const useGoalsStore = create<GoalsStore>()(
  persist(
    (set, get) => ({
      goals: [],
      filters: DEFAULT_FILTERS,
      title: 'Мои цели',

      setFilters: (filters) => set({ filters }),
      setTitle: (title) => set({ title }),

      addGoal: (data) => {
        const now = new Date().toISOString();
        const newGoal: Goal = {
          id: `goal-${Date.now()}`,
          ...data,
          currentValue: 0,
          lastResetAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((s) => ({ goals: [...s.goals, newGoal] }));
      },

      updateGoal: (id, data) => {
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, ...data, updatedAt: new Date() } : g
          ),
        }));
      },

      deleteGoal: (id) => {
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
      },

      incrementGoal: (id, amount) => {
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== id) return g;
            const next = Math.min(g.currentValue + amount, g.targetValue);
            return { ...g, currentValue: next, updatedAt: new Date() };
          }),
        }));
      },
    }),
    {
      name: 'pfa-goals',
      partialize: (s) => ({ goals: s.goals, title: s.title }),
    }
  )
);

export function getFilteredGoals(store: GoalsStore): Goal[] {
  const { goals, filters } = store;
  let result = [...goals];
  if (filters.categories.length > 0) {
    result = result.filter((g) => filters.categories.includes(g.category));
  }
  if (filters.status === 'completed') {
    result = result.filter((g) => g.currentValue >= g.targetValue);
  } else if (filters.status === 'incomplete') {
    result = result.filter((g) => g.currentValue < g.targetValue);
  }
  result.sort((a, b) => {
    const dA = new Date(a.createdAt).getTime();
    const dB = new Date(b.createdAt).getTime();
    return filters.sortDirection === 'asc' ? dB - dA : dA - dB;
  });
  return result;
}

export function getGoalStats(goals: Goal[]): GoalStats {
  const total = goals.length;
  const completed = goals.filter((g) => g.currentValue >= g.targetValue).length;
  const totalProgress = goals.reduce(
    (acc, g) => acc + Math.min((g.currentValue / g.targetValue) * 100, 100),
    0
  );
  return {
    totalGoals: total,
    completedGoals: completed,
    overallProgress: total > 0 ? Math.round(totalProgress / total) : 0,
    streak: 5,
  };
}
