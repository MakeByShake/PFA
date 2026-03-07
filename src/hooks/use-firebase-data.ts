'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc, collection, onSnapshot, getDoc,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { useWalletStore } from '@/stores/wallet-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useIncomeStore } from '@/stores/income-store';
import { useDebtsStore } from '@/stores/debts-store';
import { useHistoryStore } from '@/stores/history-store';
import { useGoalsStore } from '@/stores/goals-store';
import type { AppUser } from '@/lib/types';
import type { Goal } from '@/features/goals/types';

// Converts Firestore goal data (serialized dates) back to Goal with Date objects
function hydrateGoal(data: Record<string, unknown>): Goal {
  const g = data as unknown as Goal;
  const toDate = (v: unknown): Date => {
    if (v instanceof Date) return v;
    if (v && typeof (v as any).toDate === 'function') return (v as any).toDate();
    if (typeof v === 'string') return new Date(v);
    return new Date();
  };
  return {
    ...g,
    periodStart: toDate(g.periodStart),
    periodEnd: toDate(g.periodEnd),
    lastResetAt: toDate(g.lastResetAt),
    createdAt: toDate(g.createdAt),
    updatedAt: toDate(g.updatedAt),
  };
}

export function useFirebaseData() {
  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Unsubscribe previous data listeners
      unsubscribers.forEach((u) => u());
      unsubscribers.length = 0;

      if (!firebaseUser) {
        // Clear all stores on logout
        useAuthStore.getState().setCurrentUser(null);
        useWalletStore.getState().setMoney(0);
        useWishlistStore.getState().setColumns([]);
        useWishlistStore.getState().setCards([]);
        useIncomeStore.getState().setIncomeSources([]);
        useIncomeStore.getState().setExpenseItems([]);
        useDebtsStore.getState().setDebts([]);
        useHistoryStore.getState().setTransactions([]);
        useGoalsStore.getState().setGoals([]);
        return;
      }

      const uid = firebaseUser.uid;

      // Load user profile
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (!snap.exists()) {
          useAuthStore.getState().setIsLoading(false);
          return;
        }
        const userData = snap.data() as AppUser;
        if ((userData as any).deleted) {
          useAuthStore.getState().setIsLoading(false);
          return;
        }
        useAuthStore.getState().setCurrentUser(userData);
      } catch {
        useAuthStore.getState().setIsLoading(false);
        return;
      }

      // ─── Real-time listeners ──────────────────────────────────────────────

      // Wallet
      unsubscribers.push(
        onSnapshot(doc(db, 'users', uid, 'wallet', 'main'), (snap) => {
          if (snap.exists()) {
            useWalletStore.getState().setMoney(snap.data().currentMoney ?? 0);
          }
        })
      );

      // Wishlist columns
      unsubscribers.push(
        onSnapshot(collection(db, 'users', uid, 'wishlist_columns'), (snap) => {
          const cols = snap.docs.map((d) => d.data() as import('@/lib/types').WishColumn);
          useWishlistStore.getState().setColumns(cols);
        })
      );

      // Wishlist cards
      unsubscribers.push(
        onSnapshot(collection(db, 'users', uid, 'wishlist_cards'), (snap) => {
          const cards = snap.docs.map((d) => d.data() as import('@/lib/types').WishCard);
          useWishlistStore.getState().setCards(cards);
        })
      );

      // Income sources
      unsubscribers.push(
        onSnapshot(collection(db, 'users', uid, 'income_sources'), (snap) => {
          const sources = snap.docs.map((d) => d.data() as import('@/lib/types').IncomeSource);
          useIncomeStore.getState().setIncomeSources(sources);
        })
      );

      // Expense items
      unsubscribers.push(
        onSnapshot(collection(db, 'users', uid, 'expense_items'), (snap) => {
          const items = snap.docs.map((d) => d.data() as import('@/lib/types').ExpenseItem);
          useIncomeStore.getState().setExpenseItems(items);
        })
      );

      // Debts
      unsubscribers.push(
        onSnapshot(collection(db, 'users', uid, 'debts'), (snap) => {
          const debts = snap.docs.map((d) => d.data() as import('@/lib/types').Debt);
          useDebtsStore.getState().setDebts(debts);
        })
      );

      // Transaction history
      unsubscribers.push(
        onSnapshot(collection(db, 'users', uid, 'transactions'), (snap) => {
          const txs = snap.docs
            .map((d) => d.data() as import('@/lib/types').Transaction)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          useHistoryStore.getState().setTransactions(txs);
        })
      );

      // Goals
      unsubscribers.push(
        onSnapshot(collection(db, 'users', uid, 'goals'), (snap) => {
          const goals = snap.docs.map((d) => hydrateGoal(d.data() as Record<string, unknown>));
          useGoalsStore.getState().setGoals(goals);
        })
      );
    });

    return () => {
      unsubAuth();
      unsubscribers.forEach((u) => u());
    };
  }, []);
}
