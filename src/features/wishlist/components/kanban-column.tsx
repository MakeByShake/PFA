'use client';

import { useState } from 'react';
import { Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WishCard, WishColumn } from '@/lib/types';
import { WishCardItem } from './wish-card-item';
import { WishCardDialog } from './wish-card-dialog';
import { useWishlistStore } from '@/stores/wishlist-store';

interface Props {
  column: WishColumn;
  cards: WishCard[];
  allColumns: WishColumn[];
}

export function KanbanColumn({ column, cards, allColumns }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(column.title);
  const { renameColumn, deleteColumn, addCard } = useWishlistStore();

  const handleRename = () => {
    if (nameInput.trim()) renameColumn(column.id, nameInput.trim());
    setRenaming(false);
  };

  return (
    <div className="flex flex-col w-72 min-w-[288px] bg-muted/40 rounded-2xl border border-border overflow-hidden">
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        {renaming ? (
          <Input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false); }}
            autoFocus
            className="h-7 text-sm font-semibold bg-transparent border-emerald-500 px-1 py-0"
          />
        ) : (
          <h3 className="font-semibold text-sm text-foreground truncate flex-1">{column.title}</h3>
        )}
        <div className="flex items-center gap-1 ml-2">
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{cards.length}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setNameInput(column.title); setRenaming(true); }}>
                <Pencil className="mr-2 h-4 w-4" /> Переименовать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => deleteColumn(column.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Удалить столбец
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 max-h-[60vh]">
        <div className="p-3 space-y-2">
          {cards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Пусто</div>
          ) : (
            cards.map((card) => (
              <WishCardItem key={card.id} card={card} columns={allColumns} />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add card */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAddOpen(true)}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
        >
          <Plus className="h-4 w-4" /> Добавить карточку
        </Button>
      </div>

      <WishCardDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={(data) => addCard(data)}
        columnId={column.id}
      />
    </div>
  );
}
