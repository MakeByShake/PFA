'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Trash2, TrendingUp, TrendingDown, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useHistoryStore } from '@/stores/history-store';
import { useAuthStore } from '@/stores/auth-store';
import { useWalletStore } from '@/stores/wallet-store';
import type { TransactionType } from '@/lib/types';

type PeriodFilter = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'all';

const PAGE_SIZE = 15;

function getPeriodRange(period: PeriodFilter): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (period === 'yesterday') { start.setDate(start.getDate() - 1); end.setDate(end.getDate() - 1); }
  else if (period === 'week') { start.setDate(start.getDate() - 7); }
  else if (period === 'month') { start.setDate(1); }
  else if (period === 'year') { start.setMonth(0, 1); }
  else if (period === 'all') { start.setFullYear(2000); }

  return { start, end };
}

export default function HistoryPage() {
  const { transactions, addTransaction, deleteTransaction } = useHistoryStore();
  const currency = useAuthStore((s) => s.currentUser?.currency ?? '₸');
  const addMoneyW = useWalletStore((s) => s.addMoney);
  const subtractMoneyW = useWalletStore((s) => s.subtractMoney);

  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: 'expense' as TransactionType, amount: '', category: 'другое', note: '', date: new Date().toISOString().split('T')[0] });

  const { start, end } = getPeriodRange(period);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (d < start || d > end) return false;
      if (search && !t.note.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, start, end, search]);

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = totalIncome - totalExpense;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAdd = () => {
    if (!form.amount || !form.date) return;
    addTransaction({ type: form.type, amount: Number(form.amount), category: form.category, note: form.note, date: new Date(form.date).toISOString() });
    if (form.type === 'income') addMoneyW(Number(form.amount));
    else subtractMoneyW(Number(form.amount));
    setForm({ type: 'expense', amount: '', category: 'другое', note: '', date: new Date().toISOString().split('T')[0] });
    setOpen(false);
    toast.success('Транзакция добавлена');
  };

  const PERIOD_LABELS: Record<PeriodFilter, string> = { today: 'Сегодня', yesterday: 'Вчера', week: 'Неделя', month: 'Месяц', year: 'Год', all: 'Все' };

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950/20 via-background to-background pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto md:max-w-none">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold">История</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} транзакций</p>
          </div>
          <Button onClick={() => setOpen(true)} className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="h-4 w-4" /> Добавить
          </Button>
        </div>

        {/* Period filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${period === p ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-3 text-center">
              <p className="text-[11px] text-muted-foreground mb-0.5">Доходы</p>
              <p className="font-bold text-emerald-400 text-sm">+{totalIncome.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="p-3 text-center">
              <p className="text-[11px] text-muted-foreground mb-0.5">Расходы</p>
              <p className="font-bold text-red-400 text-sm">-{totalExpense.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className={net >= 0 ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}>
            <CardContent className="p-3 text-center">
              <p className="text-[11px] text-muted-foreground mb-0.5">Итог</p>
              <p className={`font-bold text-sm ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{net >= 0 ? '+' : ''}{net.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Поиск по заметке или категории..." className="pl-9" />
        </div>

        {/* Transactions list */}
        {paginated.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Транзакций нет</p>
          </div>
        ) : (
          <div className="space-y-2">
            {paginated.map((tx) => (
              <Card key={tx.id} className="border-border hover:border-border/80 transition-colors">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`flex items-center justify-center h-9 w-9 rounded-full flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                    {tx.type === 'income' ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : <TrendingDown className="h-4 w-4 text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tx.note || tx.category}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[10px] py-0">{tx.category}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} {currency}
                    </span>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => { deleteTransaction(tx.id); toast.success('Удалено'); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button size="icon" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
            <Button size="icon" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Add dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader><DialogTitle>Новая транзакция</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setForm((f) => ({ ...f, type: 'income' }))}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${form.type === 'income' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border text-muted-foreground hover:border-emerald-500/50'}`}
              >
                Доход
              </button>
              <button
                onClick={() => setForm((f) => ({ ...f, type: 'expense' }))}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${form.type === 'expense' ? 'bg-red-500 border-red-500 text-white' : 'border-border text-muted-foreground hover:border-red-500/50'}`}
              >
                Расход
              </button>
            </div>
            <div className="space-y-1"><Label>Сумма ({currency})</Label><Input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Категория</Label><Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="еда, транспорт..." /></div>
            <div className="space-y-1"><Label>Заметка</Label><Input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Кофе в Starbucks" /></div>
            <div className="space-y-1"><Label>Дата</Label><Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Отмена</Button>
            <Button onClick={handleAdd} className={`flex-1 text-white ${form.type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`} disabled={!form.amount}>Добавить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
