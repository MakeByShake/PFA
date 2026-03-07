'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Calculator, Wallet, TrendingUp, TrendingDown, CreditCard, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useWalletStore } from '@/stores/wallet-store';
import { useIncomeStore } from '@/stores/income-store';
import { useDebtsStore } from '@/stores/debts-store';
import { useAuthStore } from '@/stores/auth-store';

interface PlanItem {
  id: string;
  label: string;
  amount: number;
}

export default function CalculationsPage() {
  const currentMoney = useWalletStore((s) => s.currentMoney);
  const setMoney = useWalletStore((s) => s.setMoney);
  const { incomeSources, expenseItems } = useIncomeStore();
  const { debts } = useDebtsStore();
  const currency = useAuthStore((s) => s.currentUser?.currency ?? '₸');

  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [editingBalance, setEditingBalance] = useState(false);

  const totalMonthlyIncome = incomeSources.reduce((s, i) => s + i.amount, 0);
  const totalMonthlyExpense = expenseItems.reduce((s, e) => s + e.amount, 0);
  const activeDebts = debts.filter((d) => !d.settled);
  const iOweTotal = activeDebts.filter((d) => d.direction === 'i_owe').reduce((s, d) => s + d.amount, 0);

  const totalPlan = planItems.reduce((s, p) => s + p.amount, 0);
  const remaining = currentMoney - totalPlan;
  const remainingPercent = currentMoney > 0 ? Math.max(0, Math.min(100, (remaining / currentMoney) * 100)) : 0;

  const suggestions = useMemo(() => [
    ...expenseItems.filter((e) => !e.paidThisMonth).map((e) => ({ id: e.id, label: e.name, amount: e.amount })),
    ...activeDebts.filter((d) => d.direction === 'i_owe').slice(0, 2).map((d) => ({ id: d.id, label: `Долг: ${d.personName}`, amount: d.amount })),
  ], [expenseItems, activeDebts]);

  const addPlanItem = () => {
    if (!newLabel || !newAmount) return;
    setPlanItems((prev) => [...prev, { id: `plan-${Date.now()}`, label: newLabel, amount: Number(newAmount) }]);
    setNewLabel('');
    setNewAmount('');
  };

  const addSuggestion = (s: { id: string; label: string; amount: number }) => {
    if (planItems.some((p) => p.label === s.label)) return;
    setPlanItems((prev) => [...prev, { id: `plan-${Date.now()}`, label: s.label, amount: s.amount }]);
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/15 via-background to-background pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto md:max-w-none">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Расчёты</h1>
          <p className="text-sm text-muted-foreground">Планируй распределение средств</p>
        </div>

        {/* Current balance card */}
        <Card className="mb-6 border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-400" />
                <p className="font-semibold">Текущий баланс</p>
              </div>
              {!editingBalance ? (
                <Button size="sm" variant="outline" onClick={() => { setEditBalance(currentMoney.toString()); setEditingBalance(true); }}>
                  Изменить
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input value={editBalance} onChange={(e) => setEditBalance(e.target.value)} inputMode="numeric" className="w-32 h-8" />
                  <Button size="sm" className="bg-emerald-500 text-white h-8" onClick={() => { setMoney(Number(editBalance)); setEditingBalance(false); }}>OK</Button>
                  <Button size="sm" variant="outline" className="h-8" onClick={() => setEditingBalance(false)}>✕</Button>
                </div>
              )}
            </div>
            <p className="text-3xl font-bold text-emerald-400">{currentMoney.toLocaleString()} {currency}</p>
          </CardContent>
        </Card>

        {/* Overview grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Доходы/мес</p>
              <p className="font-bold text-emerald-400 text-sm">{totalMonthlyIncome.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <TrendingDown className="h-5 w-5 text-red-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Расходы/мес</p>
              <p className="font-bold text-red-400 text-sm">{totalMonthlyExpense.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <CreditCard className="h-5 w-5 text-amber-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Долги</p>
              <p className="font-bold text-amber-400 text-sm">{iOweTotal.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Simulation */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4 text-emerald-400" /> Симуляция распределения
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Remaining bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Распределено: {totalPlan.toLocaleString()} {currency}</span>
                <span className={remaining >= 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                  Остаток: {remaining.toLocaleString()} {currency}
                </span>
              </div>
              <Progress value={remainingPercent} className="h-2" />
              {remaining < 0 && (
                <p className="text-xs text-red-400 mt-1">Превышение баланса на {Math.abs(remaining).toLocaleString()} {currency}</p>
              )}
            </div>

            {/* Add plan item */}
            <div className="flex gap-2 mb-3">
              <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Назначение" className="flex-1" />
              <Input value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="Сумма" inputMode="numeric" className="w-28" />
              <Button onClick={addPlanItem} size="icon" className="bg-emerald-500 hover:bg-emerald-600 text-white flex-shrink-0"><Plus className="h-4 w-4" /></Button>
            </div>

            {/* Plan items */}
            {planItems.length > 0 && (
              <div className="space-y-2 mb-4">
                {planItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{((item.amount / currentMoney) * 100).toFixed(1)}% от баланса</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{item.amount.toLocaleString()} {currency}</span>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setPlanItems((p) => p.filter((pi) => pi.id !== item.id))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Быстро добавить из данных</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => addSuggestion(s)}
                      disabled={planItems.some((p) => p.label === s.label)}
                      className="px-3 py-1.5 rounded-full text-xs border border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {s.label}: {s.amount.toLocaleString()} {currency}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Net monthly */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Чистый ежемесячный доход</p>
            <p className={`text-2xl font-bold ${totalMonthlyIncome - totalMonthlyExpense >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {(totalMonthlyIncome - totalMonthlyExpense).toLocaleString()} {currency}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Доходы {totalMonthlyIncome.toLocaleString()} − Расходы {totalMonthlyExpense.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
