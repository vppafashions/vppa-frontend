import { ID, Query } from 'appwrite';
import { databases, DATABASE_ID } from './appwrite';

const WISHLISTS_COLLECTION_ID = 'wishlists';

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

export async function getWishlistItems(userId: string): Promise<WishlistItem[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      WISHLISTS_COLLECTION_ID,
      [Query.equal('userId', userId), Query.orderDesc('$createdAt'), Query.limit(100)]
    );
    return response.documents as unknown as WishlistItem[];
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
    // Check if already in wishlist
    const existing = await databases.listDocuments(
      DATABASE_ID,
      WISHLISTS_COLLECTION_ID,
      [Query.equal('userId', userId), Query.equal('productId', item.productId), Query.limit(1)]
    );
    if (existing.documents.length > 0) {
      return existing.documents[0].$id; // Already exists
    }

    const doc = await databases.createDocument(
      DATABASE_ID,
      WISHLISTS_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        collectionSlug: item.collectionSlug,
      }
    );
    return doc.$id;
  } catch (error) {
    console.error('Failed to add to wishlist:', error);
    return null;
  }
}

export async function removeFromWishlist(docId: string): Promise<boolean> {
  try {
    await databases.deleteDocument(DATABASE_ID, WISHLISTS_COLLECTION_ID, docId);
    return true;
  } catch (error) {
    console.error('Failed to remove from wishlist:', error);
    return false;
  }
}

export async function isInWishlist(userId: string, productId: string): Promise<string | null> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      WISHLISTS_COLLECTION_ID,
      [Query.equal('userId', userId), Query.equal('productId', productId), Query.limit(1)]
    );
    return response.documents.length > 0 ? response.documents[0].$id : null;
  } catch {
    return null;
  }
}
