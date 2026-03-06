'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { GoalsHeader, GoalsFilter, GoalsList, useGoals } from '@/features/goals';

export default function GoalsPage() {
  const { goals, filters, setFilters, stats, addGoal, updateGoal, incrementGoal, deleteGoal, isLoading } = useGoals();

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-950/30 via-background to-background pointer-events-none" />
      <div className="relative z-10 min-h-screen flex flex-col max-w-2xl mx-auto md:max-w-none md:mx-0">
        <GoalsHeader onAdd={addGoal} stats={stats} />
        <main className="flex-1 px-4 sm:px-6 pb-6 space-y-4 sm:space-y-6">
          <GoalsFilter filters={filters} onChange={setFilters} />
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex min-h-[340px] items-center justify-center">
                <Spinner className="size-8 text-emerald-500" />
              </div>
            ) : (
              <GoalsList goals={goals} onIncrement={incrementGoal} onDelete={deleteGoal} onEdit={updateGoal} />
            )}
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}
