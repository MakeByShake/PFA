'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { MoreHorizontal, Trash2, Edit2, Plus, Clock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Goal, GoalFormData } from '../types';
import { COLOR_OPTIONS } from '../constants';
import { GoalIcon } from './goal-icon';
import { PeriodCalendarPicker } from './period-calendar-picker';
import { IconPicker } from './icon-picker';

interface GoalCardProps {
  goal: Goal;
  onIncrement: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: GoalFormData) => void;
}

export function GoalCard({ goal, onIncrement, onDelete, onEdit }: GoalCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [showIncrementInput, setShowIncrementInput] = useState(false);
  const [incrementValue, setIncrementValue] = useState('');
  const incrementInputRef = useRef<HTMLInputElement>(null);
  const [editTargetStr, setEditTargetStr] = useState(String(goal.targetValue));
  const [editIncrementStr, setEditIncrementStr] = useState(String(goal.incrementAmount));
  const [editForm, setEditForm] = useState<GoalFormData>({
    title: goal.title,
    subtitle: goal.subtitle,
    icon: goal.icon,
    targetValue: goal.targetValue,
    unit: goal.unit,
    category: goal.category,
    color: goal.color,
    incrementAmount: goal.incrementAmount,
    periodStart: goal.periodStart,
    periodEnd: goal.periodEnd,
  });

  const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  const isCompleted = goal.currentValue >= goal.targetValue;

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.title.trim() || !editForm.unit.trim()) return;
    onEdit(goal.id, editForm);
    setEditOpen(false);
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

  const updateEditForm = <K extends keyof GoalFormData>(
    key: K,
    value: GoalFormData[K]
  ) => {
    setEditForm((prev) => {
      const updated = { ...prev, [key]: value };
      // Auto-calculate increment when target changes
      if (key === 'targetValue') {
        updated.incrementAmount = calculateIncrement(value as number, prev.periodStart, prev.periodEnd);
      }
      return updated;
    });
  };

  // Handle period change and auto-calculate increment
  const handleEditPeriodChange = (start: Date, end: Date) => {
    setEditForm((prev) => {
      const newIncrement = calculateIncrement(prev.targetValue, start, end);
      setEditIncrementStr(String(newIncrement));
      return { ...prev, periodStart: start, periodEnd: end, incrementAmount: newIncrement };
    });
  };

  const openEditDialog = () => {
    setEditForm({
      title: goal.title,
      subtitle: goal.subtitle,
      icon: goal.icon,
      targetValue: goal.targetValue,
      unit: goal.unit,
      category: goal.category,
      color: goal.color,
      incrementAmount: goal.incrementAmount,
      periodStart: goal.periodStart,
      periodEnd: goal.periodEnd,
    });
    setEditTargetStr(String(goal.targetValue));
    setEditIncrementStr(String(goal.incrementAmount));
    setEditOpen(true);
  };

  // Calculate daily minimum based on remaining target and remaining days
  const dailyInfo = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const start = new Date(goal.periodStart);
    start.setHours(0, 0, 0, 0);

    const end = new Date(goal.periodEnd);
    end.setHours(0, 0, 0, 0);

    // Calculate total days in period
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    // Calculate remaining value
    const remainingValue = Math.max(0, goal.targetValue - goal.currentValue);

    // Calculate remaining days (including today)
    let remainingDays: number;
    if (now < start) {
      remainingDays = totalDays; // Period hasn't started yet
    } else if (now > end) {
      remainingDays = 0; // Period has ended
    } else {
      remainingDays = Math.max(1, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    }

    // Calculate daily minimum (round up to ensure we hit the target)
    const dailyMinimum = remainingDays > 0 ? Math.ceil(remainingValue / remainingDays) : remainingValue;

    return {
      dailyMinimum,
      remainingDays,
      totalDays,
    };
  }, [goal.periodStart, goal.periodEnd, goal.targetValue, goal.currentValue]);

  // Format period for display next to title
  const formatPeriodShort = (start: Date, end: Date): string => {
    const formatDay = (d: Date) => d.getDate();
    const formatMonth = (d: Date) => d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '');

    const sameMonth = start.getMonth() === end.getMonth();
    const sameDay = start.getDate() === end.getDate() && sameMonth && start.getFullYear() === end.getFullYear();

    if (sameDay) {
      return `${formatDay(start)} ${formatMonth(start)}`;
    }
    if (sameMonth) {
      return `${formatDay(start)}-${formatDay(end)} ${formatMonth(end)}`;
    }
    return `${formatDay(start)} ${formatMonth(start)} - ${formatDay(end)} ${formatMonth(end)}`;
  };

  // Calculate remaining days if current date is within period
  const deadlineInfo = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const start = new Date(goal.periodStart);
    start.setHours(0, 0, 0, 0);

    const end = new Date(goal.periodEnd);
    end.setHours(23, 59, 59, 999);

    // Check if current date is within the period
    if (now < start || now > end) {
      return null; // Period is in the future or past
    }

    // Calculate days remaining
    const endDate = new Date(goal.periodEnd);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate percentage of time remaining
    const totalTime = endDate.getTime() - start.getTime();
    const remainingPercent = totalTime > 0 ? (diffTime / totalTime) * 100 : 0;

    // Determine color based on remaining time percentage
    let colorClass: string;
    if (remainingPercent > 70) {
      colorClass = 'text-emerald-600 dark:text-emerald-400'; // Green - plenty of time
    } else if (remainingPercent >= 30) {
      colorClass = 'text-amber-600 dark:text-amber-400'; // Yellow - medium
    } else {
      colorClass = 'text-red-600 dark:text-red-400'; // Red - urgent
    }

    let text: string;
    if (diffDays === 0) text = 'Сегодня';
    else if (diffDays === 1) text = '1 день';
    else if (diffDays >= 2 && diffDays <= 4) text = `${diffDays} дня`;
    else text = `${diffDays} дн.`;

    return { text, colorClass };
  }, [goal.periodStart, goal.periodEnd]);

  // Focus input when shown
  useEffect(() => {
    if (showIncrementInput && incrementInputRef.current) {
      incrementInputRef.current.focus();
      incrementInputRef.current.select();
    }
  }, [showIncrementInput]);

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCompleted) {
      const defaultValue = dailyInfo.dailyMinimum > 0 ? dailyInfo.dailyMinimum : goal.incrementAmount;
      setIncrementValue(defaultValue.toString());
      setShowIncrementInput(true);
    }
  };

  const handleIncrementSubmit = () => {
    const value = parseInt(incrementValue, 10);
    if (value > 0) {
      onIncrement(goal.id, value);
    }
    setShowIncrementInput(false);
    setIncrementValue('');
  };

  const handleIncrementCancel = () => {
    setShowIncrementInput(false);
    setIncrementValue('');
  };

  const handleIncrementKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleIncrementSubmit();
    } else if (e.key === 'Escape') {
      handleIncrementCancel();
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-700">
        <div className="flex items-start gap-3">
          {/* Icon and deadline column */}
          <div className="flex flex-col items-center gap-1">
            <GoalIcon icon={goal.icon} color={goal.color} />
            {deadlineInfo && (
              <div className={`flex items-center gap-1 text-xs font-medium ${deadlineInfo.colorClass}`}>
                <Clock className="h-3 w-3" />
                <span>{deadlineInfo.text}</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-white text-base">
                    {goal.title}
                  </h3>
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {formatPeriodShort(goal.periodStart, goal.periodEnd)}
                  </span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 -mr-2"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                >
                  <DropdownMenuItem
                    className="text-zinc-700 dark:text-zinc-200 focus:text-zinc-900 dark:focus:text-white focus:bg-zinc-100 dark:focus:bg-zinc-700"
                    onClick={openEditDialog}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Редактировать
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                    onClick={() => onDelete(goal.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {goal.currentValue}
                  </span>
                  <span className="text-sm text-zinc-400">
                    / {goal.targetValue} {goal.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {dailyInfo.dailyMinimum > 0 && !isCompleted && (
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      мин {dailyInfo.dailyMinimum}/день
                    </span>
                  )}
                  <span className="text-sm font-semibold text-emerald-500">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 relative h-1.5 rounded-full bg-red-400 dark:bg-red-900 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out bg-emerald-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {showIncrementInput ? (
                  <div className="flex items-center gap-1">
                    <input
                      ref={incrementInputRef}
                      type="number"
                      value={incrementValue}
                      onChange={(e) => setIncrementValue(e.target.value)}
                      onKeyDown={handleIncrementKeyDown}
                      className="w-16 h-8 px-2 text-sm text-center rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      min={1}
                    />
                    <button
                      onClick={handleIncrementSubmit}
                      className="h-8 w-8 rounded-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleIncrementCancel}
                      className="h-8 w-8 rounded-full flex items-center justify-center bg-zinc-300 dark:bg-zinc-600 hover:bg-zinc-400 dark:hover:bg-zinc-500 text-zinc-700 dark:text-zinc-200 transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handlePlusClick}
                    disabled={isCompleted}
                    className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg active:scale-95'
                    }`}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-xl">Редактировать цель</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-zinc-700 dark:text-zinc-300">
                Название
              </Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => updateEditForm('title', e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-subtitle" className="text-zinc-700 dark:text-zinc-300">
                Описание
              </Label>
              <Input
                id="edit-subtitle"
                value={editForm.subtitle}
                onChange={(e) => updateEditForm('subtitle', e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-target" className="text-zinc-700 dark:text-zinc-300">
                  Цель
                </Label>
                <Input
                  id="edit-target"
                  inputMode="numeric"
                  value={editTargetStr}
                  onChange={(e) => {
                    setEditTargetStr(e.target.value);
                    const n = Number(e.target.value);
                    if (e.target.value !== '' && !isNaN(n) && n > 0) {
                      const newIncrement = calculateIncrement(n, editForm.periodStart, editForm.periodEnd);
                      setEditIncrementStr(String(newIncrement));
                      setEditForm((prev) => ({ ...prev, targetValue: n, incrementAmount: newIncrement }));
                    }
                  }}
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-unit" className="text-zinc-700 dark:text-zinc-300">
                  Единица
                </Label>
                <Input
                  id="edit-unit"
                  value={editForm.unit}
                  onChange={(e) => updateEditForm('unit', e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-increment" className="text-zinc-700 dark:text-zinc-300">
                Шаг прогресса (за одно нажатие +)
              </Label>
              <Input
                id="edit-increment"
                inputMode="numeric"
                value={editIncrementStr}
                onChange={(e) => {
                  setEditIncrementStr(e.target.value);
                  const n = Number(e.target.value);
                  if (e.target.value !== '' && !isNaN(n) && n > 0) {
                    updateEditForm('incrementAmount', n);
                  }
                }}
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-700 dark:text-zinc-300">Период</Label>
              <PeriodCalendarPicker
                periodStart={editForm.periodStart}
                periodEnd={editForm.periodEnd}
                onPeriodChange={handleEditPeriodChange}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-700 dark:text-zinc-300">Иконка</Label>
              <IconPicker
                value={editForm.icon}
                onChange={(v) => updateEditForm('icon', v)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-700 dark:text-zinc-300">Цвет</Label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateEditForm('color', option.value)}
                    className={`h-8 w-8 rounded-full transition-all ${option.class} ${
                      editForm.color === option.value
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
                onClick={() => setEditOpen(false)}
                className="flex-1 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={!editForm.title.trim() || !editForm.unit.trim()}
              >
                Сохранить
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
