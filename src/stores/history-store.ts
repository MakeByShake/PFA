'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction } from '@/lib/types';

interface HistoryStore {
  transactions: Transaction[];
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      transactions: [],

      addTransaction: (data) => {
        const tx: Transaction = {
          ...data,
          id: `tx-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ transactions: [tx, ...s.transactions] }));
      },

      deleteTransaction: (id) => {
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
      },
    }),
    { name: 'pfa-history' }
  )
);
