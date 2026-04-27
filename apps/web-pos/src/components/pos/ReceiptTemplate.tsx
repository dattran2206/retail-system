'use client';

import React from 'react';

interface ReceiptTemplateProps {
  order: any; // Cấu trúc Order đầy đủ từ backend
}

export const ReceiptTemplate = React.forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ order }, ref) => {
    if (!order) return null;

    const { tenant, items, table, orderNumber, createdAt, totalAmount, discount, paymentMethod } = order;

    return (
      <div ref={ref} className="p-4 bg-white text-black font-mono text-[12px] w-[80mm] mx-auto print:m-0">
        {/* Header */}
        <div className="text-center mb-4 space-y-1">
          <h2 className="text-lg font-bold uppercase">{tenant?.name || 'Cửa hàng bán lẻ'}</h2>
          <p className="text-[10px]">{tenant?.address || 'Địa chỉ chưa cập nhật'}</p>
          <p className="text-[10px]">SĐT: {tenant?.phone || 'N/A'}</p>
          <div className="border-b border-dashed border-black my-2"></div>
          <h3 className="text-sm font-bold">PHIẾU THANH TOÁN</h3>
        </div>

        {/* Info */}
        <div className="mb-4 space-y-0.5">
          <div className="flex justify-between">
            <span>Số HĐ:</span>
            <span className="font-bold">{orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Ngày:</span>
            <span>{new Date(createdAt).toLocaleString('vi-VN')}</span>
          </div>
          {table && (
            <div className="flex justify-between">
              <span>Bàn/Khu vực:</span>
              <span className="font-bold">{table.name} ({table.area?.name})</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Hình thức:</span>
            <span className="font-bold">{paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản/QR'}</span>
          </div>
        </div>

        <div className="border-b border-dashed border-black mb-2"></div>

        {/* Items Table */}
        <table className="w-full mb-4 border-collapse">
          <thead>
            <tr className="text-left border-b border-black">
              <th className="pb-1">Tên món</th>
              <th className="pb-1 text-center">SL</th>
              <th className="pb-1 text-right">Đơn giá</th>
              <th className="pb-1 text-right">T.Tiền</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item: any, idx: number) => (
              <React.Fragment key={idx}>
                <tr className="align-top">
                  <td className="py-1">
                    <div className="font-bold">{item.variant?.name || 'Sản phẩm'}</div>
                    {item.modifiers?.length > 0 && (
                      <div className="text-[10px] italic pl-2">
                        {item.modifiers.map((m: any) => `+ ${m.modifier?.name}`).join(', ')}
                      </div>
                    )}
                    {item.note && <div className="text-[10px] pl-2 text-gray-600">*{item.note}</div>}
                  </td>
                  <td className="py-1 text-center">{item.quantity}</td>
                  <td className="py-1 text-right">{(Number(item.price)).toLocaleString()}</td>
                  <td className="py-1 text-right">{(Number(item.price) * item.quantity).toLocaleString()}</td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <div className="border-b border-dashed border-black mb-2"></div>

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Tổng cộng:</span>
            <span>{(Number(totalAmount) + Number(discount)).toLocaleString()}đ</span>
          </div>
          {Number(discount) > 0 && (
            <div className="flex justify-between">
              <span>Giảm giá:</span>
              <span>-{(Number(discount)).toLocaleString()}đ</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold">
            <span>THANH TOÁN:</span>
            <span>{(Number(totalAmount)).toLocaleString()}đ</span>
          </div>
        </div>

        <div className="border-b border-dashed border-black my-4"></div>

        {/* Footer */}
        <div className="text-center space-y-1 italic">
          <p>Cảm ơn quý khách và hẹn gặp lại!</p>
          <p className="text-[9px]">Retail SaaS - Powered by Antigravity</p>
        </div>
      </div>
    );
  }
);

ReceiptTemplate.displayName = 'ReceiptTemplate';

export default ReceiptTemplate;
