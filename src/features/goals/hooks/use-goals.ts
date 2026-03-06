'use client';

import { useMemo } from 'react';
import { useGoalsStore, getFilteredGoals, getGoalStats } from '@/stores/goals-store';
import { GoalFormData } from '../types';

export function useGoals() {
  const store = useGoalsStore();

  const filteredGoals = useMemo(() => getFilteredGoals(store), [store.goals, store.filters]);
  const stats = useMemo(() => getGoalStats(store.goals), [store.goals]);

  return {
    goals: filteredGoals,
    allGoals: store.goals,
    filters: store.filters,
    setFilters: store.setFilters,
    stats,
    title: store.title,
    setTitle: store.setTitle,
    addGoal: (data: GoalFormData) => store.addGoal(data),
    updateGoal: (id: string, data: GoalFormData) => store.updateGoal(id, data),
    deleteGoal: (id: string) => store.deleteGoal(id),
    incrementGoal: (id: string, amount: number) => store.incrementGoal(id, amount),
    isLoading: false,
    error: null,
  };
}
