'use client';

import React from 'react';
import { useCartStore } from '@/store/cart.store';
import { Trash2, Plus, Minus, XCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';
const TENANT_ID = 'demo';

export default function CartSidebar() {
  const { items, discount, removeItem, updateQuantity, getTotal, getSubTotal, clearCart } = useCartStore();

  const handleCheckout = async () => {
    if (items.length === 0) return;

    try {
      // Chuẩn bị data cho API Order
      const orderData = {
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

      await axios.post(`${API_URL}/pos/orders`, orderData, {
        headers: { 'X-Tenant-ID': TENANT_ID }
      });

      window.alert('Thanh toán thành công!');
      clearCart();
    } catch (err) {
      console.error('Checkout failed', err);
      window.alert('Thanh toán thất bại, vui lòng thử lại.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-md-sys-color-surface border-l border-md-sys-color-outline-variant shadow-md3-2">
      {/* Header */}
      <div className="p-4 border-b border-md-sys-color-outline-variant flex justify-between items-center bg-md-sys-color-surface-variant">
        <h2 className="font-bold text-lg text-md-sys-color-on-surface">Giỏ hàng</h2>
        <button 
          onClick={clearCart}
          className="p-2 text-md-sys-color-error hover:bg-red-50 rounded-full transition-colors"
          title="Xoá giỏ hàng"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <XCircle size={48} className="mb-2" />
            <p>Chưa có món nào</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex flex-col p-3 rounded-md3-medium bg-md-sys-color-surface-variant/30 border border-md-sys-color-outline-variant/20">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-md-sys-color-on-surface">{item.productName}</h4>
                  <p className="text-xs text-md-sys-color-on-surface-variant">{item.variantName}</p>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500">
                  <XCircle size={16} />
                </button>
              </div>

              {/* Modifiers List */}
              {item.modifiers.length > 0 && (
                <div className="mt-1 ml-2 border-l-2 border-md-sys-color-outline-variant pl-2">
                  {item.modifiers.map((m, idx) => (
                    <p key={idx} className="text-xs text-md-sys-color-secondary italic">
                      + {m.name} ({m.quantity})
                    </p>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center mt-3">
                <div className="flex items-center gap-2 bg-md-sys-color-surface rounded-full border border-md-sys-color-outline-variant px-2 py-1">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-100 rounded-full">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-100 rounded-full">
                    <Plus size={14} />
                  </button>
                </div>
                <span className="font-bold text-md-sys-color-primary">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary & Checkout */}
      <div className="p-4 border-t border-md-sys-color-outline-variant bg-md-sys-color-surface shadow-md3-3">
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-md-sys-color-on-surface-variant">Tạm tính</span>
            <span className="font-medium">{getSubTotal().toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between text-md-sys-color-error">
            <span>Giảm giá</span>
            <span>-{discount.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-2 border-t border-dashed border-md-sys-color-outline-variant text-md-sys-color-primary">
            <span>Tổng cộng</span>
            <span>{getTotal().toLocaleString('vi-VN')}đ</span>
          </div>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={items.length === 0}
          className="w-full py-4 rounded-[24px] bg-md-sys-color-primary text-md-sys-color-on-primary font-bold shadow-md3-2 hover:shadow-md3-3 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
        >
          THANH TOÁN (CASH)
        </button>
      </div>
    </div>
  );
}
