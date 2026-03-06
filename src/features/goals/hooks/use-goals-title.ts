'use client';

import { useGoalsStore } from '@/stores/goals-store';
import { DEFAULT_GOALS_TITLE } from '../constants';

export function useGoalsTitle() {
  const title = useGoalsStore((s) => s.title);
  const setTitle = useGoalsStore((s) => s.setTitle);

  const updateTitle = (next: string) => {
    setTitle(next.trim() || DEFAULT_GOALS_TITLE);
  };

  return { title, updateTitle, loading: false };
}
