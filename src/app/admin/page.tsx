'use client';

import { useState } from 'react';
import { Plus, Trash2, Shield, Users, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/stores/auth-store';
import type { UserRole } from '@/lib/types';

export default function AdminPage() {
  const { users, currentUser, addUser, deleteUser, updateUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' as UserRole });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.filter((u) => u.role === 'user').length;

  const handleAdd = () => {
    if (!form.name || !form.email || !form.password) { toast.error('Заполните все поля'); return; }
    const exists = users.some((u) => u.email.toLowerCase() === form.email.toLowerCase());
    if (exists) { toast.error('Пользователь с таким email уже существует'); return; }
    addUser({ name: form.name, email: form.email, password: form.password, role: form.role, currency: '₸', theme: 'dark' });
    setForm({ name: '', email: '', password: '', role: 'user' });
    setOpen(false);
    toast.success('Пользователь добавлен');
  };

  const handleDelete = (id: string, name: string) => {
    if (id === currentUser?.id) { toast.error('Нельзя удалить себя'); return; }
    deleteUser(id);
    toast.success(`Пользователь ${name} удалён`);
  };

  const handleRoleChange = (id: string, role: UserRole) => {
    if (id === currentUser?.id) { toast.error('Нельзя изменить свою роль'); return; }
    updateUser(id, { role });
    toast.success('Роль обновлена');
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-background to-background pointer-events-none" />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-emerald-400" />
              <h1 className="text-2xl font-bold">Администратор</h1>
            </div>
            <p className="text-sm text-muted-foreground">Управление пользователями</p>
          </div>
          <Button onClick={() => setOpen(true)} className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="h-4 w-4" /> Добавить
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-1 text-emerald-400" />
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground">Всего</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Crown className="h-6 w-6 mx-auto mb-1 text-amber-400" />
              <p className="text-2xl font-bold">{adminCount}</p>
              <p className="text-xs text-muted-foreground">Администраторов</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-1 text-blue-400" />
              <p className="text-2xl font-bold">{userCount}</p>
              <p className="text-xs text-muted-foreground">Пользователей</p>
            </CardContent>
          </Card>
        </div>

        {/* Users table desktop */}
        <Card className="hidden md:block">
          <CardHeader className="pb-3"><CardTitle className="text-base">Список пользователей</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Создан</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const initials = user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}{user.id === currentUser?.id && <span className="ml-1 text-xs text-muted-foreground">(вы)</span>}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Select value={user.role} onValueChange={(v) => handleRoleChange(user.id, v as UserRole)} disabled={user.id === currentUser?.id}>
                          <SelectTrigger className="w-36 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Пользователь</SelectItem>
                            <SelectItem value="admin">Администратор</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(user.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" disabled={user.id === currentUser?.id}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
                              <AlertDialogDescription>Это действие необратимо. Пользователь {user.name} будет удалён.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(user.id, user.name)} className="bg-destructive text-white hover:bg-destructive/90">Удалить</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {users.map((user) => {
            const initials = user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
            return (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-sm font-bold">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{user.name}{user.id === currentUser?.id && <span className="ml-1 text-xs text-muted-foreground">(вы)</span>}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <div className="mt-1">
                          <Select value={user.role} onValueChange={(v) => handleRoleChange(user.id, v as UserRole)} disabled={user.id === currentUser?.id}>
                            <SelectTrigger className="h-6 text-[11px] w-32 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Пользователь</SelectItem>
                              <SelectItem value="admin">Администратор</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    {user.id !== currentUser?.id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
                            <AlertDialogDescription>{user.name} будет удалён безвозвратно.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(user.id, user.name)} className="bg-destructive text-white">Удалить</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add user dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader><DialogTitle>Новый пользователь</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1"><Label>Имя</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Иван Иванов" /></div>
            <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="ivan@example.com" /></div>
            <div className="space-y-1"><Label>Пароль</Label><Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" /></div>
            <div className="space-y-1"><Label>Роль</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as UserRole }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Отмена</Button>
            <Button onClick={handleAdd} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">Добавить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
