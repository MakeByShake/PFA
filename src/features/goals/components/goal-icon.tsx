'use client';

import {
  Book,
  Droplet,
  PiggyBank,
  Code,
  Dumbbell,
  Heart,
  Brain,
  Music,
  DollarSign,
  Monitor,
  GraduationCap,
  Pencil,
  Home,
  Video,
  Gift,
  Palette,
  Stethoscope,
  Flower2,
  Briefcase,
  BarChart3,
  Star,
  Settings,
  Globe,
  Sun,
  Moon,
  Coffee,
  Camera,
  Plane,
  Car,
  Bike,
  PawPrint,
  Gamepad2,
  Trophy,
  Target,
  Flag,
  Clock,
  Calendar,
  Mail,
  Phone,
  type LucideIcon,
} from 'lucide-react';
import { GoalIconType } from '../types';
import { cn } from '@/lib/utils';

export const ICON_MAP: Record<GoalIconType, LucideIcon> = {
  book: Book,
  droplet: Droplet,
  'piggy-bank': PiggyBank,
  code: Code,
  dumbbell: Dumbbell,
  heart: Heart,
  brain: Brain,
  music: Music,
  dollar: DollarSign,
  monitor: Monitor,
  graduation: GraduationCap,
  pencil: Pencil,
  home: Home,
  video: Video,
  gift: Gift,
  palette: Palette,
  stethoscope: Stethoscope,
  flower: Flower2,
  lotus: Flower2,
  briefcase: Briefcase,
  chart: BarChart3,
  star: Star,
  settings: Settings,
  globe: Globe,
  sun: Sun,
  moon: Moon,
  coffee: Coffee,
  camera: Camera,
  plane: Plane,
  car: Car,
  bike: Bike,
  pet: PawPrint,
  game: Gamepad2,
  trophy: Trophy,
  target: Target,
  flag: Flag,
  clock: Clock,
  calendar: Calendar,
  mail: Mail,
  phone: Phone,
};

const COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-500 text-white',
  cyan: 'bg-cyan-500 text-white',
  amber: 'bg-amber-500 text-white',
  violet: 'bg-violet-500 text-white',
  rose: 'bg-rose-500 text-white',
  blue: 'bg-blue-500 text-white',
};

interface GoalIconProps {
  icon: GoalIconType;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GoalIcon({ icon, color, size = 'md', className }: GoalIconProps) {
  const IconComponent = ICON_MAP[icon];
  const colorClass = COLOR_MAP[color] || COLOR_MAP.emerald;

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10 sm:h-12 sm:w-12',
    lg: 'h-14 w-14 sm:h-16 sm:w-16',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5 sm:h-6 sm:w-6',
    lg: 'h-7 w-7 sm:h-8 sm:w-8',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl',
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      <IconComponent className={iconSizes[size]} />
    </div>
  );
}
