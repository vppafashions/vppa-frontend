import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getWishlistItems,
  addToWishlist as addToWishlistDb,
  removeFromWishlist as removeFromWishlistDb,
  type WishlistItem,
} from '../lib/wishlist';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: {
    productId: string;
    name: string;
    price: number;
    image: string;
    collectionSlug: string;
  }) => Promise<void>;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const loadWishlist = useCallback(async (userId: string) => {
    setWishlistLoading(true);
    try {
      const items = await getWishlistItems(userId);
      setWishlistItems(items);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadWishlist(user.$id);
    } else {
      setWishlistItems([]);
    }
  }, [user, loadWishlist]);

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlistItems.some((item) => item.productId === productId);
    },
    [wishlistItems]
  );

  const toggleWishlist = useCallback(
    async (product: {
      productId: string;
      name: string;
      price: number;
      image: string;
      collectionSlug: string;
    }) => {
      if (!user) return;

      const existing = wishlistItems.find((item) => item.productId === product.productId);
      if (existing) {
        // Remove from wishlist
        const success = await removeFromWishlistDb(existing.$id);
        if (success) {
          setWishlistItems((prev) => prev.filter((item) => item.$id !== existing.$id));
        }
      } else {
        // Add to wishlist
        const docId = await addToWishlistDb(user.$id, product);
        if (docId) {
          // Reload to get full document
          await loadWishlist(user.$id);
        }
      }
    },
    [user, wishlistItems, loadWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistLoading,
        isInWishlist,
        toggleWishlist,
        wishlistCount: wishlistItems.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
