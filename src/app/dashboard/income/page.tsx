'use client';

import { useState } from 'react';
import { Plus, Trash2, Check, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useIncomeStore } from '@/stores/income-store';
import { useWalletStore } from '@/stores/wallet-store';
import { useAuthStore } from '@/stores/auth-store';
import type { IncomeCategory, ExpenseCategory } from '@/lib/types';

const INCOME_CATEGORIES: IncomeCategory[] = ['стипендия', 'зарплата', 'аренда', 'бизнес', 'подарок', 'другое'];
const EXPENSE_CATEGORIES: ExpenseCategory[] = ['транспорт', 'еда', 'жилье', 'здоровье', 'развлечения', 'одежда', 'другое'];

export default function IncomePage() {
  const { incomeSources, expenseItems, addIncomeSource, deleteIncomeSource, markIncomeReceived, addQuickIncome, addExpenseItem, deleteExpenseItem, markExpensePaid, addQuickExpense } = useIncomeStore();
  const currentMoney = useWalletStore((s) => s.currentMoney);
  const currency = useAuthStore((s) => s.currentUser?.currency ?? '₸');

  const [incomeDialog, setIncomeDialog] = useState(false);
  const [expenseDialog, setExpenseDialog] = useState(false);
  const [quickIncomeDialog, setQuickIncomeDialog] = useState(false);
  const [quickExpenseDialog, setQuickExpenseDialog] = useState(false);

  // Income form
  const [iForm, setIForm] = useState({ name: '', amount: '', category: 'зарплата' as IncomeCategory, scheduleDay: '' });
  // Expense form
  const [eForm, setEForm] = useState({ name: '', amount: '', category: 'еда' as ExpenseCategory, scheduleDay: '' });
  // Quick income
  const [qiForm, setQiForm] = useState({ name: '', amount: '', category: 'другое' as IncomeCategory });
  // Quick expense
  const [qeForm, setQeForm] = useState({ name: '', amount: '', category: 'другое' as ExpenseCategory });

  const totalIncome = incomeSources.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenseItems.reduce((s, e) => s + e.amount, 0);

  const handleAddIncome = () => {
    if (!iForm.name || !iForm.amount) return;
    addIncomeSource({ name: iForm.name, amount: Number(iForm.amount), category: iForm.category, scheduleDay: iForm.scheduleDay ? Number(iForm.scheduleDay) : undefined });
    setIForm({ name: '', amount: '', category: 'зарплата', scheduleDay: '' });
    setIncomeDialog(false);
    toast.success('Источник дохода добавлен');
  };

  const handleAddExpense = () => {
    if (!eForm.name || !eForm.amount) return;
    addExpenseItem({ name: eForm.name, amount: Number(eForm.amount), category: eForm.category, scheduleDay: eForm.scheduleDay ? Number(eForm.scheduleDay) : undefined });
    setEForm({ name: '', amount: '', category: 'еда', scheduleDay: '' });
    setExpenseDialog(false);
    toast.success('Расход добавлен');
  };

  const handleQuickIncome = () => {
    if (!qiForm.name || !qiForm.amount) return;
    addQuickIncome(qiForm.name, Number(qiForm.amount), qiForm.category);
    setQiForm({ name: '', amount: '', category: 'другое' });
    setQuickIncomeDialog(false);
    toast.success(`+${Number(qiForm.amount).toLocaleString()} ${currency} добавлено`);
  };

  const handleQuickExpense = () => {
    if (!qeForm.name || !qeForm.amount) return;
    addQuickExpense(qeForm.name, Number(qeForm.amount), qeForm.category);
    setQeForm({ name: '', amount: '', category: 'другое' });
    setQuickExpenseDialog(false);
    toast.success(`-${Number(qeForm.amount).toLocaleString()} ${currency} списано`);
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-950/20 via-background to-background pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto md:max-w-none">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Доходы / Расходы</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Баланс: <span className="text-emerald-400 font-semibold">{currentMoney.toLocaleString()} {currency}</span>
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Ежемесячные доходы</p>
              <p className="text-xl font-bold text-emerald-400">{totalIncome.toLocaleString()} {currency}</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Ежемесячные расходы</p>
              <p className="text-xl font-bold text-red-400">{totalExpense.toLocaleString()} {currency}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button onClick={() => setQuickIncomeDialog(true)} className="gap-2 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 h-12">
            <Zap className="h-4 w-4" /> Быстрый доход
          </Button>
          <Button onClick={() => setQuickExpenseDialog(true)} className="gap-2 bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 h-12">
            <Zap className="h-4 w-4" /> Быстрый расход
          </Button>
        </div>

        <Tabs defaultValue="income" className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="income" className="gap-2"><TrendingUp className="h-4 w-4" /> Доходы</TabsTrigger>
            <TabsTrigger value="expense" className="gap-2"><TrendingDown className="h-4 w-4" /> Расходы</TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-3">
            <div className="flex justify-end">
              <Button onClick={() => setIncomeDialog(true)} size="sm" className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                <Plus className="h-4 w-4" /> Добавить источник
              </Button>
            </div>
            {incomeSources.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Нет источников дохода</p>
              </div>
            ) : (
              incomeSources.map((src) => (
                <Card key={src.id} className={`border ${src.receivedThisMonth ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border'}`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{src.name}</p>
                        <Badge variant="secondary" className="text-xs">{src.category}</Badge>
                        {src.scheduleDay && <span className="text-xs text-muted-foreground">{src.scheduleDay}-го числа</span>}
                      </div>
                      <p className="text-lg font-bold text-emerald-400 mt-0.5">+{src.amount.toLocaleString()} {currency}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => { markIncomeReceived(src.id); toast.success(`${src.name}: +${src.amount.toLocaleString()} ${currency} получено`); }}
                        disabled={src.receivedThisMonth}
                        className={src.receivedThisMonth ? 'bg-emerald-500/20 text-emerald-400 cursor-default' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {src.receivedThisMonth ? 'Получено' : 'Получить'}
                      </Button>
                      <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={() => deleteIncomeSource(src.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="expense" className="space-y-3">
            <div className="flex justify-end">
              <Button onClick={() => setExpenseDialog(true)} size="sm" className="gap-2 bg-red-500 hover:bg-red-600 text-white">
                <Plus className="h-4 w-4" /> Добавить расход
              </Button>
            </div>
            {expenseItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingDown className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Нет регулярных расходов</p>
              </div>
            ) : (
              expenseItems.map((exp) => (
                <Card key={exp.id} className={`border ${exp.paidThisMonth ? 'border-red-500/30 bg-red-500/5' : 'border-border'}`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{exp.name}</p>
                        <Badge variant="secondary" className="text-xs">{exp.category}</Badge>
                        {exp.scheduleDay && <span className="text-xs text-muted-foreground">{exp.scheduleDay}-го числа</span>}
                      </div>
                      <p className="text-lg font-bold text-red-400 mt-0.5">-{exp.amount.toLocaleString()} {currency}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => { markExpensePaid(exp.id); toast.success(`${exp.name}: -${exp.amount.toLocaleString()} ${currency} оплачено`); }}
                        disabled={exp.paidThisMonth}
                        className={exp.paidThisMonth ? 'bg-red-500/20 text-red-400 cursor-default' : 'bg-red-500 hover:bg-red-600 text-white'}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {exp.paidThisMonth ? 'Оплачено' : 'Оплатить'}
                      </Button>
                      <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={() => deleteExpenseItem(exp.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add income dialog */}
      <Dialog open={incomeDialog} onOpenChange={setIncomeDialog}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader><DialogTitle>Новый источник дохода</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1"><Label>Название</Label><Input value={iForm.name} onChange={(e) => setIForm((f) => ({ ...f, name: e.target.value }))} placeholder="Зарплата" /></div>
            <div className="space-y-1"><Label>Сумма ({currency})</Label><Input type="number" value={iForm.amount} onChange={(e) => setIForm((f) => ({ ...f, amount: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Категория</Label>
              <Select value={iForm.category} onValueChange={(v) => setIForm((f) => ({ ...f, category: v as IncomeCategory }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{INCOME_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>День поступления (число месяца)</Label><Input type="number" min={1} max={31} value={iForm.scheduleDay} onChange={(e) => setIForm((f) => ({ ...f, scheduleDay: e.target.value }))} placeholder="Например: 5" /></div>
          </div>
          <div className="flex gap-3 mt-2"><Button variant="outline" onClick={() => setIncomeDialog(false)} className="flex-1">Отмена</Button><Button onClick={handleAddIncome} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">Добавить</Button></div>
        </DialogContent>
      </Dialog>

      {/* Add expense dialog */}
      <Dialog open={expenseDialog} onOpenChange={setExpenseDialog}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader><DialogTitle>Новый расход</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1"><Label>Название</Label><Input value={eForm.name} onChange={(e) => setEForm((f) => ({ ...f, name: e.target.value }))} placeholder="Проездной" /></div>
            <div className="space-y-1"><Label>Сумма ({currency})</Label><Input type="number" value={eForm.amount} onChange={(e) => setEForm((f) => ({ ...f, amount: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Категория</Label>
              <Select value={eForm.category} onValueChange={(v) => setEForm((f) => ({ ...f, category: v as ExpenseCategory }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>День оплаты (число месяца)</Label><Input type="number" min={1} max={31} value={eForm.scheduleDay} onChange={(e) => setEForm((f) => ({ ...f, scheduleDay: e.target.value }))} placeholder="Например: 1" /></div>
          </div>
          <div className="flex gap-3 mt-2"><Button variant="outline" onClick={() => setExpenseDialog(false)} className="flex-1">Отмена</Button><Button onClick={handleAddExpense} className="flex-1 bg-red-500 hover:bg-red-600 text-white">Добавить</Button></div>
        </DialogContent>
      </Dialog>

      {/* Quick income */}
      <Dialog open={quickIncomeDialog} onOpenChange={setQuickIncomeDialog}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader><DialogTitle>Быстрый доход</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1"><Label>Описание</Label><Input value={qiForm.name} onChange={(e) => setQiForm((f) => ({ ...f, name: e.target.value }))} placeholder="Получил от друга" /></div>
            <div className="space-y-1"><Label>Сумма ({currency})</Label><Input type="number" value={qiForm.amount} onChange={(e) => setQiForm((f) => ({ ...f, amount: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Категория</Label>
              <Select value={qiForm.category} onValueChange={(v) => setQiForm((f) => ({ ...f, category: v as IncomeCategory }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{INCOME_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 mt-2"><Button variant="outline" onClick={() => setQuickIncomeDialog(false)} className="flex-1">Отмена</Button><Button onClick={handleQuickIncome} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">Получить</Button></div>
        </DialogContent>
      </Dialog>

      {/* Quick expense */}
      <Dialog open={quickExpenseDialog} onOpenChange={setQuickExpenseDialog}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader><DialogTitle>Быстрый расход</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1"><Label>Описание</Label><Input value={qeForm.name} onChange={(e) => setQeForm((f) => ({ ...f, name: e.target.value }))} placeholder="Кофе в кафе" /></div>
            <div className="space-y-1"><Label>Сумма ({currency})</Label><Input type="number" value={qeForm.amount} onChange={(e) => setQeForm((f) => ({ ...f, amount: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Категория</Label>
              <Select value={qeForm.category} onValueChange={(v) => setQeForm((f) => ({ ...f, category: v as ExpenseCategory }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 mt-2"><Button variant="outline" onClick={() => setQuickExpenseDialog(false)} className="flex-1">Отмена</Button><Button onClick={handleQuickExpense} className="flex-1 bg-red-500 hover:bg-red-600 text-white">Списать</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
