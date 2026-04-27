'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/cart.store';
import { Trash2, Plus, Minus, XCircle, User, Truck, MapPin, Loader2 } from 'lucide-react';
import apiClient from '@/services/api.service';
import { useShiftStore } from '@/store/shift.store';
import PaymentModal from './PaymentModal';

export default function CartSidebar() {
  const { currentShift } = useShiftStore();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<{ id: string, totalAmount: number } | null>(null);

  const { 
    items, 
    discount, 
    orderType, 
    tableId, 
    tableName, 
    areaName,
    customerName, 
    deliveryPartner,
    removeItem, 
    updateQuantity, 
    getTotal, 
    getSubTotal, 
    clearCart 
  } = useCartStore();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!currentShift) {
      window.alert('Vui lòng mở ca làm việc trước khi thanh toán!');
      return;
    }

    setIsCreatingOrder(true);
    try {
      const orderData = {
        orderType,
        tableId,
        shiftId: currentShift.id,
        customerName,
        deliveryPartner,
        discount,
        paymentMethod: 'CASH',
        items: items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          note: item.note,
          modifiers: item.modifiers.map(m => ({
            modifierId: m.modifierId,
            quantity: m.quantity
          }))
        }))
      };

      const response: any = await apiClient.post('/pos/orders', orderData);
      setCreatedOrder({
        id: response.id,
        totalAmount: response.totalAmount
      });
    } catch (err: any) {
      console.error('Checkout failed', err);
      const errorMsg = err.response?.data?.message || '';
      if (errorMsg.includes('Insufficient stock')) {
        window.alert('Lỗi: Một số sản phẩm trong giỏ hàng đã hết hàng hoặc không đủ tồn kho. Vui lòng kiểm tra lại!');
      } else {
        window.alert('Tạo đơn hàng thất bại, vui lòng thử lại.');
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const getOrderTypeInfo = () => {
    switch (orderType) {
      case 'DINE_IN':
        const dineInLabel = areaName && tableName 
          ? `${areaName} • ${tableName}` 
          : (tableName || 'Chưa chọn bàn');
        return { label: dineInLabel, icon: <MapPin size={16} />, color: 'text-blue-600 bg-blue-50' };
      case 'TAKE_AWAY':
        return { label: customerName || 'Khách mang đi', icon: <User size={16} />, color: 'text-orange-600 bg-orange-50' };
      case 'DELIVERY':
        return { label: deliveryPartner || 'Giao hàng', icon: <Truck size={16} />, color: 'text-green-600 bg-green-50' };
      default:
        return { label: 'Khác', icon: <User size={16} />, color: 'text-gray-600 bg-gray-50' };
    }
  };

  const info = getOrderTypeInfo();

  return (
    <div className="flex flex-col h-full bg-md-sys-color-surface-container-low">
      {/* Header */}
      <div className="p-5 border-b border-md-sys-color-outline-variant flex justify-between items-center bg-md-sys-color-surface-container">
        <div className="flex flex-col">
          <h2 className="font-bold text-xl text-md-sys-color-on-surface">Chi tiết đơn hàng</h2>
          <div className={`mt-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold w-fit ${info.color}`}>
            {info.icon}
            {info.label}
          </div>
        </div>
        <button 
          onClick={clearCart}
          className="p-2.5 text-md-sys-color-error hover:bg-md-sys-color-error/10 rounded-full transition-all"
          title="Xoá giỏ hàng"
        >
          <Trash2 size={22} />
        </button>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
            <XCircle size={80} strokeWidth={1} />
            <p className="mt-4 font-medium text-lg">Giỏ hàng trống</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex flex-col p-4 rounded-md3-large bg-md-sys-color-surface shadow-sm border border-md-sys-color-outline-variant/30 hover:border-md-sys-color-primary/30 transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-bold text-md-sys-color-on-surface leading-tight">{item.productName}</h4>
                  <p className="text-xs text-md-sys-color-on-surface-variant font-medium mt-0.5">{item.variantName}</p>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-md-sys-color-on-surface-variant hover:text-md-sys-color-error transition-colors ml-2">
                  <XCircle size={18} />
                </button>
              </div>

              {/* Modifiers List */}
              {item.modifiers.length > 0 && (
                <div className="mt-2 space-y-1">
                  {item.modifiers.map((m, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-md-sys-color-secondary font-medium">
                      <span>• {m.name} {m.quantity > 1 ? `x${m.quantity}` : ''}</span>
                      {m.price > 0 && <span>+{(m.price * m.quantity).toLocaleString()}đ</span>}
                    </div>
                  ))}
                </div>
              )}

              {item.note && (
                <div className="mt-2 text-[10px] bg-md-sys-color-secondary-container/30 p-1.5 rounded italic text-md-sys-color-on-secondary-container">
                  Ghi chú: {item.note}
                </div>
              )}

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-md-sys-color-outline-variant/10">
                <div className="flex items-center gap-1 bg-md-sys-color-surface-container-high rounded-full p-0.5 border border-md-sys-color-outline-variant/30">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-md-sys-color-surface rounded-full transition-colors text-md-sys-color-primary">
                    <Minus size={14} strokeWidth={3} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-md-sys-color-on-surface">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-md-sys-color-surface rounded-full transition-colors text-md-sys-color-primary">
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>
                <div className="flex flex-col items-end">
                    <span className="font-bold text-md-sys-color-primary text-lg">
                      {( (item.price + item.modifiers.reduce((s,m)=>s+m.price*m.quantity, 0)) * item.quantity).toLocaleString('vi-VN')}đ
                    </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary & Checkout */}
      <div className="p-6 border-t-2 border-md-sys-color-outline-variant bg-md-sys-color-surface-container shadow-md3-up-1">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-md-sys-color-on-surface-variant">Tạm tính ({items.reduce((s,i)=>s+i.quantity,0)} món)</span>
            <span className="text-md-sys-color-on-surface">{getSubTotal().toLocaleString('vi-VN')}đ</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm font-medium text-md-sys-color-error">
              <span>Giảm giá</span>
              <span>-{discount.toLocaleString('vi-VN')}đ</span>
            </div>
          )}
          <div className="flex justify-between items-end pt-2">
            <span className="text-md-sys-color-on-surface font-bold">Tổng cộng</span>
            <div className="flex flex-col items-end">
                <span className="text-3xl font-black text-md-sys-color-primary tracking-tighter">
                  {getTotal().toLocaleString('vi-VN')}đ
                </span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={items.length === 0 || isCreatingOrder}
          className="w-full py-5 rounded-[28px] bg-md-sys-color-primary text-md-sys-color-on-primary text-lg font-bold shadow-md3-2 hover:shadow-md3-3 hover:translate-y-[-2px] active:translate-y-[0px] active:scale-[0.98] transition-all disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none uppercase tracking-wider flex items-center justify-center gap-2"
        >
          {isCreatingOrder ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Đang tạo đơn...
            </>
          ) : 'Xác nhận Thanh toán'}
        </button>
      </div>

      {/* Payment Modal */}
      {createdOrder && (
        <PaymentModal
          orderId={createdOrder.id}
          totalAmount={createdOrder.totalAmount}
          onSuccess={() => {
            setCreatedOrder(null);
          }}
          onClose={() => setCreatedOrder(null)}
        />
      )}
    </div>
  );
}
