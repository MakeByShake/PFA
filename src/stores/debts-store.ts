'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Debt } from '@/lib/types';
import { useWalletStore } from './wallet-store';
import { useHistoryStore } from './history-store';

interface DebtsStore {
  debts: Debt[];
  addDebt: (data: Omit<Debt, 'id' | 'createdAt' | 'settled'>) => void;
  updateDebt: (id: string, data: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  settleDebt: (id: string) => void;
}

export const useDebtsStore = create<DebtsStore>()(
  persist(
    (set) => ({
      debts: [],

      addDebt: (data) => {
        set((s) => ({
          debts: [
            ...s.debts,
            { ...data, id: `debt-${Date.now()}`, settled: false, createdAt: new Date().toISOString() },
          ],
        }));
      },

      updateDebt: (id, data) => {
        set((s) => ({ debts: s.debts.map((d) => (d.id === id ? { ...d, ...data } : d)) }));
      },

      deleteDebt: (id) => {
        set((s) => ({ debts: s.debts.filter((d) => d.id !== id) }));
      },

      settleDebt: (id) => {
        set((s) => {
          const debt = s.debts.find((d) => d.id === id);
          if (!debt || debt.settled) return s;
          if (debt.direction === 'i_owe') {
            useWalletStore.getState().subtractMoney(debt.amount);
            useHistoryStore.getState().addTransaction({
              type: 'expense',
              amount: debt.amount,
              category: 'долг',
              note: `Погашение долга: ${debt.personName}`,
              date: new Date().toISOString(),
            });
          } else {
            useWalletStore.getState().addMoney(debt.amount);
            useHistoryStore.getState().addTransaction({
              type: 'income',
              amount: debt.amount,
              category: 'долг',
              note: `Возврат долга от: ${debt.personName}`,
              date: new Date().toISOString(),
            });
          }
          return { debts: s.debts.map((d) => (d.id === id ? { ...d, settled: true } : d)) };
        });
      },
    }),
    { name: 'pfa-debts' }
  )
);
