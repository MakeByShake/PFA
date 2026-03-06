'use client';

import { create } from 'zustand';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { WishCard, WishColumn } from '@/lib/types';

const DEFAULT_COLUMNS: WishColumn[] = [
  { id: 'col-1', title: 'Хочу купить', order: 0 },
  { id: 'col-2', title: 'Накапливаю', order: 1 },
  { id: 'col-3', title: 'Куплено', order: 2 },
];

interface WishlistStore {
  columns: WishColumn[];
  cards: WishCard[];
  setColumns: (cols: WishColumn[]) => void;
  setCards: (cards: WishCard[]) => void;
  addColumn: (title: string) => void;
  renameColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;
  addCard: (data: Omit<WishCard, 'id' | 'createdAt'>) => void;
  updateCard: (id: string, data: Partial<WishCard>) => void;
  deleteCard: (id: string) => void;
  moveCard: (cardId: string, toColumnId: string) => void;
  incrementCard: (id: string, amount: number) => void;
}

const uid = () => auth.currentUser?.uid ?? null;
const colRef = (u: string, id: string) => doc(db, 'users', u, 'wishlist_columns', id);
const cardRef = (u: string, id: string) => doc(db, 'users', u, 'wishlist_cards', id);

export const useWishlistStore = create<WishlistStore>()((set, get) => ({
  columns: DEFAULT_COLUMNS,
  cards: [],

  setColumns: (columns) => set({ columns }),
  setCards: (cards) => set({ cards }),

  addColumn: (title) => {
    const u = uid();
    const col: WishColumn = { id: `col-${Date.now()}`, title, order: get().columns.length };
    set((s) => ({ columns: [...s.columns, col] }));
    if (u) setDoc(colRef(u, col.id), col);
  },

  renameColumn: (id, title) => {
    const u = uid();
    set((s) => {
      const columns = s.columns.map((c) => (c.id === id ? { ...c, title } : c));
      const col = columns.find((c) => c.id === id);
      if (u && col) setDoc(colRef(u, id), col);
      return { columns };
    });
  },

  deleteColumn: (id) => {
    const u = uid();
    const toDelete = get().cards.filter((c) => c.columnId === id);
    set((s) => ({
      columns: s.columns.filter((c) => c.id !== id),
      cards: s.cards.filter((c) => c.columnId !== id),
    }));
    if (u) {
      deleteDoc(colRef(u, id));
      toDelete.forEach((c) => deleteDoc(cardRef(u, c.id)));
    }
  },

  addCard: (data) => {
    const u = uid();
    const card: WishCard = { ...data, id: `card-${Date.now()}`, createdAt: new Date().toISOString() };
    set((s) => ({ cards: [...s.cards, card] }));
    if (u) setDoc(cardRef(u, card.id), card);
  },

  updateCard: (id, data) => {
    const u = uid();
    set((s) => {
      const cards = s.cards.map((c) => (c.id === id ? { ...c, ...data } : c));
      const card = cards.find((c) => c.id === id);
      if (u && card) setDoc(cardRef(u, id), card);
      return { cards };
    });
  },

  deleteCard: (id) => {
    const u = uid();
    set((s) => ({ cards: s.cards.filter((c) => c.id !== id) }));
    if (u) deleteDoc(cardRef(u, id));
  },

  moveCard: (cardId, toColumnId) => {
    const u = uid();
    set((s) => {
      const cards = s.cards.map((c) => (c.id === cardId ? { ...c, columnId: toColumnId } : c));
      const card = cards.find((c) => c.id === cardId);
      if (u && card) setDoc(cardRef(u, cardId), card);
      return { cards };
    });
  },

  incrementCard: (id, amount) => {
    const u = uid();
    set((s) => {
      const cards = s.cards.map((c) => {
        if (c.id !== id) return c;
        return { ...c, currentAmount: Math.min(c.currentAmount + amount, c.targetAmount) };
      });
      const card = cards.find((c) => c.id === id);
      if (u && card) setDoc(cardRef(u, id), card);
      return { cards };
    });
  },
}));
