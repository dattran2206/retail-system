import { create } from 'zustand';
import { Shift, shiftService } from '@/services/shift.service';

interface ShiftState {
  currentShift: Shift | null;
  isLoading: boolean;
  
  // Actions
  fetchCurrentShift: () => Promise<void>;
  openShift: (openingBalance: number, note?: string) => Promise<void>;
  closeShift: (closingBalance: number, note?: string) => Promise<void>;
  setCurrentShift: (shift: Shift | null) => void;
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  currentShift: null,
  isLoading: false,

  fetchCurrentShift: async () => {
    set({ isLoading: true });
    try {
      const shift = await shiftService.getCurrentShift();
      set({ currentShift: shift, isLoading: false });
    } catch (error) {
      set({ currentShift: null, isLoading: false });
    }
  },

  openShift: async (openingBalance, note) => {
    const shift = await shiftService.openShift({ openingBalance, note });
    set({ currentShift: shift });
  },

  closeShift: async (closingBalance, note) => {
    const { currentShift } = get();
    if (!currentShift) return;
    
    await shiftService.closeShift(currentShift.id, { closingBalance, note });
    set({ currentShift: null });
  },

  setCurrentShift: (shift) => set({ currentShift: shift }),
}));
