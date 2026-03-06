'use client';

import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, collection, getDocs, deleteDoc, updateDoc, deleteField,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AppUser, UserRole } from '@/lib/types';

interface AuthStore {
  currentUser: AppUser | null;
  users: AppUser[];
  deletedUsers: AppUser[];
  isLoading: boolean; // true while Firebase checks auth state on startup

  // Internal — called by use-firebase-data hook
  setCurrentUser: (user: AppUser | null) => void;
  setIsLoading: (v: boolean) => void;

  // Auth
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;

  // Profile
  updateCurrentUser: (updates: Partial<AppUser>) => Promise<void>;

  // Admin
  loadAllUsers: () => Promise<void>;
  deleteUser: (id: string) => void;
  restoreUser: (id: string) => void;
  permanentDeleteUser: (id: string) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => Promise<void>;
  addUser: (data: Omit<AppUser, 'id' | 'createdAt'>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  currentUser: null,
  users: [],
  deletedUsers: [],
  isLoading: true,

  setCurrentUser: (user) => set({ currentUser: user, isLoading: false }),
  setIsLoading: (v) => set({ isLoading: v }),

  login: async (email, password) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;
      const snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) {
        await signOut(auth);
        return { success: false, error: 'Профиль не найден.' };
      }
      const userData = snap.data() as AppUser;
      if ((userData as any).deleted) {
        await signOut(auth);
        return { success: false, error: 'Аккаунт заблокирован.' };
      }
      set({ currentUser: userData });
      return { success: true };
    } catch (err: any) {
      const code = err?.code ?? '';
      if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
        return { success: false, error: 'Неверный email или пароль' };
      }
      return { success: false, error: 'Ошибка входа. Попробуйте ещё раз.' };
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ currentUser: null, users: [], deletedUsers: [] });
  },

  register: async (name, email, password) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;
      const role: UserRole = email.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user';
      const newUser: AppUser = {
        id: uid,
        name,
        email,
        password: '',
        role,
        currency: '₸',
        theme: 'dark',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', uid), newUser);
      set({ currentUser: newUser });
      return { success: true };
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        return { success: false, error: 'Email уже используется' };
      }
      return { success: false, error: 'Ошибка регистрации. Попробуйте ещё раз.' };
    }
  },

  updateCurrentUser: async (updates) => {
    const user = get().currentUser;
    if (!user) return;
    // Replace undefined values with deleteField() for Firestore
    const firestoreUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates as Record<string, unknown>)) {
      firestoreUpdates[key] = value === undefined ? deleteField() : value;
    }
    await updateDoc(doc(db, 'users', user.id), firestoreUpdates);
    // For local state, remove keys that were deleted
    const localUpdated = { ...user };
    for (const [key, value] of Object.entries(updates as Record<string, unknown>)) {
      if (value === undefined) {
        delete (localUpdated as Record<string, unknown>)[key];
      } else {
        (localUpdated as Record<string, unknown>)[key] = value;
      }
    }
    set({ currentUser: localUpdated });
  },

  loadAllUsers: async () => {
    const [activeSnap, deletedSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'deletedUsers')),
    ]);
    const active = activeSnap.docs
      .map((d) => d.data() as AppUser)
      .filter((u) => !(u as any).deleted);
    const deleted = deletedSnap.docs.map((d) => d.data() as AppUser);
    set({ users: active, deletedUsers: deleted });
  },

  addUser: async (userData) => {
    // Creates Firestore profile only — the user still needs to register via /register
    // to get a Firebase Auth account with this email.
    const id = `pending-${Date.now()}`;
    const newUser: AppUser = { ...userData, id, createdAt: new Date().toISOString() };
    await setDoc(doc(db, 'users', id), newUser);
    set((s) => ({ users: [...s.users, newUser] }));
  },

  deleteUser: (id) => {
    const user = get().users.find((u) => u.id === id);
    if (!user) return;
    // Move to deletedUsers collection
    setDoc(doc(db, 'deletedUsers', id), { ...user, deletedAt: new Date().toISOString() });
    deleteDoc(doc(db, 'users', id));
    set((s) => ({
      users: s.users.filter((u) => u.id !== id),
      deletedUsers: [...s.deletedUsers, user],
    }));
  },

  restoreUser: (id) => {
    const user = get().deletedUsers.find((u) => u.id === id);
    if (!user) return;
    setDoc(doc(db, 'users', id), user);
    deleteDoc(doc(db, 'deletedUsers', id));
    set((s) => ({
      deletedUsers: s.deletedUsers.filter((u) => u.id !== id),
      users: [...s.users, user],
    }));
  },

  permanentDeleteUser: (id) => {
    deleteDoc(doc(db, 'deletedUsers', id));
    set((s) => ({ deletedUsers: s.deletedUsers.filter((u) => u.id !== id) }));
  },

  updateUser: async (id, updates) => {
    await updateDoc(doc(db, 'users', id), updates as Record<string, unknown>);
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
      currentUser: s.currentUser?.id === id ? { ...s.currentUser, ...updates } : s.currentUser,
    }));
  },
}));
