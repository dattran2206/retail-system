'use client';

import React, { useState, useEffect, useRef } from 'react';
import { paymentService, Payment } from '@/services/payment.service';
import { useShiftStore } from '@/store/shift.store';
import { useCartStore } from '@/store/cart.store';
import { X, Banknote, CreditCard, CheckCircle, AlertCircle, RefreshCw, Loader2, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { orderService, Order } from '@/services/order.service';
import ReceiptTemplate from './ReceiptTemplate';

interface Props {
  orderId: string;
  totalAmount: number;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PaymentModal({ orderId, totalAmount, onSuccess, onClose }: Props) {
  const { currentShift } = useShiftStore();
  const { clearCart } = useCartStore();
  const [method, setMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [cashReceived, setCashReceived] = useState<number>(totalAmount);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [transferPayment, setTransferPayment] = useState<Payment | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fullOrder, setFullOrder] = useState<Order | null>(null);
  
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });
  
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Formatter chuẩn tiếng Việt
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Dọn dẹp polling khi unmount
  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  const handleCashPayment = async () => {
    if (!currentShift) return;
    setIsProcessing(true);
    setError('');
    try {
      await paymentService.payWithCash(orderId, currentShift.id);
      
      // Lấy thông tin đơn hàng đầy đủ để in
      const order = await orderService.getById(orderId);
      setFullOrder(order);
      
      setIsSuccess(true);
      
      // Tự động kích hoạt in sau khi dữ liệu đã sẵn sàng
      setTimeout(() => {
        handlePrint();
      }, 500);

      setTimeout(() => {
        clearCart();
        window.dispatchEvent(new CustomEvent('refresh-menu'));
        onSuccess();
      }, 5000); // Tăng thời gian delay để kịp in
    } catch (err: any) {
      setError(err.message || 'Lỗi khi thanh toán tiền mặt');
      setIsProcessing(false);
    }
  };

  const handleTransferInit = async () => {
    if (!currentShift) return;
    setIsProcessing(true);
    setError('');
    try {
      const payment = await paymentService.createTransfer(orderId, currentShift.id);
      setTransferPayment(payment);
      startPolling(payment.id);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo link thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  const startPolling = (paymentId: string) => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    
    pollingInterval.current = setInterval(async () => {
      try {
        const { status } = await paymentService.getStatus(paymentId);
        if (status === 'COMPLETED') {
          if (pollingInterval.current) clearInterval(pollingInterval.current);
          
          // Lấy thông tin đơn hàng đầy đủ để in
          const order = await orderService.getById(orderId);
          setFullOrder(order);
          
          setIsSuccess(true);
          
          // Tự động kích hoạt in
          setTimeout(() => {
            handlePrint();
          }, 500);

          setTimeout(() => {
            clearCart();
            window.dispatchEvent(new CustomEvent('refresh-menu'));
            onSuccess();
          }, 5000);
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 2500); // 2.5s check một lần
  };

  const change = Math.max(0, cashReceived - totalAmount);

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        <div className="bg-md-sys-color-surface w-full max-w-sm rounded-md3-extra-large p-8 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-2xl font-black text-md-sys-color-on-surface mb-2">Thanh toán xong!</h2>
          <p className="text-md-sys-color-on-surface-variant font-medium mb-6">Đơn hàng đang được hoàn tất...</p>
          
          <button 
            onClick={() => handlePrint()}
            className="w-full py-4 bg-md-sys-color-primary-container text-md-sys-color-on-primary-container rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-md-sys-color-primary hover:text-white transition-all mb-4"
          >
            <Printer size={20} />
            In lại hóa đơn
          </button>

          <button 
            onClick={() => {
              clearCart();
              window.dispatchEvent(new CustomEvent('refresh-menu'));
              onSuccess();
            }}
            className="w-full py-4 border-2 border-md-sys-color-outline-variant text-md-sys-color-on-surface-variant rounded-2xl font-bold"
          >
            Đóng
          </button>

          {/* Hidden receipt for printing */}
          <div className="absolute opacity-0 pointer-events-none -z-50">
            <ReceiptTemplate ref={componentRef} order={fullOrder} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-md-sys-color-surface w-full max-w-4xl rounded-md3-extra-large shadow-md3-5 overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Sidebar Info */}
        <div className="w-full md:w-80 bg-md-sys-color-surface-container-high p-8 border-r border-md-sys-color-outline-variant flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-xl font-black uppercase tracking-tight">Thanh toán</h2>
            <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full md:hidden">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            <div className="p-4 rounded-2xl bg-md-sys-color-primary text-md-sys-color-on-primary shadow-md3-2">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Tổng tiền cần thu</span>
              <p className="text-3xl font-black">{formatMoney(totalAmount)}đ</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setMethod('CASH')}
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                  method === 'CASH' ? 'border-md-sys-color-primary bg-md-sys-color-primary/5' : 'border-transparent hover:bg-black/5'
                }`}
              >
                <div className={`p-3 rounded-xl ${method === 'CASH' ? 'bg-md-sys-color-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <Banknote size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-sm uppercase">Tiền mặt</p>
                  <p className="text-[10px] font-bold opacity-60">Trả trực tiếp cho thu ngân</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setMethod('TRANSFER');
                  if (!transferPayment) handleTransferInit();
                }}
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                  method === 'TRANSFER' ? 'border-md-sys-color-primary bg-md-sys-color-primary/5' : 'border-transparent hover:bg-black/5'
                }`}
              >
                <div className={`p-3 rounded-xl ${method === 'TRANSFER' ? 'bg-md-sys-color-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <CreditCard size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-sm uppercase">Chuyển khoản / QR</p>
                  <p className="text-[10px] font-bold opacity-60">Thanh toán qua Stripe (QR/Link)</p>
                </div>
              </button>
            </div>
          </div>

          <button onClick={onClose} className="mt-8 text-sm font-bold text-md-sys-color-on-surface-variant hover:text-md-sys-color-primary flex items-center gap-2 transition-colors">
            <X size={16} /> Hủy bỏ giao dịch
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-md-sys-color-surface p-8 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-md-sys-color-error/10 text-md-sys-color-error border border-md-sys-color-error/20 flex items-center gap-3 font-bold text-sm">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {method === 'CASH' ? (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-md-sys-color-on-surface-variant mb-3">
                    Số tiền khách đưa
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      value={cashReceived ? formatMoney(cashReceived) : ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\./g, '');
                        if (!isNaN(Number(val))) {
                          setCashReceived(Number(val));
                        }
                      }}
                      className="w-full px-8 py-6 bg-md-sys-color-surface-container-high border-2 border-md-sys-color-outline-variant rounded-[32px] text-4xl font-black focus:border-md-sys-color-primary outline-none transition-all pr-16"
                      placeholder="0"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xl font-bold opacity-40 text-md-sys-color-on-surface">đ</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[totalAmount, 50000, 100000, 200000, 500000].map(val => (
                    <button
                      key={val}
                      onClick={() => setCashReceived(val)}
                      className="py-3 rounded-xl border border-md-sys-color-outline-variant font-bold text-xs hover:bg-md-sys-color-primary hover:text-white transition-all"
                    >
                      {formatMoney(val)}đ
                    </button>
                  ))}
                  <button onClick={() => setCashReceived(0)} className="py-3 rounded-xl border border-md-sys-color-outline-variant font-bold text-xs hover:bg-md-sys-color-error hover:text-white">Xóa</button>
                </div>

                <div className="p-8 rounded-[32px] bg-md-sys-color-surface-container-lowest border-2 border-dashed border-md-sys-color-outline-variant flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Tiền thừa trả khách</span>
                    <p className={`text-4xl font-black ${change > 0 ? 'text-green-600' : 'text-md-sys-color-on-surface'}`}>
                      {formatMoney(change)}đ
                    </p>
                  </div>
                  <div className={`p-4 rounded-full ${change > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <CheckCircle size={32} />
                  </div>
                </div>
              </div>

              <button
                disabled={isProcessing || cashReceived < totalAmount}
                onClick={handleCashPayment}
                className="w-full py-6 bg-md-sys-color-primary text-white rounded-[32px] text-xl font-black shadow-md3-3 hover:translate-y-[-2px] active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0"
              >
                {isProcessing ? 'Đang xử lý...' : 'Xác nhận & In hóa đơn'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-right-4 duration-300 h-full py-8">
              {!transferPayment ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-md-sys-color-primary" size={48} />
                  <p className="font-bold text-md-sys-color-on-surface-variant">Đang khởi tạo mã QR...</p>
                </div>
              ) : (
                <>
                  <div className="bg-white p-6 rounded-[40px] shadow-md3-4 border border-gray-100 relative group">
                    <QRCodeSVG 
                      value={transferPayment.checkoutUrl || ''} 
                      size={280}
                      level="H"
                      includeMargin={true}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/80 transition-opacity rounded-[40px] pointer-events-none">
                       <RefreshCw className="animate-spin text-md-sys-color-primary" size={32} />
                    </div>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-md-sys-color-primary/10 text-md-sys-color-primary rounded-full font-black text-xs uppercase tracking-widest animate-pulse">
                      <Loader2 size={14} className="animate-spin" />
                      Đang chờ quét mã...
                    </div>
                    <p className="text-sm text-md-sys-color-on-surface-variant font-medium max-w-xs mx-auto">
                      Vui lòng quét mã QR để mở trang thanh toán Stripe và hoàn tất giao dịch.
                    </p>
                    <a 
                      href={transferPayment.checkoutUrl} 
                      target="_blank" 
                      className="text-xs text-md-sys-color-primary font-bold underline mt-2 block"
                    >
                      Mở trang thanh toán (Link dự phòng)
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <div className="p-4 rounded-2xl bg-md-sys-color-surface-container text-center">
                      <span className="text-[10px] font-bold uppercase opacity-60">Số tiền</span>
                      <p className="font-black">{formatMoney(totalAmount)}đ</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-md-sys-color-surface-container text-center">
                      <span className="text-[10px] font-bold uppercase opacity-60">Nội dung</span>
                      <p className="font-black text-xs truncate">POS {orderId.slice(0, 8)}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
