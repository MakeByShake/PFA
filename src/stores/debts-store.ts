'use client';

import { create } from 'zustand';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Debt } from '@/lib/types';
import { useWalletStore } from './wallet-store';
import { useHistoryStore } from './history-store';

interface DebtsStore {
  debts: Debt[];
  setDebts: (debts: Debt[]) => void;
  addDebt: (data: Omit<Debt, 'id' | 'createdAt' | 'settled'>) => void;
  deleteDebt: (id: string) => void;
  settleDebt: (id: string) => void;
}

const uid = () => auth.currentUser?.uid ?? null;

export const useDebtsStore = create<DebtsStore>()((set, get) => ({
  debts: [],

  setDebts: (debts) => set({ debts }),

  addDebt: (data) => {
    const u = uid();
    const debt: Debt = {
      ...data,
      id: `debt-${Date.now()}`,
      settled: false,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ debts: [...s.debts, debt] }));
    if (u) setDoc(doc(db, 'users', u, 'debts', debt.id), debt);
  },

  deleteDebt: (id) => {
    const u = uid();
    set((s) => ({ debts: s.debts.filter((d) => d.id !== id) }));
    if (u) deleteDoc(doc(db, 'users', u, 'debts', id));
  },

  settleDebt: (id) => {
    const u = uid();
    const debt = get().debts.find((d) => d.id === id);
    if (!debt || debt.settled) return;
    if (debt.direction === 'i_owe') {
      useWalletStore.getState().subtractMoney(debt.amount);
      useHistoryStore.getState().addTransaction({
        type: 'expense', amount: debt.amount, category: 'долг',
        note: `Погашение долга: ${debt.personName}`, date: new Date().toISOString(),
      });
    } else {
      useWalletStore.getState().addMoney(debt.amount);
      useHistoryStore.getState().addTransaction({
        type: 'income', amount: debt.amount, category: 'долг',
        note: `Возврат долга от: ${debt.personName}`, date: new Date().toISOString(),
      });
    }
    const updated = { ...debt, settled: true };
    set((s) => ({ debts: s.debts.map((d) => (d.id === id ? updated : d)) }));
    if (u) setDoc(doc(db, 'users', u, 'debts', id), updated);
  },
}));
