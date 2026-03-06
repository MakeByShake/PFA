'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { KanbanColumn } from '@/features/wishlist/components/kanban-column';
import { useWishlistStore } from '@/stores/wishlist-store';

export default function WishlistPage() {
  const { columns, cards, addColumn } = useWishlistStore();
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    addColumn(newColumnName.trim());
    setNewColumnName('');
    setAddColumnOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/20 via-background to-background pointer-events-none" />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Вишлист</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {cards.length} карточек в {columns.length} столбцах
            </p>
          </div>
          <Button
            onClick={() => setAddColumnOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
          >
            <Plus className="h-4 w-4" /> Столбец
          </Button>
        </div>

        {/* Board */}
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4 min-h-[60vh]" style={{ minWidth: `${sortedColumns.length * 300}px` }}>
            {sortedColumns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                cards={cards.filter((c) => c.columnId === col.id)}
                allColumns={sortedColumns}
              />
            ))}
            {sortedColumns.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                <div className="text-6xl mb-4">🛍️</div>
                <h2 className="text-lg font-semibold text-foreground mb-2">Доска пустая</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Создайте первый столбец, чтобы начать добавлять желания
                </p>
                <Button onClick={() => setAddColumnOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  Создать столбец
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Add column dialog */}
      <Dialog open={addColumnOpen} onOpenChange={setAddColumnOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Новый столбец</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Название столбца</Label>
              <Input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Например: В процессе"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={() => setAddColumnOpen(false)} className="flex-1">Отмена</Button>
            <Button
              onClick={handleAddColumn}
              disabled={!newColumnName.trim()}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Создать
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
