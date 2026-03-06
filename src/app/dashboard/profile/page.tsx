'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, Mail, LogOut, Save, Wallet, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/stores/auth-store';
import { useWalletStore } from '@/stores/wallet-store';
import { useTheme } from 'next-themes';

const CURRENCIES = ['₸', '₽', '$', '€', '£', '¥'];

export default function ProfilePage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const updateCurrentUser = useAuthStore((s) => s.updateCurrentUser);
  const logout = useAuthStore((s) => s.logout);
  const currentMoney = useWalletStore((s) => s.currentMoney);
  const setMoney = useWalletStore((s) => s.setMoney);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(currentUser?.name ?? '');
  const [currency, setCurrency] = useState(currentUser?.currency ?? '₸');
  const [balanceInput, setBalanceInput] = useState(currentMoney.toString());

  if (!currentUser) return null;

  const initials = currentUser.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSave = () => {
    updateCurrentUser({ name: name.trim() || currentUser.name, currency });
    toast.success('Профиль обновлён');
  };

  const handleSaveBalance = () => {
    setMoney(Number(balanceInput) || 0);
    toast.success('Баланс обновлён');
  };

  const handleLogout = () => {
    logout();
    toast.success('Вы вышли из аккаунта');
    router.push('/login');
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/15 via-background to-background pointer-events-none" />
      <div className="relative z-10 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Профиль</h1>

        {/* Avatar + info */}
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-emerald-500/40">
                <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-bold">{currentUser.name}</p>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                <Badge className="mt-1 text-xs" variant={currentUser.role === 'admin' ? 'default' : 'secondary'}>
                  {currentUser.role === 'admin' ? '👑 Администратор' : '👤 Пользователь'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance */}
        <Card className="mb-4 border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Wallet className="h-4 w-4 text-emerald-400" /> Текущий баланс</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-emerald-400 flex-1">{currentMoney.toLocaleString()} {currentUser.currency}</p>
              <div className="flex items-center gap-2">
                <Input value={balanceInput} onChange={(e) => setBalanceInput(e.target.value)} type="number" className="w-28 h-8" />
                <Button size="sm" onClick={handleSaveBalance} className="bg-emerald-500 hover:bg-emerald-600 text-white h-8">Задать</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit profile */}
        <Card className="mb-4">
          <CardHeader className="pb-3"><CardTitle className="text-base">Настройки</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Имя</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={name} onChange={(e) => setName(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={currentUser.email} disabled className="pl-9 opacity-60" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Валюта</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Тёмная тема</p>
                <p className="text-xs text-muted-foreground">Переключить тему оформления</p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')}
              />
            </div>

            <Button onClick={handleSave} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
              <Save className="h-4 w-4" /> Сохранить
            </Button>
          </CardContent>
        </Card>

        {/* Admin link */}
        {currentUser.role === 'admin' && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => router.push('/admin')}
              >
                <Shield className="h-4 w-4 text-emerald-400" /> Панель администратора
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Logout */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" /> Выйти из аккаунта
        </Button>
      </div>
    </div>
  );
}
