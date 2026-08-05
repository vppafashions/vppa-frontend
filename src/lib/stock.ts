export interface VariantInventoryItem {
  size: string;
  color: string;
  stock: number;
}

export interface StockInfo {
  productId: string;
  inStock: boolean;
  stockQuantity: number;
  variantInventory?: VariantInventoryItem[];
}

/** Minimal product shape needed for gallery / PDP sold-out checks. */
export interface ProductStockFields {
  inStock?: boolean;
  stockQuantity?: number;
  variantInventory?: VariantInventoryItem[];
}

/** Prestige-facing label for empty inventory (prefer over "Sold Out"). */
export const UNAVAILABLE_LABEL = 'Unavailable';
export const UNAVAILABLE_HEADLINE = 'Currently unavailable';
export const UNAVAILABLE_WISHLIST_HINT =
  'This piece is currently unavailable. Save it to your wishlist — we will keep it close for when it returns.';

const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * True when the product has no purchasable stock left.
 * Uses product-level inStock, or all-zero variantInventory when present.
 */
export function isProductSoldOut(product: ProductStockFields | null | undefined): boolean {
  if (!product) return false;
  if (product.inStock === false) return true;
  const variants = product.variantInventory;
  if (variants && variants.length > 0) {
    return variants.every((v) => v.stock <= 0);
  }
  return false;
}

/**
 * Check stock availability for a single product by its ID.
 * Calls server-side API which uses Appwrite API key.
 * Falls back to "in stock" if check fails.
 */
export async function checkProductStock(
  productId: string,
  variant?: { size: string; color: string },
): Promise<StockInfo> {
  try {
    const response = await fetch(`${API_BASE}/api/inventory?action=stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productIds: [productId],
        variants: variant ? [variant] : undefined,
      }),
    });
    if (!response.ok) return { productId, inStock: true, stockQuantity: 999 };
    const data = await response.json();
    return data.results?.[0] || { productId, inStock: true, stockQuantity: 999 };
  } catch {
    return { productId, inStock: true, stockQuantity: 999 };
  }
}

/**
 * Batch stock check for product IDs (e.g. wishlist).
 * Falls back to "in stock" per id if the request fails.
 */
export async function checkProductsStock(productIds: string[]): Promise<Map<string, StockInfo>> {
  const map = new Map<string, StockInfo>();
  if (productIds.length === 0) return map;

  try {
    const response = await fetch(`${API_BASE}/api/inventory?action=stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds }),
    });
    if (!response.ok) {
      for (const productId of productIds) {
        map.set(productId, { productId, inStock: true, stockQuantity: 999 });
      }
      return map;
    }
    const data = await response.json();
    for (const result of data.results || []) {
      map.set(result.productId, result);
    }
    for (const productId of productIds) {
      if (!map.has(productId)) {
        map.set(productId, { productId, inStock: true, stockQuantity: 999 });
      }
    }
    return map;
  } catch {
    for (const productId of productIds) {
      map.set(productId, { productId, inStock: true, stockQuantity: 999 });
    }
    return map;
  }
}

/**
 * Check stock availability for multiple cart items.
 * Returns an array of items that are out of stock or have insufficient quantity.
 */
export async function checkCartStock(
  cartItems: Array<{ productId: string; name: string; quantity: number; size?: string; color?: string }>
): Promise<Array<{ productId: string; name: string; requested: number; available: number }>> {
  try {
    const productIds = cartItems.map((item) => item.productId);
    const variants = cartItems.map((item) =>
      item.size && item.color ? { size: item.size, color: item.color } : undefined,
    );
    const response = await fetch(`${API_BASE}/api/inventory?action=stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds, variants }),
    });

    if (!response.ok) return [];
    const data = await response.json();
    const stockMap = new Map<string, StockInfo>();
    for (const result of data.results || []) {
      stockMap.set(result.productId, result);
    }

    const outOfStock: Array<{ productId: string; name: string; requested: number; available: number }> = [];
    for (const item of cartItems) {
      const stock = stockMap.get(item.productId) || { productId: item.productId, inStock: true, stockQuantity: 999 };
      if (!stock.inStock || stock.stockQuantity < item.quantity) {
        outOfStock.push({
          productId: item.productId,
          name: item.name,
          requested: item.quantity,
          available: stock.inStock ? stock.stockQuantity : 0,
        });
      }
    }
    return outOfStock;
  } catch {
    return [];
  }
}
