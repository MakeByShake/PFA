'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppUser, UserRole } from '@/lib/types';

const INITIAL_ADMIN: AppUser = {
  id: 'admin-1',
  name: 'Администратор',
  email: 'admin@pfa.app',
  password: 'admin123',
  role: 'admin',
  currency: '₸',
  theme: 'dark',
  createdAt: new Date().toISOString(),
};

const INITIAL_USER: AppUser = {
  id: 'user-1',
  name: 'Пользователь',
  email: 'user@pfa.app',
  password: 'user123',
  role: 'user',
  currency: '₸',
  theme: 'dark',
  createdAt: new Date().toISOString(),
};

interface AuthStore {
  currentUser: AppUser | null;
  users: AppUser[];
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  addUser: (user: Omit<AppUser, 'id' | 'createdAt'>) => void;
  deleteUser: (id: string) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  updateCurrentUser: (updates: Partial<AppUser>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [INITIAL_ADMIN, INITIAL_USER],

      login: (email, password) => {
        const user = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!user) return { success: false, error: 'Неверный email или пароль' };
        set({ currentUser: user });
        return { success: true };
      },

      logout: () => set({ currentUser: null }),

      register: (name, email, password) => {
        const exists = get().users.some(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (exists) return { success: false, error: 'Пользователь с таким email уже существует' };
        const newUser: AppUser = {
          id: `user-${Date.now()}`,
          name,
          email,
          password,
          role: 'user',
          currency: '₸',
          theme: 'dark',
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ users: [...s.users, newUser], currentUser: newUser }));
        return { success: true };
      },

      addUser: (userData) => {
        const newUser: AppUser = {
          ...userData,
          id: `user-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ users: [...s.users, newUser] }));
      },

      deleteUser: (id) => {
        set((s) => ({ users: s.users.filter((u) => u.id !== id) }));
      },

      updateUser: (id, updates) => {
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
          currentUser: s.currentUser?.id === id ? { ...s.currentUser, ...updates } : s.currentUser,
        }));
      },

      updateCurrentUser: (updates) => {
        set((s) => {
          if (!s.currentUser) return s;
          const updated = { ...s.currentUser, ...updates };
          return {
            currentUser: updated,
            users: s.users.map((u) => (u.id === updated.id ? updated : u)),
          };
        });
      },
    }),
    { name: 'pfa-auth' }
  )
);
