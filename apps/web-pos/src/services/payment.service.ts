import apiClient from './api.service';

export interface Payment {
  id: string;
  orderId: string;
  method: 'CASH' | 'TRANSFER';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  checkoutUrl?: string;
}

export const paymentService = {
  payWithCash: (orderId: string, shiftId: string) => 
    apiClient.post<{ success: boolean }>('/pos/payments/cash', { orderId, shiftId }) as any,

  createTransfer: (orderId: string, shiftId: string) => 
    apiClient.post<Payment>('/pos/payments/transfer', { orderId, shiftId }) as any,

  getStatus: (paymentId: string) => 
    apiClient.get<{ status: string }>(`/pos/payments/${paymentId}/status`) as any,
};

export default paymentService;
