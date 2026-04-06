// Vercel Serverless Function: Orders operations via Appwrite API key
import { corsHeaders, listDocuments, getDocument, createDocument, COLLECTION_IDS, Query } from './_appwrite.js';

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const collectionId = COLLECTION_IDS.orders;

  try {
    // GET /api/orders?userId=xxx — list user orders
    // GET /api/orders?orderId=xxx — get single order
    if (req.method === 'GET') {
      const { userId, orderId } = req.query;

      if (orderId) {
        const doc = await getDocument(collectionId, orderId);
        return res.status(200).json(doc);
      }

      if (!userId) return res.status(400).json({ error: 'userId or orderId required' });

      const data = await listDocuments(collectionId, [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(50),
      ]);
      return res.status(200).json(data);
    }

    // POST /api/orders — create order
    if (req.method === 'POST') {
      const { customerName, email, phone, address, items, total, status, notes, userId, razorpayPaymentId, razorpayOrderId } = req.body;

      if (!customerName || !email) return res.status(400).json({ error: 'customerName and email required' });

      const payload = {};
      if (customerName) payload.customerName = customerName;
      if (email) payload.email = email;
      if (phone) payload.phone = phone;
      if (address) payload.address = address;
      if (items) payload.items = items;
      if (total !== undefined) payload.total = total;
      if (status) payload.status = status;
      if (notes) payload.notes = notes;
      if (userId) payload.userId = userId;
      if (razorpayPaymentId) payload.razorpayPaymentId = razorpayPaymentId;
      if (razorpayOrderId) payload.razorpayOrderId = razorpayOrderId;

      const permissions = userId
        ? [`read("user:${userId}")`, `update("user:${userId}")`]
        : [];

      const doc = await createDocument(collectionId, 'unique()', payload, permissions);

      // Send email notifications (fire and forget - don't block the response)
      try {
        const emailPayload = {
          type: 'new-order',
          customerName: doc.customerName,
          email: doc.email,
          phone: doc.phone,
          orderId: doc.$id,
          items: doc.items,
          total: doc.total,
          address: doc.address,
        };

        const PICA_SECRET = process.env.PICA_SECRET_KEY;
        const PICA_CONNECTION_KEY = process.env.PICA_GMAIL_CONNECTION_KEY;
        const PICA_ACTION_ID = 'conn_mod_def::GGXAjWkZO8U::uMc1LQIHTTKzeMm3rLL5gQ';
        const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'vppafashions@gmail.com';

        if (PICA_SECRET && PICA_CONNECTION_KEY) {
          const parsedItems = typeof doc.items === 'string' ? JSON.parse(doc.items) : doc.items || [];

          // Build admin notification email
          const itemsHtml = parsedItems.map((item) =>
            `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.name}${item.size ? ` (${item.size})` : ''}${item.color ? ` - ${item.color}` : ''}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">&#8377;${(item.price * item.quantity).toLocaleString('en-IN')}</td></tr>`
          ).join('');

          const adminHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;"><div style="max-width:600px;margin:0 auto;padding:20px;"><div style="background:#000;padding:24px;text-align:center;border-radius:12px 12px 0 0;"><h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px;">VPPA FASHIONS</h1><p style="color:#9ca3af;margin:4px 0 0;font-size:14px;">New Order Received</p></div><div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);"><div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:16px;margin-bottom:24px;"><p style="margin:0;color:#065f46;font-weight:600;font-size:16px;">New Order #${doc.$id.slice(0, 8)}</p><p style="margin:4px 0 0;color:#065f46;">Total: &#8377;${(doc.total || 0).toLocaleString('en-IN')}</p></div><h3 style="color:#374151;margin:0 0 12px;">Customer Details</h3><table style="width:100%;margin-bottom:20px;"><tr><td style="padding:4px 0;color:#6b7280;width:100px;">Name</td><td style="padding:4px 0;color:#111827;font-weight:500;">${doc.customerName}</td></tr><tr><td style="padding:4px 0;color:#6b7280;">Email</td><td style="padding:4px 0;color:#111827;font-weight:500;">${doc.email}</td></tr><tr><td style="padding:4px 0;color:#6b7280;">Phone</td><td style="padding:4px 0;color:#111827;font-weight:500;">${doc.phone || 'N/A'}</td></tr><tr><td style="padding:4px 0;color:#6b7280;vertical-align:top;">Address</td><td style="padding:4px 0;color:#111827;font-weight:500;">${doc.address || 'N/A'}</td></tr></table><h3 style="color:#374151;margin:0 0 12px;">Order Items</h3><table style="width:100%;border-collapse:collapse;margin:0 0 16px;"><thead><tr style="background:#f9fafb;"><th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Item</th><th style="padding:8px 12px;text-align:center;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Qty</th><th style="padding:8px 12px;text-align:right;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Amount</th></tr></thead><tbody>${itemsHtml}</tbody><tfoot><tr><td colspan="2" style="padding:12px;text-align:right;font-weight:700;font-size:15px;border-top:2px solid #e5e7eb;">Total</td><td style="padding:12px;text-align:right;font-weight:700;font-size:15px;border-top:2px solid #e5e7eb;">&#8377;${(doc.total || 0).toLocaleString('en-IN')}</td></tr></tfoot></table><p style="color:#6b7280;font-size:13px;text-align:center;"><a href="https://backoffice.vppafashions.com/dashboard/orders" style="color:#3b82f6;text-decoration:none;font-weight:600;">View in Backoffice &rarr;</a></p></div></div></body></html>`;

          const customerHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;"><div style="max-width:600px;margin:0 auto;padding:20px;"><div style="background:#000;padding:24px;text-align:center;border-radius:12px 12px 0 0;"><h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px;">VPPA FASHIONS</h1></div><div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);"><div style="text-align:center;margin-bottom:24px;"><span style="display:inline-block;background:#22c55e;color:#fff;padding:6px 16px;border-radius:20px;font-size:14px;font-weight:600;">Order Placed Successfully</span></div><p style="color:#374151;font-size:16px;line-height:1.6;">Hi ${doc.customerName},</p><p style="color:#374151;font-size:16px;line-height:1.6;">Thank you for your order! We've received your order and will process it shortly.</p><p style="color:#6b7280;font-size:14px;">Order ID: <strong>${doc.$id.slice(0, 8)}</strong></p><table style="width:100%;border-collapse:collapse;margin:16px 0;"><thead><tr style="background:#f9fafb;"><th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Item</th><th style="padding:8px 12px;text-align:center;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Qty</th><th style="padding:8px 12px;text-align:right;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Amount</th></tr></thead><tbody>${itemsHtml}</tbody><tfoot><tr><td colspan="2" style="padding:12px;text-align:right;font-weight:700;font-size:15px;border-top:2px solid #e5e7eb;">Total</td><td style="padding:12px;text-align:right;font-weight:700;font-size:15px;border-top:2px solid #e5e7eb;">&#8377;${(doc.total || 0).toLocaleString('en-IN')}</td></tr></tfoot></table><p style="color:#374151;font-size:14px;line-height:1.6;">You can track your order status anytime in your <a href="https://vppafashions.com/my-orders" style="color:#3b82f6;text-decoration:none;font-weight:600;">My Orders</a> page.</p><hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/><p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">VPPA Fashions | Ground Floor, Sir M, No.161, Visvesvaraya Layout, Jnana Ganga Nagar, Ullal, Bengaluru, Karnataka 560110<br/>Email: vppafashions@gmail.com</p></div></div></body></html>`;

          // Send admin email
          fetch('https://api.picaos.com/v1/passthrough/gmail/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-pica-secret': PICA_SECRET,
              'x-pica-connection-key': PICA_CONNECTION_KEY,
              'x-pica-action-id': PICA_ACTION_ID,
            },
            body: JSON.stringify({
              to: ADMIN_EMAIL,
              subject: `New Order Received! #${doc.$id.slice(0, 8)} - ₹${(doc.total || 0).toLocaleString('en-IN')}`,
              body: adminHtml,
              connectionKey: PICA_CONNECTION_KEY,
            }),
          }).catch((e) => console.error('Admin email failed:', e));

          // Send customer confirmation email
          if (doc.email) {
            fetch('https://api.picaos.com/v1/passthrough/gmail/send-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-pica-secret': PICA_SECRET,
                'x-pica-connection-key': PICA_CONNECTION_KEY,
                'x-pica-action-id': PICA_ACTION_ID,
              },
              body: JSON.stringify({
                to: doc.email,
                subject: `VPPA Fashions - Order Confirmed | Order #${doc.$id.slice(0, 8)}`,
                body: customerHtml,
                connectionKey: PICA_CONNECTION_KEY,
              }),
            }).catch((e) => console.error('Customer email failed:', e));
          }
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail the order creation if email fails
      }

      return res.status(201).json(doc);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Orders API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
