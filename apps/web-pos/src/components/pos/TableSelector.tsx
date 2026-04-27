import React, { useEffect, useState } from 'react';
import { catalogService } from '@/services/catalog.service';
import clsx from 'clsx';

interface TableSelectorProps {
  onSelect: (type: 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY', tableId?: string, tableName?: string, areaName?: string) => void;
  onClose: () => void;
}

export default function TableSelector({ onSelect, onClose }: TableSelectorProps) {
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY'>('DINE_IN');
  const [areas, setAreas] = useState<any[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAreas = async () => {
      setLoading(true);
      try {
        console.log('Fetching areas...');
        const res = await catalogService.getAreas();
        console.log('Areas response:', res);

        // Handle different possible response formats
        const data = Array.isArray(res) ? res : (res as any)?.data || [];

        if (Array.isArray(data)) {
          setAreas(data);
          if (data.length > 0) {
            setSelectedAreaId(data[0].id);
          }
        } else {
          console.warn('Unexpected areas data format:', res);
          setAreas([]);
        }
      } catch (err) {
        console.error('Failed to fetch areas:', err);
        setAreas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAreas();
  }, []);

  const currentArea = areas.find(a => a.id === selectedAreaId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-md-sys-color-surface w-full max-w-4xl h-[70vh] max-h-[800px] rounded-md3-extra-large shadow-md3-3 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="p-6 border-b border-md-sys-color-outline-variant flex justify-between items-center bg-md-sys-color-surface-container">
          <h2 className="text-2xl font-semibold text-md-sys-color-on-surface">Chọn hình thức phục vụ</h2>
          <button onClick={onClose} className="p-2 hover:bg-md-sys-color-surface-variant rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Order Type Tabs */}
        <div className="p-6 flex gap-4 bg-md-sys-color-surface">
          {[
            { id: 'DINE_IN', label: 'Tại bàn', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
            { id: 'TAKE_AWAY', label: 'Mang đi', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
            { id: 'DELIVERY', label: 'Giao hàng', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setOrderType(type.id as any)}
              className={clsx(
                "flex-1 py-4 px-6 rounded-md3-large border-2 flex flex-col items-center gap-2 transition-all",
                orderType === type.id
                  ? "border-md-sys-color-primary bg-md-sys-color-primary/5 text-md-sys-color-primary shadow-sm"
                  : "border-md-sys-color-outline-variant hover:border-md-sys-color-outline"
              )}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={type.icon} /></svg>
              <span className="font-bold">{type.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Content Area - Fills the available space in 70vh container */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Table Grid (Only for DINE_IN) */}
          {orderType === 'DINE_IN' ? (
            <div className="flex-1 flex overflow-hidden border-t border-md-sys-color-outline-variant">
              {/* Areas Sidebar */}
              {areas.length > 0 && (
                <div className="w-48 bg-md-sys-color-surface-container-low border-r border-md-sys-color-outline-variant overflow-y-auto">
                  {areas.map(area => (
                    <button
                      key={area.id}
                      onClick={() => setSelectedAreaId(area.id)}
                      className={clsx(
                        "w-full p-4 text-left font-medium transition-colors border-b border-md-sys-color-outline-variant/50",
                        selectedAreaId === area.id 
                          ? "bg-md-sys-color-secondary-container text-md-sys-color-on-secondary-container" 
                          : "hover:bg-md-sys-color-surface-variant"
                      )}
                    >
                      {area.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Tables Grid */}
              <div className="flex-1 p-6 overflow-y-auto bg-md-sys-color-surface">
                {loading ? (
                  <div className="flex justify-center items-center h-full text-md-sys-color-on-surface-variant font-medium">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-8 h-8 border-4 border-md-sys-color-primary border-t-transparent rounded-full animate-spin"></div>
                       <span>Đang tải danh sách bàn...</span>
                    </div>
                  </div>
                ) : areas.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {currentArea?.tables?.length > 0 ? (
                      currentArea.tables.map((table: any) => (
                        <button
                          key={table.id}
                          disabled={table.status === 'OCCUPIED'}
                          onClick={() => onSelect('DINE_IN', table.id, table.name, currentArea.name)}
                          className={clsx(
                            "aspect-square rounded-md3-medium flex flex-col items-center justify-center gap-1 transition-all border shadow-sm",
                            table.status === 'OCCUPIED'
                              ? "bg-md-sys-color-error/10 border-md-sys-color-error/20 text-md-sys-color-error cursor-not-allowed opacity-60"
                              : "bg-md-sys-color-surface-container-high border-md-sys-color-outline-variant hover:border-md-sys-color-primary hover:text-md-sys-color-primary"
                          )}
                        >
                          <span className="font-bold text-lg">{table.name}</span>
                          <span className="text-[10px] uppercase opacity-70 font-bold">
                            {table.status === 'OCCUPIED' ? 'Đang dùng' : 'Trống'}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-full py-20 text-center text-md-sys-color-on-surface-variant italic font-medium">
                        Chưa có bàn nào trong khu vực này.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-10">
                     <div className="w-20 h-20 bg-md-sys-color-error/10 rounded-full flex items-center justify-center text-md-sys-color-error mb-2">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                     </div>
                     <p className="font-bold text-lg text-md-sys-color-on-surface">Không tìm thấy danh sách bàn.</p>
                     <p className="text-sm text-md-sys-color-on-surface-variant max-w-xs">
                       Dữ liệu khu vực và bàn chưa được thiết lập hoặc có lỗi kết nối với máy chủ.
                     </p>
                     <button 
                       onClick={() => window.location.reload()}
                       className="mt-2 px-6 py-2 bg-md-sys-color-primary text-md-sys-color-on-primary rounded-full font-bold text-sm"
                     >
                       Tải lại trang
                     </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 p-12 flex flex-col items-center justify-center gap-6 bg-md-sys-color-surface border-t border-md-sys-color-outline-variant">
               <div className="w-24 h-24 bg-md-sys-color-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-md-sys-color-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               </div>
               <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Xác nhận chọn {orderType === 'TAKE_AWAY' ? 'Mang đi' : 'Giao hàng'}</h3>
                  <p className="text-md-sys-color-on-surface-variant">Hệ thống sẽ tạo đơn không gắn bàn cho hình thức này.</p>
               </div>
               <button 
                  onClick={() => onSelect(orderType)}
                  className="bg-md-sys-color-primary text-md-sys-color-on-primary px-12 py-4 rounded-full font-bold shadow-md3-1 hover:shadow-md3-2 transition-all active:scale-95"
               >
                  Bắt đầu gọi món
               </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
