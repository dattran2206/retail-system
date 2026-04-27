import apiClient from './api.service';

export interface Shift {
  id: string;
  userId: string;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  cashRevenue: number;
  transferRevenue: number;
  totalOrders: number;
}

export const shiftService = {
  getCurrentShift: () => apiClient.get<Shift>('/pos/shifts/current') as any,
  
  openShift: (data: { openingBalance: number, note?: string }) => 
    apiClient.post<Shift>('/pos/shifts/open', data) as any,
    
  closeShift: (id: string, data: { closingBalance: number, note?: string }) => 
    apiClient.patch<Shift>(`/pos/shifts/${id}/close`, data) as any,
    
  getHistory: (page = 1, limit = 10) => 
    apiClient.get(`/pos/shifts?page=${page}&limit=${limit}`) as any,
};

export default shiftService;
