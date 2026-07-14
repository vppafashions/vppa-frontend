import { useState, useEffect } from 'react';
import type { Product } from '../data/products';

const API_ROOT = import.meta.env.VITE_API_BASE || '';
const API_BASE = `${API_ROOT}/api/products`;

const cache: Record<string, { data: Product[]; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000;

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
  gender?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { collection, featured, limit, gender } = options;
  const cacheKey = `products:${collection || 'all'}:${featured || ''}:${limit || ''}:${gender || ''}`;

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
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
        if (gender) params.set('gender', gender);

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
  }, [cacheKey, collection, featured, limit, gender]);

  return { products, loading, error };
}

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
      const cached = productCache[id!];
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setProduct(cached.data);
        setLoading(false);
        return;
      }

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

const slugCache: Record<string, { data: Product; timestamp: number }> = {};

export function useProductBySlug(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchProduct() {
      const cached = slugCache[slug!];
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setProduct(cached.data);
        setLoading(false);
        return;
      }

      for (const key of Object.keys(cache)) {
        const entry = cache[key];
        if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
          const found = entry.data.find((p) => p.slug === slug);
          if (found) {
            setProduct(found);
            slugCache[slug!] = { data: found, timestamp: Date.now() };
            setLoading(false);
            return;
          }
        }
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) {
          throw new Error(`Product not found: ${res.status}`);
        }
        const data = await res.json();
        const fetchedProduct: Product = data.product;

        if (!cancelled) {
          setProduct(fetchedProduct);
          slugCache[slug!] = { data: fetchedProduct, timestamp: Date.now() };
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
  }, [slug]);

  return { product, loading, error };
}

export function getProductUrl(product: { slug?: string; id: string }): string {
  if (product.slug) {
    const slug = product.slug.startsWith('/') ? product.slug : `/${product.slug}`;
    return slug;
  }
  return `/product/${product.id}`;
}