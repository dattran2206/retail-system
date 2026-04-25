import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import ProductModifierModal from './ProductModifierModal';
import { catalogService } from '@/services/catalog.service';

export default function MenuGrid() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    // Gọi API lấy danh sách sản phẩm qua CatalogService
    const fetchProducts = async () => {
      try {
        const res = await catalogService.getProducts();
        // Backend trả về dạng { data: [], meta: {} } bọc trong { data: {} } của interceptor
        // Sau khi qua apiClient interceptor, res sẽ là { data: [], meta: {} }
        setProducts((res as any).data || res);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <div className="w-12 h-12 border-4 border-md-sys-color-primary/30 border-t-md-sys-color-primary rounded-full animate-spin"></div>
        <div className="text-md-sys-color-on-surface-variant font-medium">Đang tải Menu...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Category filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        <button className="px-6 py-2 rounded-full bg-md-sys-color-primary text-md-sys-color-on-primary font-medium shadow-md3-1">Tất cả</button>
        <button className="px-6 py-2 rounded-full bg-md-sys-color-surface-variant text-md-sys-color-on-surface-variant font-medium hover:bg-md-sys-color-surface-variant/80 transition-colors">Cà phê</button>
        <button className="px-6 py-2 rounded-full bg-md-sys-color-surface-variant text-md-sys-color-on-surface-variant font-medium hover:bg-md-sys-color-surface-variant/80 transition-colors">Trà sữa</button>
      </div>

      {products.length === 0 ? (
        <div className="p-20 text-center text-md-sys-color-on-surface-variant bg-md-sys-color-surface-variant/20 rounded-md3-large border border-dashed border-md-sys-color-outline-variant">
          Chưa có sản phẩm nào trong thực đơn.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            // Lấy giá của variant mặc định
            const defaultVariant = p.variants?.[0];
            const displayPrice = defaultVariant ? Number(defaultVariant.price) : 0;

            return (
              <ProductCard 
                key={p.id}
                name={p.name}
                price={displayPrice}
                imageUrl={p.imageUrl}
                onClick={() => setSelectedProduct(p)}
              />
            );
          })}
        </div>
      )}

      {/* Modal Selection */}
      {selectedProduct && (
        <ProductModifierModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
