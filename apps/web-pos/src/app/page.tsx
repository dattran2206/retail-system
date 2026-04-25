'use client';

import React, { useState } from 'react';
import MenuGrid from '@/components/pos/MenuGrid';
import CartSidebar from '@/components/pos/CartSidebar';

export default function PosPage() {
  return (
    <div className="flex h-screen w-full bg-md-sys-color-background overflow-hidden">
      {/* Left Area: Main POS Menu */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-md-sys-color-outline-variant">
        {/* Top App Bar can go here */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-md-sys-color-outline-variant bg-md-sys-color-surface">
          <h1 className="text-xl font-medium text-md-sys-color-on-surface">Thu Ngân</h1>
          <div className="flex items-center gap-4">
            {/* Sync Status, User Info, etc. */}
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
          </div>
        </header>

        {/* Scrollable Menu Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <MenuGrid />
        </main>
      </div>

      {/* Right Area: Cart & Checkout Sidebar */}
      <div className="w-[400px] flex-shrink-0 bg-md-sys-color-surface">
        <CartSidebar />
      </div>
    </div>
  );
}
