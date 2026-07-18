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
  statusTimeline?: string;
  /** Applied checkout coupon code, if any */
  couponCode?: string;
  /** Inclusive bill discount amount from coupon (INR) */
  discount?: number;
}

export interface StatusTimeline {
  [key: string]: string | undefined;
  pending?: string;
  confirmed?: string;
  shipped?: string;
  delivered?: string;
  cancelled?: string;
}

export interface OrderDocument extends OrderData {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function createOrder(data: OrderData): Promise<OrderDocument | null> {
  try {
    const response = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to create order:', error);
    return null;
  }
}

export async function getUserOrders(userId: string): Promise<OrderDocument[]> {
  try {
    const response = await fetch(`${API_BASE}/api/orders?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.documents || [];
  } catch {
    return [];
  }
}

export async function getOrderById(orderId: string): Promise<OrderDocument | null> {
  try {
    const response = await fetch(`${API_BASE}/api/orders?orderId=${encodeURIComponent(orderId)}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
