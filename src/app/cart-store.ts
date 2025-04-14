import { create } from 'zustand';

type CartItemType = {
    id: number;
    title: string;
    price: number;
    quantity: number;
    heroImage: string;
};

type CartState = {
    items: CartItemType[];
    addItem: (item: CartItemType) => void;
    removeItem: (id: number) => void;
    decrementItem: (id: number) => void;
    incrementItem: (id: number) => void;
    getTotalPrice: () => string;
    getItemCount: () => number;
    resetCart: () => void;
    getExpandedItems: () => { productId: number, price: number, quantity: 1 }[]; // New method to expand cart items for backend
};

const InitialCartItems: CartItemType[] = [];

export const useCartStore = create<CartState>((set, get) => ({

    items: InitialCartItems,

    // Add item to the cart
    addItem: (item: CartItemType) => {
        const existingItem = get().items.find((i) => i.id === item.id);
        if (existingItem) {
            set((state) => ({
                items: state.items.map((i) =>
                    i.id === item.id
                        ? { ...i, quantity: Math.min(i.quantity + item.quantity, 99) } // Make sure quantity does not exceed 99
                        : i
                ),
            }));
        } else {
            set((state) => ({ items: [...state.items, item] }));
        }
    },

    // Remove item from the cart
    removeItem: (id: number) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

    // Increment item quantity
    incrementItem: (id: number) => {
        set((state) => ({
            items: state.items.map(item =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            ),
        }));
    },

    // Decrement item quantity
    decrementItem: (id: number) =>
        set((state) => ({
            items: state.items.map(item =>
                item.id === id && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            ),
        })),

    // Get total price of all items in the cart
    getTotalPrice: () => {
        const { items } = get();
        return items
            .reduce((total, item) => total + item.price * item.quantity, 0)
            .toFixed(2);
    },

    // Get total item count
    getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
    },

    // Reset the cart to empty
    resetCart: () => set({ items: InitialCartItems }),

    // New method to get all items expanded to individual order items for backend
    getExpandedItems: () => {
        const { items } = get();
        return items.flatMap(item =>
            Array(item.quantity).fill({
                productId: item.id, // Product ID
                price: item.price,   // Price per unit
                quantity: 1          // Each unit as a separate entry with quantity 1
            })
        );
    },
}));
