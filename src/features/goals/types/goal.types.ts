export type GoalCategory = 'daily' | 'weekly' | 'monthly' | 'custom';

export type GoalIconType =
  | 'book' | 'droplet' | 'piggy-bank' | 'code' | 'dumbbell' | 'heart' | 'brain' | 'music'
  | 'dollar' | 'monitor' | 'graduation' | 'pencil' | 'home' | 'video' | 'gift' | 'palette'
  | 'stethoscope' | 'flower' | 'lotus' | 'briefcase' | 'chart' | 'star' | 'settings'
  | 'globe' | 'sun' | 'moon' | 'coffee' | 'camera' | 'plane' | 'car' | 'bike' | 'pet'
  | 'game' | 'trophy' | 'target' | 'flag' | 'clock' | 'calendar' | 'mail' | 'phone';

export type SortDirection = 'asc' | 'desc';
export type StatusFilter = 'all' | 'completed' | 'incomplete';

export interface GoalFilters {
  categories: GoalCategory[];
  status: StatusFilter;
  sortDirection: SortDirection;
}

export interface Goal {
  id: string;
  title: string;
  subtitle: string;
  icon: GoalIconType;
  currentValue: number;
  targetValue: number;
  unit: string;
  category: GoalCategory;
  color: string;
  incrementAmount: number;
  periodStart: Date;
  periodEnd: Date;
  lastResetAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalFormData {
  title: string;
  subtitle: string;
  icon: GoalIconType;
  targetValue: number;
  unit: string;
  category: GoalCategory;
  color: string;
  incrementAmount: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface GoalStats {
  totalGoals: number;
  completedGoals: number;
  overallProgress: number;
  streak: number;
}
