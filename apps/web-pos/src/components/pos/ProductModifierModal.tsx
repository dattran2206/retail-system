'use client';

import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';

interface ProductModifierModalProps {
  product: any;
  onClose: () => void;
}

export default function ProductModifierModal({ product, onClose }: ProductModifierModalProps) {
  const { addItem } = useCartStore();
  
  // State for selections
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedModifiers, setSelectedModifiers] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  const toggleModifier = (group: any, modifier: any) => {
    const isSingle = group.selectionType === 'SINGLE';
    
    if (isSingle) {
      // Remove other modifiers from the same group
      const otherGroupMods = selectedModifiers.filter(m => m.groupId !== group.id);
      setSelectedModifiers([...otherGroupMods, { ...modifier, groupId: group.id }]);
    } else {
      const exists = selectedModifiers.find(m => m.id === modifier.id);
      if (exists) {
        setSelectedModifiers(selectedModifiers.filter(m => m.id !== modifier.id));
      } else {
        // Check max selection
        const groupModsCount = selectedModifiers.filter(m => m.groupId === group.id).length;
        if (groupModsCount < group.maxSelection) {
          setSelectedModifiers([...selectedModifiers, { ...modifier, groupId: group.id }]);
        }
      }
    }
  };

  const calculateTotalPrice = () => {
    const variantPrice = Number(selectedVariant.price);
    const modifiersPrice = selectedModifiers.reduce((sum, m) => sum + Number(m.price), 0);
    return (variantPrice + modifiersPrice) * quantity;
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      variantName: selectedVariant.name,
      price: Number(selectedVariant.price),
      quantity,
      note,
      modifiers: selectedModifiers.map(m => ({
        modifierId: m.id,
        name: m.name,
        price: Number(m.price),
        quantity: 1
      }))
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-md-sys-color-surface w-full max-w-lg rounded-md3-extra-large shadow-md3-5 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-md-sys-color-outline-variant flex justify-between items-center bg-md-sys-color-surface-variant">
          <div>
            <h2 className="text-xl font-bold text-md-sys-color-on-surface">{product.name}</h2>
            <p className="text-sm text-md-sys-color-on-surface-variant">Tuỳ chọn sản phẩm</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Variants Section (if multiple) */}
          {product.variants.length > 1 && (
            <section>
              <h3 className="text-sm font-bold text-md-sys-color-primary mb-3 uppercase tracking-wider">Kích cỡ / Loại</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-4 rounded-md3-medium border-2 text-left transition-all ${
                      selectedVariant.id === v.id 
                        ? 'border-md-sys-color-primary bg-md-sys-color-primary-container text-md-sys-color-on-primary-container shadow-md3-1' 
                        : 'border-md-sys-color-outline-variant hover:border-md-sys-color-outline'
                    }`}
                  >
                    <div className="font-bold">{v.name}</div>
                    <div className="text-sm opacity-80">{Number(v.price).toLocaleString('vi-VN')}đ</div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Modifier Groups */}
          {product.productModifiers?.map((pm: any) => {
            const group = pm.modifierGroup;
            return (
              <section key={group.id}>
                <div className="flex justify-between items-end mb-3">
                  <h3 className="text-sm font-bold text-md-sys-color-primary uppercase tracking-wider">{group.name}</h3>
                  <span className="text-xs text-md-sys-color-on-surface-variant italic">
                    {group.selectionType === 'SINGLE' ? 'Chọn 1' : `Tối đa ${group.maxSelection}`}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {group.modifiers.map((m: any) => {
                    const isSelected = selectedModifiers.find(sm => sm.id === m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggleModifier(group, m)}
                        className={`p-3 rounded-md3-medium border transition-all text-sm flex justify-between items-center ${
                          isSelected 
                            ? 'bg-md-sys-color-secondary-container border-md-sys-color-secondary text-md-sys-color-on-secondary-container font-bold' 
                            : 'bg-md-sys-color-surface border-md-sys-color-outline-variant hover:bg-gray-50'
                        }`}
                      >
                        <span>{m.name}</span>
                        <span className="text-xs opacity-70">+{Number(m.price).toLocaleString('vi-VN')}đ</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* Note Section */}
          <section>
            <h3 className="text-sm font-bold text-md-sys-color-primary mb-3 uppercase tracking-wider">Ghi chú đặc biệt</h3>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Ít đá, nhiều đường, không hành..."
              className="w-full p-4 rounded-md3-medium bg-md-sys-color-surface-variant/50 border border-md-sys-color-outline-variant focus:outline-none focus:ring-2 focus:ring-md-sys-color-primary min-h-[80px]"
            />
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-md-sys-color-outline-variant bg-md-sys-color-surface flex items-center gap-6 shadow-md3-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-4 bg-md-sys-color-surface-variant rounded-full px-4 py-2 border border-md-sys-color-outline-variant">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 hover:bg-black/10 rounded-full transition-colors"
            >
              <Minus size={20} />
            </button>
            <span className="text-xl font-bold w-8 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 hover:bg-black/10 rounded-full transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          <button 
            onClick={handleAddToCart}
            className="flex-1 py-4 rounded-full bg-md-sys-color-primary text-md-sys-color-on-primary font-bold shadow-md3-2 hover:shadow-md3-3 active:scale-95 transition-all flex justify-between px-8"
          >
            <span>THÊM VÀO GIỎ</span>
            <span>{calculateTotalPrice().toLocaleString('vi-VN')}đ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
