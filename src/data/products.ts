// Product type definition. Real products are fetched from Appwrite via /api/products.

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  sizes: string[];
  colors: string[];
  collectionSlug: string;
  category: string;
  productType?: string;
  sku?: string;
  fabricCare?: string;
  returnPolicy?: string;
  colorImages?: Record<string, string[]>;
  sizeGuideId?: string;
  slug?: string;
  inStock?: boolean;
  stockQuantity?: number;
  variantInventory?: Array<{ size: string; color: string; stock: number; itemCode: string }>;
  featured?: boolean;
  displayOnMainPage?: boolean;
  gender?: string;
  itemCode?: string;
  hsnCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const products: Product[] = [];