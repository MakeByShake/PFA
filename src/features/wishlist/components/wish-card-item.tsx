'use client';

import { useState } from 'react';
import { MoreHorizontal, Trash2, Edit2, Plus, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub,
  DropdownMenuSubTrigger, DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { WishCard, WishColumn } from '@/lib/types';
import { WishCardDialog } from './wish-card-dialog';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useAuthStore } from '@/stores/auth-store';

interface Props {
  card: WishCard;
  columns: WishColumn[];
}

const LABEL_COLORS: Record<string, string> = {
  нужное: 'bg-red-500/15 text-red-400 border-red-500/30',
  хотелка: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  необходимое: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

export function WishCardItem({ card, columns }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const { updateCard, deleteCard, moveCard, incrementCard } = useWishlistStore();
  const currency = useAuthStore((s) => s.currentUser?.currency ?? '₸');

  const progress = card.targetAmount > 0 ? Math.min((card.currentAmount / card.targetAmount) * 100, 100) : 0;

  const deadlineColor = () => {
    if (!card.deadline) return '';
    const days = Math.ceil((new Date(card.deadline).getTime() - Date.now()) / 86400000);
    if (days < 0) return 'text-red-400';
    if (days <= 7) return 'text-red-400';
    if (days <= 30) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-3 shadow-sm hover:border-emerald-500/30 transition-all group">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">{card.icon}</span>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{card.title}</p>
              {card.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{card.description}</p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Edit2 className="mr-2 h-4 w-4" /> Редактировать
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <ArrowRight className="mr-2 h-4 w-4" /> Переместить в
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {columns.filter((c) => c.id !== card.columnId).map((col) => (
                    <DropdownMenuItem key={col.id} onClick={() => moveCard(card.id, col.id)}>
                      {col.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => deleteCard(card.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Labels */}
        {card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {card.labels.map((label) => (
              <span
                key={label}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${LABEL_COLORS[label] ?? 'bg-muted text-muted-foreground border-border'}`}
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Amount + progress */}
        {card.targetAmount > 0 && (
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {card.currentAmount.toLocaleString('ru-RU')} / {card.targetAmount.toLocaleString('ru-RU')} {currency}
              </span>
              <span className="font-semibold text-emerald-400">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-muted" />
          </div>
        )}

        {/* Deadline */}
        {card.deadline && (
          <p className={`text-[11px] mt-2 font-medium ${deadlineColor()}`}>
            Дедлайн: {new Date(card.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>

      <WishCardDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(data) => updateCard(card.id, data)}
        columnId={card.columnId}
        initial={card}
        title="Редактировать"
      />
    </>
  );
}
