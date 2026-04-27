'use client';

import React, { useState } from 'react';
import { useShiftStore } from '@/store/shift.store';
import { Landmark, Play, AlertCircle } from 'lucide-react';

export default function ShiftOpenModal() {
  const { openShift } = useShiftStore();
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await openShift(openingBalance, note);
    } catch (err: any) {
      setError(err.message || 'Không thể mở ca, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = [0, 100000, 200000, 500000, 1000000];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="bg-md-sys-color-surface w-full max-w-md rounded-md3-extra-large shadow-md3-5 overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="p-8 bg-md-sys-color-primary text-md-sys-color-on-primary text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Landmark size={32} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Mở ca làm việc</h2>
          <p className="mt-2 text-md-sys-color-on-primary/80 font-medium">Chào mừng bạn! Vui lòng khai báo tiền đầu ca.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-md-sys-color-error/10 text-md-sys-color-error text-sm font-medium">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-sm font-bold text-md-sys-color-on-surface-variant uppercase tracking-wider">
              Số tiền mặt đầu ca (VNĐ)
            </label>
            <div className="relative group">
              <input
                type="number"
                required
                value={openingBalance}
                onChange={(e) => setOpeningBalance(Number(e.target.value))}
                placeholder="Nhập số tiền..."
                className="w-full pl-6 pr-12 py-5 bg-md-sys-color-surface-container-high border-2 border-md-sys-color-outline-variant rounded-2xl text-2xl font-black text-md-sys-color-primary focus:border-md-sys-color-primary focus:ring-0 transition-all outline-none"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-black text-md-sys-color-on-surface-variant/30 group-focus-within:text-md-sys-color-primary/50 transition-colors pointer-events-none">
                đ
              </div>
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map(amount => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setOpeningBalance(amount)}
                  className="py-2 text-xs font-bold rounded-lg border border-md-sys-color-outline-variant hover:bg-md-sys-color-primary hover:text-white hover:border-md-sys-color-primary transition-all"
                >
                  {amount.toLocaleString()}đ
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-md-sys-color-on-surface-variant uppercase tracking-wider">
              Ghi chú (Không bắt buộc)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Ca sáng, bàn giao từ ca đêm..."
              rows={2}
              className="w-full px-4 py-3 bg-md-sys-color-surface-container border border-md-sys-color-outline-variant rounded-xl text-sm focus:border-md-sys-color-primary transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-md-sys-color-primary text-md-sys-color-on-primary rounded-[28px] text-lg font-black shadow-md3-2 hover:shadow-md3-3 hover:translate-y-[-2px] active:translate-y-0 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
          >
            {isSubmitting ? 'Đang xử lý...' : (
              <>
                <Play size={20} fill="currentColor" />
                Bắt đầu làm việc
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
