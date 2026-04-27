import React from 'react';

interface ProductCardProps {
  name: string;
  price: number;
  imageUrl?: string;
  stockQuantity?: number;
  onClick: () => void;
}

export default function ProductCard({ name, price, imageUrl, stockQuantity, onClick }: ProductCardProps) {
  const isOutOfStock = stockQuantity !== undefined && stockQuantity <= 0;

  return (
    <button
      onClick={onClick}
      disabled={isOutOfStock}
      className={`flex flex-col text-left overflow-hidden rounded-[24px] bg-md-sys-color-surface-variant transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-md3-1 hover:shadow-md3-2 border border-transparent ${
        isOutOfStock 
          ? "opacity-60 grayscale cursor-not-allowed" 
          : "hover:bg-md-sys-color-secondary-container"
      }`}
    >
      {/* Image Area */}
      <div className="w-full h-32 bg-gray-200 flex-shrink-0 relative">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      
      {/* Text Area */}
      <div className="p-4 flex flex-col justify-between flex-1 w-full">
        <h3 className="font-medium text-md-sys-color-on-surface line-clamp-2 leading-tight">
          {name}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <p className="text-md-sys-color-primary font-bold">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
          </p>
          {stockQuantity !== undefined && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isOutOfStock 
                ? "bg-md-sys-color-error text-md-sys-color-on-error" 
                : stockQuantity <= 10
                  ? "bg-md-sys-color-warning-container text-md-sys-color-on-warning-container"
                  : "bg-md-sys-color-primary-container text-md-sys-color-on-primary-container"
            }`}>
              {isOutOfStock ? "Hết hàng" : `Kho: ${stockQuantity}`}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
