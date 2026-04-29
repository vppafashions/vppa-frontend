// Vercel Serverless Function: Razorpay payments (create order + verify signature)
// Merged from create-order.js and verify-payment.js to stay within Vercel Hobby 12-function limit
// Usage: POST /api/payments?action=create-order | POST /api/payments?action=verify-payment

import crypto from 'crypto';
import { listDocuments, COLLECTION_IDS, Query } from './_appwrite.js';

function parseVariantInventory(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* ignore */ }
  return [];
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const action = req.query.action;

  if (action === 'create-order') {
    return handleCreateOrder(req, res);
  } else if (action === 'verify-payment') {
    return handleVerifyPayment(req, res);
  } else {
    return res.status(400).json({ error: 'Invalid action. Use ?action=create-order or ?action=verify-payment' });
  }
}

async function handleCreateOrder(req, res) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(500).json({ error: 'Razorpay keys not configured' });
  }

  try {
    const { amount, currency, receipt, notes, items } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Server-side stock validation before creating Razorpay order
    if (items && Array.isArray(items) && items.length > 0) {
      const outOfStockItems = [];
      for (const item of items) {
        if (!item.productId) continue;
        try {
          const data = await listDocuments(COLLECTION_IDS.products, [
            Query.equal('$id', item.productId),
            Query.limit(1),
          ]);
          if (data.documents.length > 0) {
            const product = data.documents[0];
            const variantInv = parseVariantInventory(product.variantInventory);

            if (item.size && item.color && variantInv.length > 0) {
              const match = variantInv.find(
                (v) => v.size.toLowerCase() === item.size.toLowerCase() &&
                       v.color.toLowerCase() === item.color.toLowerCase()
              );
              const variantStock = match ? match.stock : 0;
              if (variantStock < (item.quantity || 1)) {
                outOfStockItems.push({
                  name: item.name || item.productId,
                  requested: item.quantity || 1,
                  available: variantStock,
                });
              }
            } else {
              const stock = product.stockQuantity ?? 999;
              if (product.inStock === false || stock < (item.quantity || 1)) {
                outOfStockItems.push({
                  name: item.name || item.productId,
                  requested: item.quantity || 1,
                  available: product.inStock === false ? 0 : stock,
                });
              }
            }
          }
        } catch (stockErr) {
          console.error('Stock check error for', item.productId, stockErr);
        }
      }

      if (outOfStockItems.length > 0) {
        return res.status(400).json({
          error: 'Some items are out of stock',
          outOfStockItems,
        });
      }
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount),
        currency: currency || 'INR',
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: notes || {},
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay order creation failed:', data);
      return res.status(response.status).json({
        error: data.error?.description || 'Failed to create Razorpay order',
      });
    }

    return res.status(200).json({
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      key_id: keyId,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleVerifyPayment(req, res) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return res.status(500).json({ error: 'Razorpay key secret not configured' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required payment parameters' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      console.error('Payment signature verification failed', {
        razorpay_order_id,
        razorpay_payment_id,
      });
      return res.status(400).json({
        verified: false,
        error: 'Payment signature verification failed',
      });
    }

    return res.status(200).json({
      verified: true,
      razorpay_order_id,
      razorpay_payment_id,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
