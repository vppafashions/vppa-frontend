export interface CartItemData {
  productId: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
}

interface CartDocument extends CartItemData {
  $id: string;
  userId: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function getCartItems(userId: string): Promise<CartDocument[]> {
  try {
    const response = await fetch(`${API_BASE}/api/cart?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.documents || []).map((doc: Record<string, unknown>) => ({
      $id: doc.$id as string,
      userId: doc.userId as string,
      productId: doc.productId as string,
      name: doc.name as string,
      price: doc.price as number,
      size: doc.size as string,
      color: doc.color as string,
      quantity: doc.quantity as number,
      image: (doc.image as string) || '',
    }));
  } catch {
    return [];
  }
}

export async function addCartItem(userId: string, item: CartItemData): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...item }),
    });
    if (!response.ok) return null;
    const doc = await response.json();
    return doc.$id;
  } catch (error) {
    console.error('Failed to add cart item:', error);
    return null;
  }
}

export async function updateCartItemQuantity(docId: string, quantity: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/cart`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId, quantity }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to update cart item:', error);
    return false;
  }
}

export async function removeCartItem(docId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/cart`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to remove cart item:', error);
    return false;
  }
}

export async function clearCartItems(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/cart`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, clearAll: true }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to clear cart:', error);
    return false;
  }
}
