import { COLLECTION_IDS, Query, listDocuments, updateDocument, corsHeaders } from './_appwrite.js';

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    try {
      const { action, code, cartItems, cartTotal } = req.body;

      if (action === 'validate') {
        // Find coupon by code
        const result = await listDocuments(COLLECTION_IDS.coupons, [
          Query.equal('code', code.toUpperCase().trim()),
          Query.limit(1),
        ]);

        if (result.documents.length === 0) {
          return res.status(404).json({ error: 'Invalid coupon code' });
        }

        const coupon = result.documents[0];

        // Check if active
        if (!coupon.active) {
          return res.status(400).json({ error: 'This coupon is no longer active' });
        }

        // Check expiry
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
          return res.status(400).json({ error: 'This coupon has expired' });
        }

        // Check usage limit
        if (coupon.usageLimit > 0 && (coupon.usedCount || 0) >= coupon.usageLimit) {
          return res.status(400).json({ error: 'This coupon has reached its usage limit' });
        }

        // Check minimum order amount
        if (coupon.minOrderAmount > 0 && cartTotal < coupon.minOrderAmount) {
          return res.status(400).json({
            error: `Minimum order amount is ₹${coupon.minOrderAmount.toLocaleString('en-IN')}`,
          });
        }

        // Check applicable products
        let applicableProductIds = [];
        if (coupon.applicableProductIds) {
          try {
            applicableProductIds = JSON.parse(coupon.applicableProductIds);
          } catch {
            // ignore
          }
        }

        if (applicableProductIds.length > 0 && cartItems) {
          const cartProductIds = cartItems.map((item) => item.productId);
          const hasApplicable = cartProductIds.some((id) => applicableProductIds.includes(id));
          if (!hasApplicable) {
            return res.status(400).json({
              error: 'This coupon is not applicable to any items in your cart',
            });
          }
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
          // If applicable to specific products, only discount those
          if (applicableProductIds.length > 0 && cartItems) {
            const applicableTotal = cartItems
              .filter((item) => applicableProductIds.includes(item.productId))
              .reduce((sum, item) => sum + item.price * item.quantity, 0);
            discount = Math.round(applicableTotal * (coupon.discountValue / 100));
          } else {
            discount = Math.round(cartTotal * (coupon.discountValue / 100));
          }
          // Apply max discount cap
          if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          // Flat discount
          discount = coupon.discountValue;
        }

        // Don't let discount exceed cart total
        if (discount > cartTotal) {
          discount = cartTotal;
        }

        return res.status(200).json({
          valid: true,
          couponId: coupon.$id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discount,
          description: coupon.description || '',
          applicableProductIds,
        });
      }

      if (action === 'apply') {
        // Increment usedCount when order is placed
        const { couponId } = req.body;
        if (!couponId) {
          return res.status(400).json({ error: 'Missing couponId' });
        }

        const coupon = await listDocuments(COLLECTION_IDS.coupons, [
          Query.equal('$id', couponId),
          Query.limit(1),
        ]).then((r) => r.documents[0]);

        if (coupon) {
          await updateDocument(COLLECTION_IDS.coupons, couponId, {
            usedCount: (coupon.usedCount || 0) + 1,
          });
        }

        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      console.error('Coupon error:', error);
      return res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
