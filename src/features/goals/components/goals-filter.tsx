'use client';

import { useState } from 'react';
import { Filter, ArrowUp, ArrowDown, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { GoalCategory, GoalFilters, SortDirection, StatusFilter } from '../types';

interface GoalsFilterProps {
  filters: GoalFilters;
  onChange: (filters: GoalFilters) => void;
}

const CATEGORY_OPTIONS: { value: GoalCategory; label: string }[] = [
  { value: 'daily', label: 'День' },
  { value: 'weekly', label: 'Неделя' },
  { value: 'monthly', label: 'Месяц' },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'completed', label: 'Выполнено' },
  { value: 'incomplete', label: 'В процессе' },
];

export function GoalsFilter({ filters, onChange }: GoalsFilterProps) {
  const [open, setOpen] = useState(false);

  const toggleCategory = (category: GoalCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];

    onChange({ ...filters, categories: newCategories });
  };

  const setStatus = (status: StatusFilter) => {
    onChange({ ...filters, status });
  };

  const toggleSort = () => {
    const newDirection: SortDirection = filters.sortDirection === 'asc' ? 'desc' : 'asc';
    onChange({ ...filters, sortDirection: newDirection });
  };

  const clearFilters = () => {
    onChange({
      categories: [],
      status: 'all',
      sortDirection: 'asc',
    });
  };

  const hasActiveFilters = filters.categories.length > 0 || filters.status !== 'all';

  const getFilterSummary = () => {
    const parts: string[] = [];
    if (filters.categories.length > 0) {
      const categoryLabels = filters.categories.map(
        (c) => CATEGORY_OPTIONS.find((o) => o.value === c)?.label
      );
      parts.push(categoryLabels.join(', '));
    }
    if (filters.status !== 'all') {
      parts.push(STATUS_OPTIONS.find((o) => o.value === filters.status)?.label || '');
    }
    return parts.length > 0 ? parts.join(' • ') : 'Все цели';
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
              hasActiveFilters
                ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">{getFilterSummary()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 p-4 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
          align="start"
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Фильтры</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Сбросить
                </button>
              )}
            </div>

            {/* Period */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                Период
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleCategory(option.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                      filters.categories.includes(option.value)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {filters.categories.includes(option.value) && (
                      <Check className="h-3 w-3" />
                    )}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                Статус
              </p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatus(option.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filters.status === option.value
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                Сортировка
              </p>
              <button
                onClick={toggleSort}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-all"
              >
                {filters.sortDirection === 'asc' ? (
                  <>
                    <ArrowUp className="h-4 w-4" />
                    Сначала новые
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4" />
                    Сначала старые
                  </>
                )}
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
