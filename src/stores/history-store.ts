'use client';

import { create } from 'zustand';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Transaction } from '@/lib/types';

interface HistoryStore {
  transactions: Transaction[];
  setTransactions: (txs: Transaction[]) => void;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
}

export const useHistoryStore = create<HistoryStore>()((set) => ({
  transactions: [],

  setTransactions: (transactions) => set({ transactions }),

  addTransaction: (data) => {
    const uid = auth.currentUser?.uid;
    const tx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ transactions: [tx, ...s.transactions] }));
    if (uid) setDoc(doc(db, 'users', uid, 'transactions', tx.id), tx);
  },

  deleteTransaction: (id) => {
    const uid = auth.currentUser?.uid;
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
    if (uid) deleteDoc(doc(db, 'users', uid, 'transactions', id));
  },
}));
