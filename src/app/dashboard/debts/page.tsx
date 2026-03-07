'use client';

import { useState } from 'react';
import { Plus, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebtsStore } from '@/stores/debts-store';
import { useAuthStore } from '@/stores/auth-store';
import type { DebtDirection } from '@/lib/types';

function getDaysLeft(dueDate: string): number {
  return Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
}

function getDeadlineStyle(daysLeft: number): { color: string; icon: typeof Clock; label: string } {
  if (daysLeft < 0) return { color: 'text-red-400 border-red-500/40 bg-red-500/10', icon: AlertCircle, label: `Просрочен на ${Math.abs(daysLeft)} дн.` };
  if (daysLeft <= 7) return { color: 'text-red-400 border-red-500/40 bg-red-500/10', icon: AlertCircle, label: `${daysLeft} дн.` };
  if (daysLeft <= 30) return { color: 'text-amber-400 border-amber-500/40 bg-amber-500/10', icon: Clock, label: `${daysLeft} дн.` };
  return { color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10', icon: Clock, label: `${daysLeft} дн.` };
}

export default function DebtsPage() {
  const { debts, addDebt, deleteDebt, settleDebt } = useDebtsStore();
  const currency = useAuthStore((s) => s.currentUser?.currency ?? '₸');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    personName: '', direction: 'i_owe' as DebtDirection,
    amount: '', dueDate: '', notes: '',
  });

  const activeDebts = debts.filter((d) => !d.settled);
  const settledDebts = debts.filter((d) => d.settled);

  const iOweTotal = activeDebts.filter((d) => d.direction === 'i_owe').reduce((s, d) => s + d.amount, 0);
  const owedToMeTotal = activeDebts.filter((d) => d.direction === 'owed_to_me').reduce((s, d) => s + d.amount, 0);

  const handleAdd = () => {
    if (!form.personName || !form.amount || !form.dueDate) return;
    addDebt({ personName: form.personName, direction: form.direction, amount: Number(form.amount), dueDate: form.dueDate, notes: form.notes });
    setForm({ personName: '', direction: 'i_owe', amount: '', dueDate: '', notes: '' });
    setOpen(false);
    toast.success('Долг добавлен');
  };

  const handleSettle = (id: string, personName: string, amount: number) => {
    settleDebt(id);
    toast.success(`Долг с ${personName} (${amount.toLocaleString()} ${currency}) погашен`);
  };

  const DebtCard = ({ debt }: { debt: typeof debts[0] }) => {
    const daysLeft = getDaysLeft(debt.dueDate);
    const style = getDeadlineStyle(daysLeft);
    const DeadlineIcon = style.icon;

    return (
      <Card className={`border ${debt.settled ? 'border-border opacity-60' : style.color}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-semibold text-foreground">{debt.personName}</p>
                <Badge variant={debt.direction === 'i_owe' ? 'destructive' : 'default'} className="text-[11px]">
                  {debt.direction === 'i_owe' ? 'Я должен' : 'Мне должны'}
                </Badge>
              </div>
              <p className={`text-xl font-bold ${debt.direction === 'i_owe' ? 'text-red-400' : 'text-emerald-400'}`}>
                {debt.direction === 'i_owe' ? '-' : '+'}{debt.amount.toLocaleString()} {currency}
              </p>
              {debt.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{debt.notes}</p>}
              {!debt.settled && (
                <div className={`flex items-center gap-1 text-xs font-medium mt-2 ${style.color.split(' ')[0]}`}>
                  <DeadlineIcon className="h-3.5 w-3.5" />
                  <span>до {new Date(debt.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} · {style.label}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              {!debt.settled && (
                <Button
                  size="sm"
                  onClick={() => handleSettle(debt.id, debt.personName, debt.amount)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-8"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" /> Погасить
                </Button>
              )}
              {debt.settled && <Badge className="bg-emerald-500/20 text-emerald-400 border-0">Погашен</Badge>}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => deleteDebt(debt.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-red-950/15 via-background to-background pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto md:max-w-none">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Долги</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{activeDebts.length} активных</p>
          </div>
          <Button onClick={() => setOpen(true)} className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="h-4 w-4" /> Добавить
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Я должен</p>
              <p className="text-xl font-bold text-red-400">{iOweTotal.toLocaleString()} {currency}</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Мне должны</p>
              <p className="text-xl font-bold text-emerald-400">{owedToMeTotal.toLocaleString()} {currency}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Активные ({activeDebts.length})</TabsTrigger>
            <TabsTrigger value="settled">Погашенные ({settledDebts.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-3">
            {activeDebts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Нет активных долгов</p>
              </div>
            ) : activeDebts.map((d) => <DebtCard key={d.id} debt={d} />)}
          </TabsContent>
          <TabsContent value="settled" className="space-y-3">
            {settledDebts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><p>Нет погашенных долгов</p></div>
            ) : settledDebts.map((d) => <DebtCard key={d.id} debt={d} />)}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border text-foreground" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader><DialogTitle>Новый долг</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1"><Label>Имя человека</Label><Input value={form.personName} onChange={(e) => setForm((f) => ({ ...f, personName: e.target.value }))} placeholder="Иван" /></div>
            <div className="space-y-1"><Label>Тип</Label>
              <Select value={form.direction} onValueChange={(v) => setForm((f) => ({ ...f, direction: v as DebtDirection }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="i_owe">Я должен</SelectItem>
                  <SelectItem value="owed_to_me">Мне должны</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Сумма ({currency})</Label><Input inputMode="numeric" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Дедлайн</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Заметки</Label><Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Детали..." rows={2} /></div>
          </div>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Отмена</Button>
            <Button onClick={handleAdd} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white" disabled={!form.personName || !form.amount || !form.dueDate}>Добавить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
