import { ID, Query, Permission, Role } from 'appwrite';
import { databases, DATABASE_ID } from './appwrite';

const ORDERS_COLLECTION_ID = 'orders';

export interface OrderData {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: string; // JSON stringified array
  total: number;
  status: string;
  notes: string;
  userId?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  trackingNumber?: string;
  courier?: string;
}

export interface OrderDocument extends OrderData {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

export async function createOrder(data: OrderData): Promise<OrderDocument | null> {
  try {
    const payload: Record<string, unknown> = { ...data };
    // Remove empty optional fields
    if (!payload.razorpayPaymentId) delete payload.razorpayPaymentId;
    if (!payload.razorpayOrderId) delete payload.razorpayOrderId;
    if (!payload.trackingNumber) delete payload.trackingNumber;
    if (!payload.courier) delete payload.courier;
    if (!payload.userId) delete payload.userId;

    const permissions = data.userId
      ? [
          Permission.read(Role.user(data.userId)),
          Permission.update(Role.user(data.userId)),
        ]
      : [];

    const doc = await databases.createDocument(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      ID.unique(),
      payload,
      permissions
    );
    return doc as unknown as OrderDocument;
  } catch (error) {
    console.error('Failed to create order:', error);
    return null;
  }
}

export async function getUserOrders(userId: string): Promise<OrderDocument[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(50),
      ]
    );
    return response.documents as unknown as OrderDocument[];
  } catch {
    return [];
  }
}

export async function getOrderById(orderId: string): Promise<OrderDocument | null> {
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      orderId
    );
    return doc as unknown as OrderDocument;
  } catch {
    return null;
  }
}
