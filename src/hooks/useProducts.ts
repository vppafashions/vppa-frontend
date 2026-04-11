import { useState, useEffect, useCallback } from 'react';
import type { Product } from '../data/products';

const API_BASE = '/api/products';

// Simple in-memory cache
const cache: Record<string, { data: Product[]; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): Product[] | null {
  const entry = cache[key];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  return null;
}

function setCache(key: string, data: Product[]) {
  cache[key] = { data, timestamp: Date.now() };
}

interface UseProductsOptions {
  collection?: string;
  featured?: boolean;
  limit?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { collection, featured, limit } = options;
  const cacheKey = `products:${collection || 'all'}:${featured || ''}:${limit || ''}`;

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      // Check cache first
      const cached = getCached(cacheKey);
      if (cached) {
        setProducts(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (collection) params.set('collection', collection);
        if (featured) params.set('featured', 'true');
        if (limit) params.set('limit', String(limit));

        const url = `${API_BASE}${params.toString() ? `?${params}` : ''}`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status}`);
        }

        const data = await res.json();
        const fetchedProducts: Product[] = data.products || [];

        if (!cancelled) {
          setProducts(fetchedProducts);
          setCache(cacheKey, fetchedProducts);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch products');
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, collection, featured, limit]);

  return { products, loading, error };
}

// Single product by ID — checks cache first, then fetches
const productCache: Record<string, { data: Product; timestamp: number }> = {};

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchProduct() {
      // Check product cache
      const cached = productCache[id!];
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setProduct(cached.data);
        setLoading(false);
        return;
      }

      // Check if it's in any collection cache
      for (const key of Object.keys(cache)) {
        const entry = cache[key];
        if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
          const found = entry.data.find((p) => p.id === id);
          if (found) {
            setProduct(found);
            productCache[id!] = { data: found, timestamp: Date.now() };
            setLoading(false);
            return;
          }
        }
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}?id=${id}`);
        if (!res.ok) {
          throw new Error(`Product not found: ${res.status}`);
        }
        const data = await res.json();
        const fetchedProduct: Product = data.product;

        if (!cancelled) {
          setProduct(fetchedProduct);
          productCache[id!] = { data: fetchedProduct, timestamp: Date.now() };
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch product');
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { product, loading, error };
}
