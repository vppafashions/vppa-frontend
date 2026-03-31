import React, { useEffect, useState, createContext, useContext } from 'react';
export interface CartItem {
  id: string;
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
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}
const CartContext = createContext<CartContextType | undefined>(undefined);
export function CartProvider({ children }: {children: ReactNode;}) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('vppa_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  useEffect(() => {
    localStorage.setItem('vppa_cart', JSON.stringify(items));
  }, [items]);
  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
        item.productId === newItem.productId &&
        item.size === newItem.size &&
        item.color === newItem.color
      );
      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      }
      return [
      ...prevItems,
      {
        ...newItem,
        id: `${newItem.productId}-${newItem.size}-${newItem.color.replace('#', '')}`
      }];

    });
    setIsCartOpen(true);
  };
  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prevItems) =>
    prevItems.map((item) =>
    item.id === id ?
    {
      ...item,
      quantity
    } :
    item
    )
    );
  };
  const clearCart = () => {
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
        setIsCartOpen
      }}>
      
      {children}
    </CartContext.Provider>);

}
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}