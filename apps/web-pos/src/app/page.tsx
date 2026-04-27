'use client';

import React, { useState, useEffect } from 'react';
import MenuGrid from '@/components/pos/MenuGrid';
import CartSidebar from '@/components/pos/CartSidebar';
import TableSelector from '@/components/pos/TableSelector';
import { useCartStore, OrderType } from '@/store/cart.store';
import { authService } from '@/services/auth.service';
import clsx from 'clsx';
import { LogOut, User as UserIcon, Power } from 'lucide-react';
import { useShiftStore } from '@/store/shift.store';
import ShiftOpenModal from '@/components/pos/ShiftOpenModal';
import ShiftCloseModal from '@/components/pos/ShiftCloseModal';

export default function PosPage() {
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [showShiftCloseModal, setShowShiftCloseModal] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const { orderType, tableId, tableName, areaName, setOrderType } = useCartStore();
  const { currentShift, fetchCurrentShift, isLoading: isShiftLoading } = useShiftStore();

  // 1. Kiểm tra đăng nhập
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      window.location.href = '/auth/login';
    } else {
      setIsAuthChecking(false);
    }
  }, []);

  // 2. Kiểm tra ca làm việc sau khi đã login
  useEffect(() => {
    if (!isAuthChecking) {
      fetchCurrentShift();
    }
  }, [isAuthChecking]);

  // 3. Mở TableSelector khi lần đầu vào trang để chọn hình thức phục vụ
  useEffect(() => {
    if (!isAuthChecking && currentShift) {
      if (!tableId && orderType === 'DINE_IN') {
        setShowTableSelector(true);
      }
    }
  }, [isAuthChecking, currentShift]);

  const handleTableSelect = (type: OrderType, tableId?: string, tableName?: string, areaName?: string) => {
    setOrderType(type, tableId, tableName, areaName);
    setShowTableSelector(false);
  };

  const getOrderTypeLabel = () => {
    if (orderType === 'DINE_IN') return tableName || 'Chọn bàn';
    if (orderType === 'TAKE_AWAY') return 'Mang đi';
    return 'Giao hàng';
  };

  const getOrderTypeIcon = () => {
    if (orderType === 'DINE_IN') return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
    if (orderType === 'TAKE_AWAY') return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
  };

  // Logic hiển thị thông tin ca
  const getShiftLabel = () => {
    if (!currentShift) return 'Chưa mở ca';
    const hour = new Date(currentShift.openedAt).getHours();
    if (hour >= 6 && hour < 14) return 'Ca sáng';
    if (hour >= 14 && hour < 22) return 'Ca chiều';
    return 'Ca đêm';
  };

  if (isAuthChecking || isShiftLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-md-sys-color-background">
        <div className="w-12 h-12 border-4 border-md-sys-color-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-md-sys-color-background overflow-hidden font-sans">
      {/* Left Area: Main POS Menu */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-md-sys-color-outline-variant">
        
        {/* Top App Bar */}
        <header className="h-20 px-6 flex items-center justify-between border-b border-md-sys-color-outline-variant bg-md-sys-color-surface-container">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 drop-shadow-sm transition-transform hover:scale-105 duration-300">
                <img src="/icons/logo.svg" alt="Retail POS Logo" className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-black text-md-sys-color-primary tracking-tighter leading-tight">RETAIL POS</h1>
                <span className="text-[10px] font-bold text-md-sys-color-on-surface-variant uppercase tracking-widest">v1.2.0 Sprint 6</span>
              </div>
            </div>
            
            {/* Order Type Switcher */}
            <div className="h-10 w-[1px] bg-md-sys-color-outline-variant mx-2"></div>
            
            <button 
              onClick={() => setShowTableSelector(true)}
              disabled={!currentShift}
              className={clsx(
                "flex items-center gap-3 px-6 py-2.5 rounded-2xl transition-all shadow-md3-1 hover:shadow-md3-2 active:scale-95",
                orderType === 'DINE_IN' 
                  ? "bg-md-sys-color-primary text-md-sys-color-on-primary" 
                  : "bg-md-sys-color-secondary-container text-md-sys-color-on-secondary-container",
                !currentShift && "opacity-50 cursor-not-allowed"
              )}
            >
              {getOrderTypeIcon()}
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase font-bold opacity-80 mb-0.5">Hình thức phục vụ</span>
                <span className="font-bold text-base">{getOrderTypeLabel()}</span>
              </div>
              <svg className="w-4 h-4 ml-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-md-sys-color-on-surface">Admin Demo</span>
                <span className="text-[10px] text-md-sys-color-on-surface-variant uppercase tracking-widest font-medium">
                  {getShiftLabel()} • {areaName || (orderType === 'DINE_IN' ? 'Chưa chọn bàn' : 'Ngoài cửa hàng')}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-md-sys-color-primary/10 flex items-center justify-center text-md-sys-color-primary font-bold border border-md-sys-color-primary/20 shadow-sm">
                <UserIcon size={20} />
              </div>
            </div>

            <div className="h-8 w-px bg-md-sys-color-outline-variant"></div>

            <div className="flex items-center gap-2">
              {currentShift && (
                <button 
                  onClick={() => setShowShiftCloseModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-md-sys-color-error hover:bg-md-sys-color-error/10 rounded-xl transition-all font-bold text-xs uppercase tracking-wider"
                  title="Chốt ca làm việc"
                >
                  <Power size={18} />
                  Chốt ca
                </button>
              )}

              <button 
                onClick={() => authService.logout()}
                className="p-3 text-md-sys-color-on-surface-variant hover:text-md-sys-color-error hover:bg-md-sys-color-error/10 rounded-full transition-all group"
                title="Đăng xuất"
              >
                <LogOut size={22} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Menu Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-md-sys-color-surface">
          <MenuGrid />
        </main>
      </div>

      {/* Right Area: Cart & Checkout Sidebar */}
      <div className="w-[420px] flex-shrink-0 bg-md-sys-color-surface-container-low shadow-md3-1 z-10">
        <CartSidebar />
      </div>

      {/* Modals */}
      {showTableSelector && (
        <TableSelector 
          onSelect={handleTableSelect} 
          onClose={() => setShowTableSelector(false)} 
        />
      )}

      {!currentShift && !isShiftLoading && <ShiftOpenModal />}

      {showShiftCloseModal && (
        <ShiftCloseModal onClose={() => setShowShiftCloseModal(false)} />
      )}
    </div>
  );
}
