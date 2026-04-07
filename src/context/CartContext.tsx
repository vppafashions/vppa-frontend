import React, { useEffect, useState, createContext, useContext, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
  getCartItems,
  addCartItem as addCartItemToDb,
  updateCartItemQuantity,
  removeCartItem as removeCartItemFromDb,
  clearCartItems,
} from '../lib/cart';
import { trackAddToCart, trackRemoveFromCart } from '../lib/analytics';

export interface CartItem {
  id: string;
  docId?: string;
  productId: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'docId'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('vppa_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const syncedRef = useRef(false);

  // Save to localStorage always (fallback for guests)
  useEffect(() => {
    localStorage.setItem('vppa_cart', JSON.stringify(items));
  }, [items]);

  // Sync cart from Appwrite when user logs in
  const syncCartFromAppwrite = useCallback(async (userId: string) => {
    if (syncedRef.current) return;
    setCartLoading(true);
    try {
      const remoteItems = await getCartItems(userId);
      const localItems = JSON.parse(localStorage.getItem('vppa_cart') || '[]') as CartItem[];

      // Merge local items into remote
      for (const localItem of localItems) {
        const existsRemote = remoteItems.find(
          (r) => r.productId === localItem.productId && r.size === localItem.size && r.color === localItem.color
        );
        if (!existsRemote) {
          await addCartItemToDb(userId, {
            productId: localItem.productId,
            name: localItem.name,
            price: localItem.price,
            size: localItem.size,
            color: localItem.color,
            quantity: localItem.quantity,
            image: localItem.image,
          });
        }
      }

      // Re-fetch to get all items with docIds
      const allItems = await getCartItems(userId);
      const merged: CartItem[] = allItems.map((doc) => ({
        id: `${doc.productId}-${doc.size}-${doc.color.replace('#', '')}`,
        docId: doc.$id,
        productId: doc.productId,
        name: doc.name,
        price: doc.price,
        size: doc.size,
        color: doc.color,
        quantity: doc.quantity,
        image: doc.image,
      }));

      setItems(merged);
      syncedRef.current = true;
    } catch (error) {
      console.error('Cart sync failed:', error);
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      syncCartFromAppwrite(user.$id);
    } else {
      syncedRef.current = false;
    }
  }, [user, syncCartFromAppwrite]);

  const addToCart = (newItem: Omit<CartItem, 'id' | 'docId'>) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.size === newItem.size &&
          item.color === newItem.color
      );
      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        const existing = updatedItems[existingItemIndex];
        existing.quantity += newItem.quantity;
        if (user && existing.docId) {
          updateCartItemQuantity(existing.docId, existing.quantity);
        }
        return updatedItems;
      }
      const id = `${newItem.productId}-${newItem.size}-${newItem.color.replace('#', '')}`;
      const cartItem: CartItem = { ...newItem, id };

      if (user) {
        addCartItemToDb(user.$id, {
          productId: newItem.productId,
          name: newItem.name,
          price: newItem.price,
          size: newItem.size,
          color: newItem.color,
          quantity: newItem.quantity,
          image: newItem.image,
        }).then((docId) => {
          if (docId) {
            setItems((prev) =>
              prev.map((item) => (item.id === id ? { ...item, docId } : item))
            );
          }
        });
      }

      trackAddToCart({ id: cartItem.productId, name: cartItem.name, price: cartItem.price, quantity: cartItem.quantity });
      return [...prevItems, cartItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => {
      const item = prevItems.find((i) => i.id === id);
      if (item) {
        trackRemoveFromCart({ id: item.productId, name: item.name, price: item.price });
      }
      if (item?.docId && user) {
        removeCartItemFromDb(item.docId);
      }
      return prevItems.filter((i) => i.id !== id);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          if (item.docId && user) {
            updateCartItemQuantity(item.docId, quantity);
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    if (user) {
      clearCartItems(user.$id);
    }
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isCartOpen,
        setIsCartOpen,
        cartLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
