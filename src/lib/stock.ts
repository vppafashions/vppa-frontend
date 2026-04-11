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

const API_BASE = import.meta.env.VITE_API_BASE || '';

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
