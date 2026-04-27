import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import ProductModifierModal from './ProductModifierModal';
import { catalogService } from '@/services/catalog.service';
import clsx from 'clsx';

export default function MenuGrid() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi song song cả Products và Categories
        const [prodRes, catRes] = await Promise.all([
          catalogService.getProducts(),
          catalogService.getCategories()
        ]);
        
        setProducts((prodRes as any).data || prodRes);
        setCategories((catRes as any).data || catRes);
      } catch (err) {
        console.error('Failed to fetch menu data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lọc sản phẩm theo Category đã chọn
  const filteredProducts = selectedCategoryId
    ? products.filter(p => p.categoryId === selectedCategoryId)
    : products;

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
        <button 
          onClick={() => setSelectedCategoryId(null)}
          className={clsx(
            "px-6 py-2 rounded-full font-medium transition-all",
            !selectedCategoryId 
              ? "bg-md-sys-color-primary text-md-sys-color-on-primary shadow-md3-1" 
              : "bg-md-sys-color-surface-variant text-md-sys-color-on-surface-variant hover:bg-md-sys-color-surface-variant/80"
          )}
        >
          Tất cả
        </button>

        {categories.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={clsx(
              "px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap",
              selectedCategoryId === cat.id
                ? "bg-md-sys-color-primary text-md-sys-color-on-primary shadow-md3-1" 
                : "bg-md-sys-color-surface-variant text-md-sys-color-on-surface-variant hover:bg-md-sys-color-surface-variant/80"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="p-20 text-center text-md-sys-color-on-surface-variant bg-md-sys-color-surface-variant/20 rounded-md3-large border border-dashed border-md-sys-color-outline-variant animate-in fade-in zoom-in duration-300">
          Chưa có sản phẩm nào trong danh mục này.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredProducts.map((p) => {
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
