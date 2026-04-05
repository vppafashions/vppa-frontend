import { ID, Query, Permission, Role } from 'appwrite';
import { databases, DATABASE_ID, CARTS_COLLECTION_ID } from './appwrite';

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

export async function getCartItems(userId: string): Promise<CartDocument[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      CARTS_COLLECTION_ID,
      [Query.equal('userId', userId), Query.limit(100)]
    );
    return response.documents.map((doc) => ({
      $id: doc.$id,
      userId: doc.userId,
      productId: doc.productId,
      name: doc.name,
      price: doc.price,
      size: doc.size,
      color: doc.color,
      quantity: doc.quantity,
      image: doc.image || '',
    }));
  } catch {
    return [];
  }
}

export async function addCartItem(userId: string, item: CartItemData): Promise<string | null> {
  try {
    // Check if same product/size/color exists
    const existing = await databases.listDocuments(
      DATABASE_ID,
      CARTS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('productId', item.productId),
        Query.equal('size', item.size),
        Query.equal('color', item.color),
        Query.limit(1),
      ]
    );

    if (existing.documents.length > 0) {
      const doc = existing.documents[0];
      const newQty = doc.quantity + item.quantity;
      await databases.updateDocument(
        DATABASE_ID,
        CARTS_COLLECTION_ID,
        doc.$id,
        { quantity: newQty }
      );
      return doc.$id;
    }

    const doc = await databases.createDocument(
      DATABASE_ID,
      CARTS_COLLECTION_ID,
      ID.unique(),
      { userId, ...item },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    return doc.$id;
  } catch (error) {
    console.error('Failed to add cart item:', error);
    return null;
  }
}

export async function updateCartItemQuantity(docId: string, quantity: number): Promise<boolean> {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      CARTS_COLLECTION_ID,
      docId,
      { quantity }
    );
    return true;
  } catch (error) {
    console.error('Failed to update cart item:', error);
    return false;
  }
}

export async function removeCartItem(docId: string): Promise<boolean> {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      CARTS_COLLECTION_ID,
      docId
    );
    return true;
  } catch (error) {
    console.error('Failed to remove cart item:', error);
    return false;
  }
}

export async function clearCartItems(userId: string): Promise<boolean> {
  try {
    const items = await databases.listDocuments(
      DATABASE_ID,
      CARTS_COLLECTION_ID,
      [Query.equal('userId', userId), Query.limit(100)]
    );
    await Promise.all(
      items.documents.map((doc) =>
        databases.deleteDocument(DATABASE_ID, CARTS_COLLECTION_ID, doc.$id)
      )
    );
    return true;
  } catch (error) {
    console.error('Failed to clear cart:', error);
    return false;
  }
}
