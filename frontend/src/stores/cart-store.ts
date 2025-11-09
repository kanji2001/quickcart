import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartUiState = {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

export const useCartStore = create<CartUiState>()(
  persist(
    (set) => ({
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'cart-ui',
    },
  ),
);
