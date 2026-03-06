'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { WishCard, WishLabel } from '@/lib/types';

const PRESET_LABELS: WishLabel[] = ['нужное', 'хотелка', 'необходимое'];
const PRESET_ICONS = ['🛍️', '👟', '💻', '📱', '🎮', '📚', '✈️', '🚗', '🏠', '⌚', '🎸', '🎧', '💎', '🌿', '🍕'];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<WishCard, 'id' | 'createdAt'>) => void;
  columnId: string;
  initial?: Partial<WishCard>;
  title?: string;
}

export function WishCardDialog({ open, onClose, onSave, columnId, initial, title = 'Новая карточка' }: Props) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    icon: initial?.icon ?? '🛍️',
    labels: (initial?.labels ?? []) as WishLabel[],
    targetAmount: initial?.targetAmount ?? 0,
    currentAmount: initial?.currentAmount ?? 0,
    deadline: initial?.deadline ?? '',
    columnId: initial?.columnId ?? columnId,
  });

  const [newLabel, setNewLabel] = useState('');

  const addLabel = (label: WishLabel) => {
    if (!form.labels.includes(label)) {
      setForm((f) => ({ ...f, labels: [...f.labels, label] }));
    }
  };

  const removeLabel = (label: WishLabel) => {
    setForm((f) => ({ ...f, labels: f.labels.filter((l) => l !== label) }));
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Icon picker */}
          <div className="space-y-2">
            <Label>Иконка</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                  className={`text-xl h-10 w-10 rounded-lg flex items-center justify-center transition-all ${
                    form.icon === ic ? 'bg-emerald-500/20 ring-2 ring-emerald-500' : 'hover:bg-muted'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Название *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Новые кроссовки Nike"
            />
          </div>

          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Подробности о покупке..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Сумма цели (₸)</Label>
              <Input
                type="number"
                min={0}
                value={form.targetAmount}
                onChange={(e) => setForm((f) => ({ ...f, targetAmount: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Накоплено (₸)</Label>
              <Input
                type="number"
                min={0}
                value={form.currentAmount}
                onChange={(e) => setForm((f) => ({ ...f, currentAmount: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Дедлайн (опционально)</Label>
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
            />
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <Label>Метки</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_LABELS.map((label) => (
                <button
                  key={label}
                  onClick={() => form.labels.includes(label) ? removeLabel(label) : addLabel(label)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    form.labels.includes(label)
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-border text-muted-foreground hover:border-emerald-500/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Своя метка..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newLabel.trim()) {
                    addLabel(newLabel.trim());
                    setNewLabel('');
                  }
                }}
                className="text-sm"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => { if (newLabel.trim()) { addLabel(newLabel.trim()); setNewLabel(''); } }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.labels.map((label) => (
                  <Badge key={label} variant="secondary" className="gap-1 text-xs">
                    {label}
                    <button onClick={() => removeLabel(label)} className="ml-0.5 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">Отмена</Button>
          <Button
            onClick={handleSave}
            disabled={!form.title.trim()}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
