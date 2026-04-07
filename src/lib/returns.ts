export interface ReturnItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export interface ReturnRequestData {
  orderId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: ReturnItem[];
  reason: string;
  reasonDetails: string;
  refundAmount: number;
  originalPaymentId: string;
}

export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'picked_up' | 'refunded';

export interface ReturnDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  orderId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: string;
  reason: string;
  reasonDetails: string;
  status: ReturnStatus;
  refundAmount: number;
  refundMethod: string;
  razorpayRefundId: string;
  adminNotes: string;
  statusTimeline: string;
  originalPaymentId: string;
}

export interface ReturnStatusTimeline {
  requested?: string;
  approved?: string;
  rejected?: string;
  picked_up?: string;
  refunded?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function createReturnRequest(data: ReturnRequestData): Promise<ReturnDocument | null> {
  try {
    const response = await fetch(`${API_BASE}/api/returns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        items: JSON.stringify(data.items),
      }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to create return request:', error);
    return null;
  }
}

export async function getUserReturns(userId: string): Promise<ReturnDocument[]> {
  try {
    const response = await fetch(`${API_BASE}/api/returns?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.documents || [];
  } catch {
    return [];
  }
}
