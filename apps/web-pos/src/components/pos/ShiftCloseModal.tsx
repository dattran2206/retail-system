'use client';

import React, { useState } from 'react';
import { useShiftStore } from '@/store/shift.store';
import { Power, Calculator, AlertCircle, TrendingUp, CreditCard, Banknote } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function ShiftCloseModal({ onClose }: Props) {
  const { currentShift, closeShift } = useShiftStore();
  const [closingBalance, setClosingBalance] = useState<number>(0);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!currentShift) return null;

  const expectedCash = Number(currentShift.openingBalance || 0) + Number(currentShift.cashRevenue || 0);
  const difference = closingBalance - expectedCash;

  const handleCloseShift = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await closeShift(closingBalance, note);
      onClose();
      window.alert('Ca làm việc đã được chốt thành công!');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi chốt ca.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="bg-md-sys-color-surface w-full max-w-2xl rounded-md3-extra-large shadow-md3-5 overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="p-6 border-b border-md-sys-color-outline-variant flex justify-between items-center bg-md-sys-color-surface-container">
          <div>
            <h2 className="text-xl font-black text-md-sys-color-on-surface uppercase tracking-tight">Kết thúc ca làm việc</h2>
            <p className="text-sm text-md-sys-color-on-surface-variant font-medium">Đối soát doanh thu & Bàn giao ca</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-md-sys-color-surface-variant rounded-full transition-colors">
             <Power size={20} className="text-md-sys-color-error" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side: Stats */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-md-sys-color-primary uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={16} /> Thống kê sổ sách
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 rounded-2xl bg-md-sys-color-surface-container-high border border-md-sys-color-outline-variant/30">
                <div className="flex items-center gap-3 text-md-sys-color-on-surface-variant mb-1">
                  <Banknote size={18} />
                  <span className="text-xs font-bold uppercase tracking-wide">Tiền mặt đầu ca</span>
                </div>
                <p className="text-xl font-black">{Number(currentShift.openingBalance || 0).toLocaleString()}đ</p>
              </div>

              <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                <div className="flex items-center gap-3 text-green-700 mb-1">
                  <Banknote size={18} />
                  <span className="text-xs font-bold uppercase tracking-wide">Doanh thu tiền mặt</span>
                </div>
                <p className="text-xl font-black text-green-800">+{Number(currentShift.cashRevenue || 0).toLocaleString()}đ</p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-3 text-blue-700 mb-1">
                  <CreditCard size={18} />
                  <span className="text-xs font-bold uppercase tracking-wide">Chuyển khoản (Stripe)</span>
                </div>
                <p className="text-xl font-black text-blue-800">+{Number(currentShift.transferRevenue || 0).toLocaleString()}đ</p>
              </div>

              <div className="p-4 rounded-2xl bg-md-sys-color-primary/10 border border-md-sys-color-primary/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-md-sys-color-primary uppercase tracking-wide">Tổng tiền mặt kỳ vọng</span>
                  <span className="px-2 py-0.5 rounded-full bg-md-sys-color-primary text-white text-[10px] font-bold">{(currentShift.totalOrders || 0)} ĐƠN</span>
                </div>
                <p className="text-2xl font-black text-md-sys-color-primary">{expectedCash.toLocaleString()}đ</p>
              </div>
            </div>
          </div>

          {/* Right Side: Reconciliation */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-md-sys-color-secondary uppercase tracking-wider flex items-center gap-2">
              <Calculator size={16} /> Đối soát thực tế
            </h3>

            {error && (
              <div className="p-3 rounded-lg bg-md-sys-color-error/10 text-md-sys-color-error text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-md-sys-color-on-surface-variant uppercase tracking-widest mb-2">
                  Tiền mặt thực đếm cuối ca
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    value={closingBalance}
                    onChange={(e) => setClosingBalance(Number(e.target.value))}
                    placeholder="Nhập số tiền..."
                    className="w-full pl-5 pr-12 py-4 bg-md-sys-color-surface-container-high border-2 border-md-sys-color-outline-variant rounded-2xl text-xl font-black text-md-sys-color-on-surface focus:border-md-sys-color-primary outline-none transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-black text-md-sys-color-on-surface-variant/30 group-focus-within:text-md-sys-color-primary/50 transition-colors pointer-events-none">
                    đ
                  </div>
                </div>
              </div>

              {/* Difference Display */}
              <div className={`p-4 rounded-2xl border-2 flex justify-between items-center ${
                difference === 0 ? 'bg-gray-50 border-gray-200' :
                difference > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <span className="text-xs font-bold uppercase tracking-tight">Chênh lệch:</span>
                <span className={`text-lg font-black ${
                  difference === 0 ? 'text-gray-600' :
                  difference > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {difference > 0 ? '+' : ''}{difference.toLocaleString()}đ
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-md-sys-color-on-surface-variant uppercase tracking-widest mb-2">
                  Ghi chú chốt ca
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Lý do chênh lệch (nếu có)..."
                  rows={2}
                  className="w-full px-4 py-3 bg-md-sys-color-surface-container border border-md-sys-color-outline-variant rounded-xl text-sm focus:border-md-sys-color-primary outline-none transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleCloseShift}
              disabled={isSubmitting}
              className="w-full py-4 bg-md-sys-color-error text-white rounded-[28px] text-base font-black shadow-md3-2 hover:shadow-md3-3 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Power size={18} />
              {isSubmitting ? 'Đang chốt ca...' : 'Xác nhận chốt ca'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
