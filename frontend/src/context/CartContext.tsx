import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../shared/index.js';
import { useToast } from './ToastContext.js';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'magnificent_bag_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === item.productId);
      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = existing.quantity + quantity;
        if (newQty > item.maxStock) {
          error(
            'Maximum Stock Reached',
            `Only ${item.maxStock} piece(s) of "${item.name}" are currently available.`
          );
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = { ...existing, quantity: newQty };
        success('Added to Bag', `Updated quantity of "${item.name}" in your bag.`);
        return updated;
      } else {
        if (quantity > item.maxStock) {
          error(
            'Limited Stock',
            `Only ${item.maxStock} piece(s) of "${item.name}" are available.`
          );
          return prev;
        }
        success('Added to Bag', `"${item.name}" has been placed in your shopping bag.`);
        return [...prev, { ...item, quantity }];
      }
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.productId === productId) {
          const clamped = Math.min(quantity, i.maxStock);
          return { ...i, quantity: clamped };
        }
        return i;
      })
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => {
      const removed = prev.find((i) => i.productId === productId);
      if (removed) {
        success('Item Removed', `"${removed.name}" was removed from your bag.`);
      }
      return prev.filter((i) => i.productId !== productId);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
