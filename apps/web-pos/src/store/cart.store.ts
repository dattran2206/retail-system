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

export type OrderType = 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY';

interface CartState {
  items: CartItem[];
  discount: number;
  orderType: OrderType;
  tableId?: string;
  tableName?: string;
  areaName?: string;
  customerName?: string;
  deliveryPartner?: string;
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNote: (id: string, note: string) => void;
  setDiscount: (amount: number) => void;
  setOrderType: (type: OrderType, tableId?: string, tableName?: string, areaName?: string) => void;
  setCustomerInfo: (name?: string, deliveryPartner?: string) => void;
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
  orderType: 'TAKE_AWAY',

  addItem: (item) => set((state) => {
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

  setOrderType: (type, tableId, tableName, areaName) => set({ 
    orderType: type, 
    tableId, 
    tableName,
    areaName,
    // Reset other info if switching
    ...(type !== 'DINE_IN' && { tableId: undefined, tableName: undefined, areaName: undefined }),
  }),

  setCustomerInfo: (name, deliveryPartner) => set({
    customerName: name,
    deliveryPartner: deliveryPartner
  }),

  clearCart: () => set({ 
    items: [], 
    discount: 0, 
    tableId: undefined, 
    tableName: undefined, 
    customerName: undefined, 
    deliveryPartner: undefined 
  }),

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
