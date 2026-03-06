import { GoalCategory, GoalIconType } from '../types';

export const CATEGORY_LABELS: Record<GoalCategory, string> = {
  daily: 'Ежедневные',
  weekly: 'Еженедельные',
  monthly: 'Ежемесячные',
  custom: 'Свой период',
};

export const CATEGORY_OPTIONS: { value: GoalCategory; label: string }[] = [
  { value: 'daily', label: 'Ежедневные' },
  { value: 'weekly', label: 'Еженедельные' },
  { value: 'monthly', label: 'Ежемесячные' },
];

export const ICON_OPTIONS: { value: GoalIconType; label: string }[] = [
  { value: 'book', label: 'Книга' },
  { value: 'droplet', label: 'Вода' },
  { value: 'piggy-bank', label: 'Копилка' },
  { value: 'code', label: 'Код' },
  { value: 'dumbbell', label: 'Гантель' },
  { value: 'heart', label: 'Сердце' },
  { value: 'brain', label: 'Мозг' },
  { value: 'music', label: 'Музыка' },
];

export const COLOR_OPTIONS = [
  { value: 'emerald', label: 'Изумрудный', class: 'bg-emerald-500' },
  { value: 'cyan', label: 'Бирюзовый', class: 'bg-cyan-500' },
  { value: 'amber', label: 'Янтарный', class: 'bg-amber-500' },
  { value: 'violet', label: 'Фиолетовый', class: 'bg-violet-500' },
  { value: 'rose', label: 'Розовый', class: 'bg-rose-500' },
  { value: 'blue', label: 'Синий', class: 'bg-blue-500' },
];
