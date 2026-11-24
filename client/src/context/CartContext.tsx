import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, Product } from '../types';
import { useSettings } from './SettingsContext';
import { useToast } from './ToastContext';
import { api } from '../services/api';

interface AppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  calculatedDiscount: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: number, size: string, color: string) => void;
  updateQuantity: (productId: number, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  freeShippingProgress: number; // percentage 0-100
  amountNeededForFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('qc_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const saved = localStorage.getItem('qc_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { settings } = useSettings();
  const { success, error, info } = useToast();

  useEffect(() => {
    localStorage.setItem('qc_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('qc_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('qc_coupon');
    }
  }, [appliedCoupon]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const freeShippingThreshold = parseFloat(settings.freeShippingThreshold || '1499');
  const baseShippingFee = parseFloat(settings.shippingCharges || '99');

  const shippingFee = useMemo(() => {
    if (items.length === 0) return 0;
    return subtotal >= freeShippingThreshold ? 0 : baseShippingFee;
  }, [items.length, subtotal, freeShippingThreshold, baseShippingFee]);

  const freeShippingProgress = useMemo(() => {
    if (freeShippingThreshold <= 0) return 100;
    return Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  }, [subtotal, freeShippingThreshold]);

  const amountNeededForFreeShipping = useMemo(() => {
    return Math.max(0, freeShippingThreshold - subtotal);
  }, [subtotal, freeShippingThreshold]);

  // Recalculate discount based on current subtotal
  const discount = useMemo(() => {
    if (!appliedCoupon || items.length === 0) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return Math.round((subtotal * appliedCoupon.discountValue) / 100);
    }
    return Math.min(subtotal, appliedCoupon.discountValue);
  }, [appliedCoupon, subtotal, items.length]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount + shippingFee);
  }, [subtotal, discount, shippingFee]);

  const addToCart = (product: Product, size: string, color: string, quantity = 1) => {
    if (!size || !color) {
      error('Please select both a size and color.');
      return;
    }

    if (product.stock <= 0) {
      error('This item is currently out of stock.');
      return;
    }

    const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
    const primaryImg = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d';

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === product.id && i.selectedSize === size && i.selectedColor === color
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        if (newQty > product.stock) {
          error(`Only ${product.stock} units available in stock.`);
          updated[existingIndex].quantity = product.stock;
        } else {
          updated[existingIndex].quantity = newQty;
          success(`Updated "${product.name}" quantity in your bag.`);
        }
        return updated;
      } else {
        const itemQty = Math.min(quantity, product.stock);
        success(`Added "${product.name}" to your bag.`);
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price,
            originalPrice: product.salePrice ? product.price : undefined,
            image: primaryImg,
            quantity: itemQty,
            selectedSize: size,
            selectedColor: color,
            maxStock: product.stock,
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number, size: string, color: string) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.productId === productId && i.selectedSize === size && i.selectedColor === color)
      )
    );
    info('Item removed from your bag.');
  };

  const updateQuantity = (productId: number, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.selectedSize === size && item.selectedColor === color) {
          const validQty = Math.min(quantity, item.maxStock);
          if (quantity > item.maxStock) {
            error(`Maximum available stock is ${item.maxStock}.`);
          }
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string) => {
    if (!code.trim()) {
      error('Please enter a coupon code.');
      return;
    }

    try {
      const data = await api.validateCoupon(code.trim().toUpperCase(), subtotal);
      if (data.valid) {
        setAppliedCoupon({
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          calculatedDiscount: data.calculatedDiscount,
        });
        success(data.message || 'Coupon applied successfully!');
      }
    } catch (err: any) {
      error(err.message || 'Invalid coupon code.');
      throw err;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    info('Coupon code removed.');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        itemCount,
        subtotal,
        shippingFee,
        discount,
        total,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        freeShippingProgress,
        amountNeededForFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
