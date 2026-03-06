'use client';

import { create } from 'zustand';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface WalletStore {
  currentMoney: number;
  addMoney: (amount: number) => void;
  subtractMoney: (amount: number) => void;
  setMoney: (amount: number) => void;
}

function syncWallet(amount: number) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  setDoc(doc(db, 'users', uid, 'wallet', 'main'), { currentMoney: amount });
}

export const useWalletStore = create<WalletStore>()((set, get) => ({
  currentMoney: 0,

  addMoney: (amount) => {
    const next = get().currentMoney + amount;
    set({ currentMoney: next });
    syncWallet(next);
  },

  subtractMoney: (amount) => {
    const next = Math.max(0, get().currentMoney - amount);
    set({ currentMoney: next });
    syncWallet(next);
  },

  setMoney: (amount) => {
    set({ currentMoney: amount });
    syncWallet(amount);
  },
}));
