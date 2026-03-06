'use client';

import { create } from 'zustand';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
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
  setGoals: (goals: Goal[]) => void;
  setFilters: (filters: GoalFilters) => void;
  setTitle: (title: string) => void;
  addGoal: (data: GoalFormData) => void;
  updateGoal: (id: string, data: GoalFormData) => void;
  deleteGoal: (id: string) => void;
  incrementGoal: (id: string, amount: number) => void;
}

const uid = () => auth.currentUser?.uid ?? null;

// Goals use Date objects — serialize for Firestore
function toFirestore(goal: Goal): Record<string, unknown> {
  return {
    ...goal,
    lastResetAt: goal.lastResetAt instanceof Date ? goal.lastResetAt.toISOString() : goal.lastResetAt,
    createdAt: goal.createdAt instanceof Date ? goal.createdAt.toISOString() : goal.createdAt,
    updatedAt: goal.updatedAt instanceof Date ? goal.updatedAt.toISOString() : goal.updatedAt,
  };
}

export const useGoalsStore = create<GoalsStore>()((set, get) => ({
  goals: [],
  filters: DEFAULT_FILTERS,
  title: 'Мои цели',

  setGoals: (goals) => set({ goals }),
  setFilters: (filters) => set({ filters }),
  setTitle: (title) => set({ title }),

  addGoal: (data) => {
    const u = uid();
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      ...data,
      currentValue: 0,
      lastResetAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((s) => ({ goals: [...s.goals, newGoal] }));
    if (u) setDoc(doc(db, 'users', u, 'goals', newGoal.id), toFirestore(newGoal));
  },

  updateGoal: (id, data) => {
    const u = uid();
    set((s) => {
      const goals = s.goals.map((g) =>
        g.id === id ? { ...g, ...data, updatedAt: new Date() } : g
      );
      const goal = goals.find((g) => g.id === id);
      if (u && goal) setDoc(doc(db, 'users', u, 'goals', id), toFirestore(goal));
      return { goals };
    });
  },

  deleteGoal: (id) => {
    const u = uid();
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
    if (u) deleteDoc(doc(db, 'users', u, 'goals', id));
  },

  incrementGoal: (id, amount) => {
    const u = uid();
    set((s) => {
      const goals = s.goals.map((g) => {
        if (g.id !== id) return g;
        const next = Math.min(g.currentValue + amount, g.targetValue);
        return { ...g, currentValue: next, updatedAt: new Date() };
      });
      const goal = goals.find((g) => g.id === id);
      if (u && goal) setDoc(doc(db, 'users', u, 'goals', id), toFirestore(goal));
      return { goals };
    });
  },
}));

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
