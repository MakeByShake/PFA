'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoalFormData, GoalStats } from '../types';
import { COLOR_OPTIONS } from '../constants';
import { PeriodCalendarPicker } from './period-calendar-picker';
import { IconPicker } from './icon-picker';
import { useGoalsTitle } from '../hooks';
import { DEFAULT_GOALS_TITLE } from '../constants';

interface GoalsHeaderProps {
  onAdd: (data: GoalFormData) => void;
  stats: GoalStats;
}

function getDefaultPeriod(): { start: Date; end: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return { start: today, end: today };
}

const createInitialForm = (): GoalFormData => {
  const { start, end } = getDefaultPeriod();
  return {
    title: '',
    subtitle: '',
    icon: 'book',
    targetValue: 100,
    unit: '',
    category: 'daily',
    color: 'emerald',
    incrementAmount: 1,
    periodStart: start,
    periodEnd: end,
  };
};

export function GoalsHeader({ onAdd, stats }: GoalsHeaderProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<GoalFormData>(createInitialForm);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { title, updateTitle } = useGoalsTitle();
  const [draftTitle, setDraftTitle] = useState(title);

  useEffect(() => {
    setDraftTitle(title);
  }, [title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleSave = () => {
    const newTitle = draftTitle.trim() || DEFAULT_GOALS_TITLE;
    updateTitle(newTitle);
    setIsEditingTitle(false);
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.unit.trim()) return;
    onAdd(form);
    setForm(createInitialForm());
    setOpen(false);
  };

  // Calculate days between two dates
  const calculateDays = (start: Date, end: Date): number => {
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    const e = new Date(end);
    e.setHours(0, 0, 0, 0);
    return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  };

  // Calculate increment based on target and days
  const calculateIncrement = (target: number, start: Date, end: Date): number => {
    const days = calculateDays(start, end);
    return Math.ceil(target / days);
  };

  const updateForm = <K extends keyof GoalFormData>(
    key: K,
    value: GoalFormData[K]
  ) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      // Auto-calculate increment when target changes
      if (key === 'targetValue') {
        updated.incrementAmount = calculateIncrement(value as number, prev.periodStart, prev.periodEnd);
      }
      return updated;
    });
  };

  // Handle period change and auto-calculate increment
  const handlePeriodChange = (start: Date, end: Date) => {
    setForm((prev) => ({
      ...prev,
      periodStart: start,
      periodEnd: end,
      incrementAmount: calculateIncrement(prev.targetValue, start, end),
    }));
  };

  return (
    <header className="px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between mb-1">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSave();
              if (e.key === 'Escape') {
                setDraftTitle(title || DEFAULT_GOALS_TITLE);
                setIsEditingTitle(false);
              }
            }}
            className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white bg-transparent border-b-2 border-emerald-500 outline-none"
          />
        ) : (
          <h1
            onClick={() => {
              setDraftTitle(title || DEFAULT_GOALS_TITLE);
              setIsEditingTitle(true);
            }}
            className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            {title}
          </h1>
        )}
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                className="h-9 w-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>

          <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white">
            <DialogHeader>
              <DialogTitle className="text-xl">Новая цель</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-zinc-700 dark:text-zinc-300">
                  Название
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  placeholder="Читать книги"
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle" className="text-zinc-700 dark:text-zinc-300">
                  Описание
                </Label>
                <Input
                  id="subtitle"
                  value={form.subtitle}
                  onChange={(e) => updateForm('subtitle', e.target.value)}
                  placeholder="Минимум 20 страниц в день"
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target" className="text-zinc-700 dark:text-zinc-300">
                    Цель
                  </Label>
                  <Input
                    id="target"
                    type="number"
                    min={1}
                    value={form.targetValue}
                    onChange={(e) => updateForm('targetValue', Number(e.target.value))}
                    className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-zinc-700 dark:text-zinc-300">
                    Единица
                  </Label>
                  <Input
                    id="unit"
                    value={form.unit}
                    onChange={(e) => updateForm('unit', e.target.value)}
                    placeholder="стр."
                    className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="increment" className="text-zinc-700 dark:text-zinc-300">
                  Шаг прогресса (за одно нажатие +)
                </Label>
                <Input
                  id="increment"
                  type="number"
                  min={1}
                  value={form.incrementAmount}
                  onChange={(e) => updateForm('incrementAmount', Number(e.target.value))}
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-700 dark:text-zinc-300">Период</Label>
                <PeriodCalendarPicker
                  periodStart={form.periodStart}
                  periodEnd={form.periodEnd}
                  onPeriodChange={handlePeriodChange}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-700 dark:text-zinc-300">Иконка</Label>
                <IconPicker
                  value={form.icon}
                  onChange={(v) => updateForm('icon', v)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-700 dark:text-zinc-300">Цвет</Label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateForm('color', option.value)}
                      className={`h-8 w-8 rounded-full transition-all ${option.class} ${
                        form.color === option.value
                          ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 ring-zinc-400 scale-110'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  disabled={!form.title.trim() || !form.unit.trim()}
                >
                  Создать
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 capitalize">
          {formattedDate}
        </p>
        <p className="text-sm font-medium text-emerald-500">
          {stats.overallProgress}% выполнено
        </p>
      </div>
    </header>
  );
}
