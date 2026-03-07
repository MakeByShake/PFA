'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { GoalIconType } from '../types';
import { ICON_MAP } from './goal-icon';

interface IconPickerProps {
  value: GoalIconType;
  onChange: (value: GoalIconType) => void;
}

const ALL_ICONS: GoalIconType[] = [
  'book', 'dollar', 'monitor', 'graduation', 'pencil', 'code',
  'home', 'video', 'music', 'gift', 'palette', 'stethoscope',
  'flower', 'briefcase', 'chart', 'star', 'heart', 'globe',
  'sun', 'moon', 'coffee', 'camera', 'plane', 'car',
  'bike', 'pet', 'game', 'trophy', 'target', 'flag',
  'dumbbell', 'brain', 'droplet', 'piggy-bank', 'clock', 'calendar',
  'settings', 'lotus', 'mail', 'phone',
];

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);

  const SelectedIcon = ICON_MAP[value];

  const handleSelect = (icon: GoalIconType) => {
    onChange(icon);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
        >
          <SelectedIcon className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-3 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
        align="start"
      >
        <div className="grid grid-cols-6 gap-2">
          {ALL_ICONS.map((iconKey) => {
            const IconComponent = ICON_MAP[iconKey];
            const isSelected = value === iconKey;

            return (
              <button
                key={iconKey}
                onClick={() => handleSelect(iconKey)}
                className={`h-10 w-10 flex items-center justify-center rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-emerald-500 text-white'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <IconComponent className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
