import { create } from 'zustand';

export interface CartModifier {
  modifierId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  id: string; // Unique local ID (UUID) for this specific cart item line
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  note?: string;
  modifiers: CartModifier[];
}

interface CartState {
  items: CartItem[];
  discount: number;
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNote: (id: string, note: string) => void;
  setDiscount: (amount: number) => void;
  clearCart: () => void;
  
  // Getters
  getTotalItems: () => number;
  getSubTotal: () => number;
  getTotal: () => number;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,

  addItem: (item) => set((state) => {
    // If exact same variant and modifiers exist, we could merge. 
    // For simplicity in POS, we often just append a new line or merge if identical.
    // Let's implement simple append for now with unique ID
    return {
      items: [...state.items, { ...item, id: generateId() }]
    };
  }),

  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),

  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(i => i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i)
  })),

  updateNote: (id, note) => set((state) => ({
    items: state.items.map(i => i.id === id ? { ...i, note } : i)
  })),

  setDiscount: (amount) => set({ discount: Math.max(0, amount) }),

  clearCart: () => set({ items: [], discount: 0 }),

  getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),

  getSubTotal: () => get().items.reduce((total, item) => {
    const modsTotal = item.modifiers.reduce((sum, mod) => sum + mod.price * mod.quantity, 0);
    return total + (item.price + modsTotal) * item.quantity;
  }, 0),

  getTotal: () => {
    const subTotal = get().getSubTotal();
    return Math.max(0, subTotal - get().discount);
  }
}));
