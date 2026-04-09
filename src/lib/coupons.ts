const API_BASE = import.meta.env.VITE_API_URL || '';

export interface CouponValidation {
  valid: boolean;
  couponId: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  discount: number;
  description: string;
  applicableProductIds: string[];
}

export interface CartItemForCoupon {
  productId: string;
  price: number;
  quantity: number;
}

export async function validateCoupon(
  code: string,
  cartItems: CartItemForCoupon[],
  cartTotal: number
): Promise<CouponValidation> {
  const res = await fetch(`${API_BASE}/api/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'validate',
      code,
      cartItems,
      cartTotal,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to validate coupon');
  }

  return res.json();
}

export async function applyCouponUsage(couponId: string): Promise<void> {
  await fetch(`${API_BASE}/api/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'apply',
      couponId,
    }),
  });
}
