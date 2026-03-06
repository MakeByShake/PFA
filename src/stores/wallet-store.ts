'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletStore {
  currentMoney: number;
  addMoney: (amount: number) => void;
  subtractMoney: (amount: number) => void;
  setMoney: (amount: number) => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      currentMoney: 0,
      addMoney: (amount) => set((s) => ({ currentMoney: s.currentMoney + amount })),
      subtractMoney: (amount) => set((s) => ({ currentMoney: Math.max(0, s.currentMoney - amount) })),
      setMoney: (amount) => set({ currentMoney: amount }),
    }),
    { name: 'pfa-wallet' }
  )
);
