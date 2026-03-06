'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WishCard, WishColumn } from '@/lib/types';

interface WishlistStore {
  columns: WishColumn[];
  cards: WishCard[];
  addColumn: (title: string) => void;
  renameColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;
  addCard: (data: Omit<WishCard, 'id' | 'createdAt'>) => void;
  updateCard: (id: string, data: Partial<WishCard>) => void;
  deleteCard: (id: string) => void;
  moveCard: (cardId: string, toColumnId: string) => void;
  incrementCard: (id: string, amount: number) => void;
}

const DEFAULT_COLUMNS: WishColumn[] = [
  { id: 'col-1', title: 'Хочу купить', order: 0 },
  { id: 'col-2', title: 'Накапливаю', order: 1 },
  { id: 'col-3', title: 'Куплено', order: 2 },
];

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set) => ({
      columns: DEFAULT_COLUMNS,
      cards: [],

      addColumn: (title) => {
        set((s) => ({
          columns: [...s.columns, { id: `col-${Date.now()}`, title, order: s.columns.length }],
        }));
      },

      renameColumn: (id, title) => {
        set((s) => ({ columns: s.columns.map((c) => (c.id === id ? { ...c, title } : c)) }));
      },

      deleteColumn: (id) => {
        set((s) => ({
          columns: s.columns.filter((c) => c.id !== id),
          cards: s.cards.filter((c) => c.columnId !== id),
        }));
      },

      addCard: (data) => {
        const newCard: WishCard = {
          ...data,
          id: `card-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ cards: [...s.cards, newCard] }));
      },

      updateCard: (id, data) => {
        set((s) => ({ cards: s.cards.map((c) => (c.id === id ? { ...c, ...data } : c)) }));
      },

      deleteCard: (id) => {
        set((s) => ({ cards: s.cards.filter((c) => c.id !== id) }));
      },

      moveCard: (cardId, toColumnId) => {
        set((s) => ({
          cards: s.cards.map((c) => (c.id === cardId ? { ...c, columnId: toColumnId } : c)),
        }));
      },

      incrementCard: (id, amount) => {
        set((s) => ({
          cards: s.cards.map((c) => {
            if (c.id !== id) return c;
            return { ...c, currentAmount: Math.min(c.currentAmount + amount, c.targetAmount) };
          }),
        }));
      },
    }),
    { name: 'pfa-wishlist' }
  )
);
