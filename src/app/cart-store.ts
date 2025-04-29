import create from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cart item type
 */
export type CartItemType = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  heroImage: string;
};

/**
 * Cart store state and actions
 */
interface CartState {
  items: CartItemType[];
  addItem: (item: CartItemType) => void;
  removeItem: (id: number) => void;
  decrementItem: (id: number) => void;
  incrementItem: (id: number) => void;
  getTotalPrice: () => string;
  getItemCount: () => number;
  resetCart: () => void;
  getExpandedItems: () => { productId: number; price: number; quantity: 1 }[];
}

/**
 * Initial empty cart
 */
const InitialCartItems: CartItemType[] = [];

/**
 * Persisted cart store using Zustand
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: InitialCartItems,

      addItem: (item: CartItemType) => {
        const exists = get().items.find((i) => i.id === item.id);
        if (exists) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, 99) }
                : i
            ),
          }));
        } else {
          set((state) => ({ items: [...state.items, item] }));
        }
      },

      removeItem: (id: number) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

      incrementItem: (id: number) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === id
                ? { ...item, quantity: Math.min(item.quantity + 1, 99) }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

        decrementItem: (id: number) =>
            set((state) => ({
              items: state.items
                .map((item) =>
                  item.id === id && item.quantity > 0
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
                )
                .filter((item) => item.quantity > 0),
            })),
          

      getTotalPrice: () =>
        get()
          .items.reduce((total, item) => total + item.price * item.quantity, 0)
          .toFixed(2),

      getItemCount: () =>
        get().items.reduce((count, item) => count + item.quantity, 0),

      resetCart: () => set({ items: InitialCartItems }),

      getExpandedItems: () =>
        get().items.flatMap((item) =>
          Array(item.quantity).fill({
            productId: item.id,
            price: item.price,
            quantity: 1,
          })
        ),
    }),
    {
      name: 'cart-storage',
      getStorage: () => AsyncStorage,
      partialize: (state) => ({ items: state.items }),
      /**
       * Lifecycle callback: logs rehydration results
       */
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('💥 Rehydrate failed:', error);
        } else {
          console.log('✅ Store rehydrated with:', state);
        }
      },
    }
  )
);