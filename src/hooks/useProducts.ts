import { useState, useEffect, useCallback } from 'react';
import type { Product } from '../data/products';

const API_BASE = '/api/products';

// Simple in-memory cache
const cache: Record<string, { data: Product[]; timestamp: number }> = {};
const inflight: Record<string, Promise<Product[]>> = {};
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

function buildProductsUrl(options: {
  collection?: string;
  featured?: boolean;
  limit?: number;
  gender?: string;
}): string {
  const params = new URLSearchParams();
  if (options.collection) params.set('collection', options.collection);
  if (options.featured) params.set('featured', 'true');
  if (options.limit) params.set('limit', String(options.limit));
  if (options.gender) params.set('gender', options.gender);
  return `${API_BASE}${params.toString() ? `?${params}` : ''}`;
}

function fetchProductsList(cacheKey: string, url: string): Promise<Product[]> {
  if (!inflight[cacheKey]) {
    inflight[cacheKey] = (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status}`);
        }
        const data = await res.json();
        const fetchedProducts: Product[] = data.products || [];
        setCache(cacheKey, fetchedProducts);
        return fetchedProducts;
      } finally {
        delete inflight[cacheKey];
      }
    })();
  }
  return inflight[cacheKey];
}

interface UseProductsOptions {
  collection?: string;
  featured?: boolean;
  limit?: number;
  gender?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { collection, featured, limit, gender } = options;
  const cacheKey = `products:${collection || 'all'}:${featured || ''}:${limit || ''}:${gender || ''}`;
  const cached = getCached(cacheKey);

  const [activeKey, setActiveKey] = useState(cacheKey);
  const [products, setProducts] = useState<Product[]>(() => cached || []);
  const [loading, setLoading] = useState(() => !cached);
  const [error, setError] = useState<string | null>(null);

  // Never render the previous query's products while a new collection/gender is loading.
  const resolvedProducts = activeKey === cacheKey ? products : cached || [];
  const resolvedLoading = activeKey === cacheKey ? loading : !cached;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const fromCache = getCached(cacheKey);
      if (fromCache) {
        setProducts(fromCache);
        setActiveKey(cacheKey);
        setLoading(false);
        setError(null);
        return;
      }

      setProducts([]);
      setActiveKey(cacheKey);
      setLoading(true);
      setError(null);

      try {
        const fetchedProducts = await fetchProductsList(
          cacheKey,
          buildProductsUrl({ collection, featured, limit, gender })
        );
        if (!cancelled) {
          setProducts(fetchedProducts);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch products');
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, collection, featured, limit, gender]);

  return { products: resolvedProducts, loading: resolvedLoading, error };
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

// Single product by slug
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
      // Check slug cache
      const cached = slugCache[slug!];
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setProduct(cached.data);
        setLoading(false);
        return;
      }

      // Check if it's in any collection cache by slug
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

// Helper to get the product URL path from a product's slug
export function getProductUrl(product: { slug?: string; id: string }): string {
  if (product.slug) {
    // Slugs may start with / (e.g. /men/shirt/product-name) or not (e.g. product-name)
    const slug = product.slug.startsWith('/') ? product.slug : `/${product.slug}`;
    return slug;
  }
  // Fallback to old ID-based URL
  return `/product/${product.id}`;
}
