export interface WishlistItem {
  $id: string;
  userId: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  collectionSlug: string;
  $createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function getWishlistItems(userId: string): Promise<WishlistItem[]> {
  try {
    const response = await fetch(`${API_BASE}/api/wishlist?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    console.error('Failed to get wishlist:', error);
    return [];
  }
}

export async function addToWishlist(
  userId: string,
  item: { productId: string; name: string; price: number; image: string; collectionSlug: string }
): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...item }),
    });
    if (!response.ok) return null;
    const doc = await response.json();
    return doc.$id;
  } catch (error) {
    console.error('Failed to add to wishlist:', error);
    return null;
  }
}

export async function removeFromWishlist(docId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/wishlist`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to remove from wishlist:', error);
    return false;
  }
}

export async function isInWishlist(userId: string, productId: string): Promise<string | null> {
  try {
    // Use the list endpoint and check locally
    const items = await getWishlistItems(userId);
    const found = items.find((item) => item.productId === productId);
    return found ? found.$id : null;
  } catch {
    return null;
  }
}
