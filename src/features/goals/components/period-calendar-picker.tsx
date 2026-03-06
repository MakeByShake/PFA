'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface PeriodCalendarPickerProps {
  periodStart: Date;
  periodEnd: Date;
  onPeriodChange: (start: Date, end: Date) => void;
}

const WEEKDAYS_RU = ['П', 'В', 'С', 'Ч', 'П', 'С', 'В'];
const MONTHS_RU = [
  'ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ',
  'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'
];

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();
}

function isInRange(date: Date, start: Date, end: Date): boolean {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(23, 59, 59, 999);
  return d >= s && d <= e;
}

function formatDateRange(start: Date, end: Date): string {
  const formatDate = (d: Date) => {
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  if (isSameDay(start, end)) {
    return formatDate(start);
  }
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function PeriodCalendarPicker({
  periodStart,
  periodEnd,
  onPeriodChange
}: PeriodCalendarPickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempStart, setTempStart] = useState<Date | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay();
    const daysFromPrevMonth = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    const prevMonth = new Date(year, month, 0);
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewDate]);

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDayClick = (date: Date) => {
    if (selectingStart) {
      setTempStart(date);
      setSelectingStart(false);
    } else {
      const start = tempStart!;
      let finalStart = start;
      let finalEnd = date;

      if (date < start) {
        finalStart = date;
        finalEnd = start;
      }

      onPeriodChange(finalStart, finalEnd);
      setTempStart(null);
      setSelectingStart(true);
    }
  };

  const isFirstInRange = (date: Date): boolean => {
    if (tempStart) return isSameDay(date, tempStart);
    return isSameDay(date, periodStart);
  };

  const isLastInRange = (date: Date): boolean => {
    if (tempStart) return false;
    return isSameDay(date, periodEnd);
  };

  const displayLabel = `Период: ${formatDateRange(periodStart, periodEnd)}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-left"
        >
          <Calendar className="h-4 w-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
          <span className="truncate">{displayLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700" align="start">
        <div className="p-4">
          {/* Selection hint */}
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 text-center">
            {selectingStart ? 'Выберите начало периода' : 'Выберите конец периода'}
          </div>

          {/* Calendar header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </button>
            <span className="text-red-500 dark:text-red-400 font-bold tracking-wide">
              {MONTHS_RU[viewDate.getMonth()]}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS_RU.map((day, i) => (
              <div
                key={i}
                className="text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 w-9 h-6 flex items-center justify-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-y-1">
            {calendarDays.map(({ date, isCurrentMonth }, index) => {
              const isToday = isSameDay(date, today);
              const inRange = !tempStart && isInRange(date, periodStart, periodEnd);
              const isFirst = isFirstInRange(date);
              const isLast = isLastInRange(date);
              const isSingle = isFirst && isLast;

              return (
                <div
                  key={index}
                  className={`relative flex items-center justify-center h-9 ${
                    !isCurrentMonth ? 'opacity-30' : 'cursor-pointer'
                  }`}
                  onClick={() => isCurrentMonth && handleDayClick(date)}
                >
                  {/* Range highlight background */}
                  {inRange && isCurrentMonth && (
                    <div
                      className={`absolute inset-0 bg-emerald-100 dark:bg-emerald-900/40 ${
                        isFirst && !isSingle ? 'rounded-l-full' : ''
                      } ${isLast && !isSingle ? 'rounded-r-full' : ''} ${
                        isSingle ? 'rounded-full' : ''
                      }`}
                    />
                  )}

                  {/* Day number */}
                  <span
                    className={`relative z-10 w-8 h-8 flex items-center justify-center text-sm font-medium rounded-full transition-colors ${
                      isToday
                        ? 'bg-red-500 text-white'
                        : isFirst || isLast
                        ? 'bg-emerald-500 text-white'
                        : isCurrentMonth
                        ? 'text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        : 'text-zinc-400 dark:text-zinc-600'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Selected range info */}
          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 text-center">
            Период: {formatDateRange(periodStart, periodEnd)}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
