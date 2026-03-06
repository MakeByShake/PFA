'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IncomeSource, ExpenseItem } from '@/lib/types';
import { useWalletStore } from './wallet-store';
import { useHistoryStore } from './history-store';

interface IncomeStore {
  incomeSources: IncomeSource[];
  expenseItems: ExpenseItem[];
  addIncomeSource: (data: Omit<IncomeSource, 'id' | 'createdAt' | 'receivedThisMonth'>) => void;
  updateIncomeSource: (id: string, data: Partial<IncomeSource>) => void;
  deleteIncomeSource: (id: string) => void;
  markIncomeReceived: (id: string) => void;
  addQuickIncome: (name: string, amount: number, category: IncomeSource['category']) => void;
  addExpenseItem: (data: Omit<ExpenseItem, 'id' | 'createdAt' | 'paidThisMonth'>) => void;
  updateExpenseItem: (id: string, data: Partial<ExpenseItem>) => void;
  deleteExpenseItem: (id: string) => void;
  markExpensePaid: (id: string) => void;
  addQuickExpense: (name: string, amount: number, category: ExpenseItem['category']) => void;
  resetMonthlyFlags: () => void;
}

export const useIncomeStore = create<IncomeStore>()(
  persist(
    (set) => ({
      incomeSources: [],
      expenseItems: [],

      addIncomeSource: (data) => {
        set((s) => ({
          incomeSources: [
            ...s.incomeSources,
            { ...data, id: `inc-${Date.now()}`, receivedThisMonth: false, createdAt: new Date().toISOString() },
          ],
        }));
      },

      updateIncomeSource: (id, data) => {
        set((s) => ({ incomeSources: s.incomeSources.map((i) => (i.id === id ? { ...i, ...data } : i)) }));
      },

      deleteIncomeSource: (id) => {
        set((s) => ({ incomeSources: s.incomeSources.filter((i) => i.id !== id) }));
      },

      markIncomeReceived: (id) => {
        set((s) => {
          const src = s.incomeSources.find((i) => i.id === id);
          if (!src || src.receivedThisMonth) return s;
          useWalletStore.getState().addMoney(src.amount);
          useHistoryStore.getState().addTransaction({
            type: 'income',
            amount: src.amount,
            category: src.category,
            note: src.name,
            date: new Date().toISOString(),
          });
          return { incomeSources: s.incomeSources.map((i) => (i.id === id ? { ...i, receivedThisMonth: true } : i)) };
        });
      },

      addQuickIncome: (name, amount, category) => {
        useWalletStore.getState().addMoney(amount);
        useHistoryStore.getState().addTransaction({
          type: 'income',
          amount,
          category,
          note: name,
          date: new Date().toISOString(),
        });
      },

      addExpenseItem: (data) => {
        set((s) => ({
          expenseItems: [
            ...s.expenseItems,
            { ...data, id: `exp-${Date.now()}`, paidThisMonth: false, createdAt: new Date().toISOString() },
          ],
        }));
      },

      updateExpenseItem: (id, data) => {
        set((s) => ({ expenseItems: s.expenseItems.map((e) => (e.id === id ? { ...e, ...data } : e)) }));
      },

      deleteExpenseItem: (id) => {
        set((s) => ({ expenseItems: s.expenseItems.filter((e) => e.id !== id) }));
      },

      markExpensePaid: (id) => {
        set((s) => {
          const item = s.expenseItems.find((e) => e.id === id);
          if (!item || item.paidThisMonth) return s;
          useWalletStore.getState().subtractMoney(item.amount);
          useHistoryStore.getState().addTransaction({
            type: 'expense',
            amount: item.amount,
            category: item.category,
            note: item.name,
            date: new Date().toISOString(),
          });
          return { expenseItems: s.expenseItems.map((e) => (e.id === id ? { ...e, paidThisMonth: true } : e)) };
        });
      },

      addQuickExpense: (name, amount, category) => {
        useWalletStore.getState().subtractMoney(amount);
        useHistoryStore.getState().addTransaction({
          type: 'expense',
          amount,
          category,
          note: name,
          date: new Date().toISOString(),
        });
      },

      resetMonthlyFlags: () => {
        set((s) => ({
          incomeSources: s.incomeSources.map((i) => ({ ...i, receivedThisMonth: false })),
          expenseItems: s.expenseItems.map((e) => ({ ...e, paidThisMonth: false })),
        }));
      },
    }),
    { name: 'pfa-income' }
  )
);
