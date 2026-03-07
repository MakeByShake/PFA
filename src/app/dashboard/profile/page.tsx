'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, Mail, LogOut, Save, Wallet, Shield, Camera, Send, Phone, Instagram, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(currentUser?.name ?? '');
  const [currency, setCurrency] = useState(currentUser?.currency ?? '₸');
  const [balanceInput, setBalanceInput] = useState(currentMoney.toString());
  const [telegram, setTelegram] = useState(currentUser?.telegram ?? '');
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp ?? '');
  const [instagram, setInstagram] = useState(currentUser?.instagram ?? '');
  const [kaspiNumber, setKaspiNumber] = useState(currentUser?.kaspiNumber ?? '');

  if (!currentUser) return null;

  const initials = currentUser.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Файл слишком большой (максимум 2 МБ)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      updateCurrentUser({ avatar: base64 });
      toast.success('Аватар обновлён');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateCurrentUser({
      name: name.trim() || currentUser.name,
      currency,
      telegram: telegram.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
      instagram: instagram.trim() || undefined,
      kaspiNumber: kaspiNumber.trim() || undefined,
    });
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
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-emerald-500/40">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-2xl font-bold">{initials}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-colors"
                >
                  <Camera className="h-3.5 w-3.5 text-white" />
                </button>
                {currentUser.avatar && (
                  <button
                    onClick={() => { updateCurrentUser({ avatar: undefined }); toast.success('Аватар удалён'); }}
                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive flex items-center justify-center hover:bg-destructive/80 transition-colors"
                  >
                    <Trash2 className="h-3 w-3 text-white" />
                  </button>
                )}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="text-lg font-bold">{currentUser.name}</p>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                <Badge className="mt-1 text-xs" variant={currentUser.role === 'admin' ? 'default' : 'secondary'}>
                  {currentUser.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin link */}
        {currentUser.role === 'admin' && (
          <Card className="mb-4 border-violet-500/30 bg-violet-500/5">
            <CardContent className="p-3">
              <Button variant="ghost" className="w-full gap-2 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10" onClick={() => router.push('/admin')}>
                <Shield className="h-4 w-4" /> Панель администратора
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Balance */}
        <Card className="mb-4 border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-400" /> Текущий баланс
            </CardTitle>
          </CardHeader>
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
          <CardHeader className="pb-3"><CardTitle className="text-base">Основные данные</CardTitle></CardHeader>
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
          </CardContent>
        </Card>

        {/* Social & bank */}
        <Card className="mb-4">
          <CardHeader className="pb-3"><CardTitle className="text-base">Контакты и банк</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Telegram</Label>
              <div className="relative">
                <Send className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={telegram} onChange={(e) => setTelegram(e.target.value)} className="pl-9" placeholder="@username" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="pl-9" placeholder="+7 777 000 00 00" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Instagram</Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="pl-9" placeholder="@username" />
              </div>
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label>Kaspi номер / карта</Label>
              <Input value={kaspiNumber} onChange={(e) => setKaspiNumber(e.target.value)} placeholder="+7 777 000 00 00 или номер карты" />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2 mb-4">
          <Save className="h-4 w-4" /> Сохранить профиль
        </Button>

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
