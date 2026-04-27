import apiClient from './api.service';

export interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  orderType: 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY';
  totalAmount: number;
  discount: number;
  paymentMethod: 'CASH' | 'TRANSFER';
  createdAt: string;
  tenant?: any;
  table?: any;
  items?: any[];
}

export const orderService = {
  getById: (id: string) => 
    apiClient.get<Order>(`/pos/orders/${id}`) as any,

  create: (data: any) => 
    apiClient.post<Order>('/pos/orders', data) as any,

  cancel: (id: string, reason: string) => 
    apiClient.patch(`/pos/orders/${id}/cancel`, { reason }) as any,
};

export default orderService;
