'use client';

import { create } from 'zustand';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { IncomeSource, ExpenseItem } from '@/lib/types';
import { useWalletStore } from './wallet-store';
import { useHistoryStore } from './history-store';

interface IncomeStore {
  incomeSources: IncomeSource[];
  expenseItems: ExpenseItem[];
  setIncomeSources: (s: IncomeSource[]) => void;
  setExpenseItems: (e: ExpenseItem[]) => void;
  addIncomeSource: (data: Omit<IncomeSource, 'id' | 'createdAt' | 'receivedThisMonth'>) => void;
  deleteIncomeSource: (id: string) => void;
  markIncomeReceived: (id: string) => void;
  addQuickIncome: (name: string, amount: number, category: IncomeSource['category']) => void;
  addExpenseItem: (data: Omit<ExpenseItem, 'id' | 'createdAt' | 'paidThisMonth'>) => void;
  deleteExpenseItem: (id: string) => void;
  markExpensePaid: (id: string) => void;
  addQuickExpense: (name: string, amount: number, category: ExpenseItem['category']) => void;
  resetMonthlyFlags: () => void;
}

const uid = () => auth.currentUser?.uid ?? null;

export const useIncomeStore = create<IncomeStore>()((set, get) => ({
  incomeSources: [],
  expenseItems: [],

  setIncomeSources: (incomeSources) => set({ incomeSources }),
  setExpenseItems: (expenseItems) => set({ expenseItems }),

  addIncomeSource: (data) => {
    const u = uid();
    const src: IncomeSource = {
      ...data,
      id: `inc-${Date.now()}`,
      receivedThisMonth: false,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ incomeSources: [...s.incomeSources, src] }));
    if (u) setDoc(doc(db, 'users', u, 'income_sources', src.id), src);
  },

  deleteIncomeSource: (id) => {
    const u = uid();
    set((s) => ({ incomeSources: s.incomeSources.filter((i) => i.id !== id) }));
    if (u) deleteDoc(doc(db, 'users', u, 'income_sources', id));
  },

  markIncomeReceived: (id) => {
    const u = uid();
    const src = get().incomeSources.find((i) => i.id === id);
    if (!src || src.receivedThisMonth) return;
    useWalletStore.getState().addMoney(src.amount);
    useHistoryStore.getState().addTransaction({
      type: 'income', amount: src.amount, category: src.category,
      note: src.name, date: new Date().toISOString(),
    });
    const updated = { ...src, receivedThisMonth: true };
    set((s) => ({ incomeSources: s.incomeSources.map((i) => (i.id === id ? updated : i)) }));
    if (u) setDoc(doc(db, 'users', u, 'income_sources', id), updated);
  },

  addQuickIncome: (name, amount, category) => {
    useWalletStore.getState().addMoney(amount);
    useHistoryStore.getState().addTransaction({
      type: 'income', amount, category, note: name, date: new Date().toISOString(),
    });
  },

  addExpenseItem: (data) => {
    const u = uid();
    const item: ExpenseItem = {
      ...data,
      id: `exp-${Date.now()}`,
      paidThisMonth: false,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ expenseItems: [...s.expenseItems, item] }));
    if (u) setDoc(doc(db, 'users', u, 'expense_items', item.id), item);
  },

  deleteExpenseItem: (id) => {
    const u = uid();
    set((s) => ({ expenseItems: s.expenseItems.filter((e) => e.id !== id) }));
    if (u) deleteDoc(doc(db, 'users', u, 'expense_items', id));
  },

  markExpensePaid: (id) => {
    const u = uid();
    const item = get().expenseItems.find((e) => e.id === id);
    if (!item || item.paidThisMonth) return;
    useWalletStore.getState().subtractMoney(item.amount);
    useHistoryStore.getState().addTransaction({
      type: 'expense', amount: item.amount, category: item.category,
      note: item.name, date: new Date().toISOString(),
    });
    const updated = { ...item, paidThisMonth: true };
    set((s) => ({ expenseItems: s.expenseItems.map((e) => (e.id === id ? updated : e)) }));
    if (u) setDoc(doc(db, 'users', u, 'expense_items', id), updated);
  },

  addQuickExpense: (name, amount, category) => {
    useWalletStore.getState().subtractMoney(amount);
    useHistoryStore.getState().addTransaction({
      type: 'expense', amount, category, note: name, date: new Date().toISOString(),
    });
  },

  resetMonthlyFlags: () => {
    const u = uid();
    set((s) => {
      const incomeSources = s.incomeSources.map((i) => ({ ...i, receivedThisMonth: false }));
      const expenseItems = s.expenseItems.map((e) => ({ ...e, paidThisMonth: false }));
      if (u) {
        incomeSources.forEach((i) => setDoc(doc(db, 'users', u, 'income_sources', i.id), i));
        expenseItems.forEach((e) => setDoc(doc(db, 'users', u, 'expense_items', e.id), e));
      }
      return { incomeSources, expenseItems };
    });
  },
}));
