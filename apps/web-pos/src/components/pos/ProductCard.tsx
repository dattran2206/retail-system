import React from 'react';

interface ProductCardProps {
  name: string;
  price: number;
  imageUrl?: string;
  onClick: () => void;
}

export default function ProductCard({ name, price, imageUrl, onClick }: ProductCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col text-left overflow-hidden rounded-[24px] bg-md-sys-color-surface-variant hover:bg-md-sys-color-secondary-container transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-md3-1 hover:shadow-md3-2 border border-transparent"
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
        <p className="text-md-sys-color-primary font-bold mt-2">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
        </p>
      </div>
    </button>
  );
}
