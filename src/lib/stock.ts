import { Query } from 'appwrite';
import { databases, DATABASE_ID } from './appwrite';

const PRODUCTS_COLLECTION_ID = 'products';

export interface StockInfo {
  productId: string;
  inStock: boolean;
  stockQuantity: number;
}

/**
 * Check stock availability for a single product by its ID.
 * Returns stock info from Appwrite products collection.
 * Falls back to "in stock" if product not found in Appwrite (hardcoded products).
 */
export async function checkProductStock(productId: string): Promise<StockInfo> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      PRODUCTS_COLLECTION_ID,
      [Query.equal('$id', productId), Query.limit(1)]
    );

    if (response.documents.length > 0) {
      const product = response.documents[0];
      return {
        productId,
        inStock: product.inStock !== false,
        stockQuantity: product.stockQuantity ?? 999,
      };
    }

    // Product not found in Appwrite — likely hardcoded, treat as in-stock
    return { productId, inStock: true, stockQuantity: 999 };
  } catch {
    // If Appwrite query fails, don't block checkout
    return { productId, inStock: true, stockQuantity: 999 };
  }
}

/**
 * Check stock availability for multiple cart items.
 * Returns an array of items that are out of stock or have insufficient quantity.
 */
export async function checkCartStock(
  cartItems: Array<{ productId: string; name: string; quantity: number }>
): Promise<Array<{ productId: string; name: string; requested: number; available: number }>> {
  const outOfStock: Array<{ productId: string; name: string; requested: number; available: number }> = [];

  for (const item of cartItems) {
    const stock = await checkProductStock(item.productId);
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
}
