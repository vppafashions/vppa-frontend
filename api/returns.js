// Vercel Serverless Function: Returns/Refunds operations via Appwrite API key
import { corsHeaders, listDocuments, createDocument, getDocument, COLLECTION_IDS, Query } from './_appwrite.js';

const PICA_API_URL = 'https://api.picaos.com/v1/passthrough/gmail/send-email';
const PICA_SECRET = process.env.PICA_SECRET_KEY;
const PICA_CONNECTION_KEY = process.env.PICA_GMAIL_CONNECTION_KEY;
const PICA_ACTION_ID = 'conn_mod_def::GGXAjWkZO8U::uMc1LQIHTTKzeMm3rLL5gQ';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'vppafashions@gmail.com';

async function sendEmail(to, subject, body) {
  const response = await fetch(PICA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-pica-secret': PICA_SECRET,
      'x-pica-connection-key': PICA_CONNECTION_KEY,
      'x-pica-action-id': PICA_ACTION_ID,
    },
    body: JSON.stringify({
      to,
      subject,
      body,
      mimeType: 'text/html',
      connectionKey: PICA_CONNECTION_KEY,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Pica email failed: ${err}`);
  }

  return response.json();
}

function buildReturnRequestAdminEmail(customerName, email, phone, orderId, returnId, items, reason, reasonDetails) {
  const parsedItems = typeof items === 'string' ? JSON.parse(items) : items || [];

  const itemsHtml = parsedItems
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.name}${item.size ? ` (${item.size})` : ''}${item.color ? ` - ${item.color}` : ''}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">&#8377;${(item.price * item.quantity).toLocaleString('en-IN')}</td>
        </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#000;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px;">VPPA FASHIONS</h1>
      <p style="color:#9ca3af;margin:4px 0 0;font-size:14px;">New Return Request</p>
    </div>
    <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;color:#92400e;font-weight:600;font-size:16px;">Return Request #${returnId.slice(0, 8)}</p>
        <p style="margin:4px 0 0;color:#92400e;">Order #${orderId.slice(0, 8)}</p>
      </div>
      <h3 style="color:#374151;margin:0 0 12px;">Customer Details</h3>
      <table style="width:100%;margin-bottom:20px;">
        <tr><td style="padding:4px 0;color:#6b7280;width:100px;">Name</td><td style="padding:4px 0;color:#111827;font-weight:500;">${customerName}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Email</td><td style="padding:4px 0;color:#111827;font-weight:500;">${email}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Phone</td><td style="padding:4px 0;color:#111827;font-weight:500;">${phone || 'N/A'}</td></tr>
      </table>
      <h3 style="color:#374151;margin:0 0 8px;">Reason</h3>
      <p style="color:#374151;margin:0 0 4px;"><strong>${reason}</strong></p>
      ${reasonDetails ? `<p style="color:#6b7280;margin:0 0 20px;font-size:14px;">${reasonDetails}</p>` : ''}
      <h3 style="color:#374151;margin:0 0 12px;">Items to Return</h3>
      <table style="width:100%;border-collapse:collapse;margin:0 0 16px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Item</th>
            <th style="padding:8px 12px;text-align:center;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="color:#6b7280;font-size:13px;text-align:center;">
        <a href="https://backoffice.vppafashions.com/dashboard/returns" style="color:#3b82f6;text-decoration:none;font-weight:600;">Review in Backoffice &rarr;</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function buildReturnRequestCustomerEmail(customerName, orderId, returnId, items, reason) {
  const parsedItems = typeof items === 'string' ? JSON.parse(items) : items || [];

  const itemsHtml = parsedItems
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.name}${item.size ? ` (${item.size})` : ''}${item.color ? ` - ${item.color}` : ''}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">&#8377;${(item.price * item.quantity).toLocaleString('en-IN')}</td>
        </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#000;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px;">VPPA FASHIONS</h1>
    </div>
    <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="display:inline-block;background:#f59e0b;color:#fff;padding:6px 16px;border-radius:20px;font-size:14px;font-weight:600;">Return Request Submitted</span>
      </div>
      <p style="color:#374151;font-size:16px;line-height:1.6;">Hi ${customerName},</p>
      <p style="color:#374151;font-size:16px;line-height:1.6;">We've received your return request for Order #${orderId.slice(0, 8)}. Our team will review it and get back to you shortly.</p>
      <p style="color:#6b7280;font-size:14px;">Return ID: <strong>${returnId.slice(0, 8)}</strong></p>
      <p style="color:#6b7280;font-size:14px;">Reason: <strong>${reason}</strong></p>
      <h3 style="color:#374151;margin:16px 0 12px;font-size:15px;">Items Requested for Return</h3>
      <table style="width:100%;border-collapse:collapse;margin:0 0 16px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Item</th>
            <th style="padding:8px 12px;text-align:center;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="color:#374151;font-size:14px;line-height:1.6;">You can track your return status in your <a href="https://vppafashions.com/orders" style="color:#3b82f6;text-decoration:none;font-weight:600;">My Orders</a> page.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
        VPPA Fashions | No.161/1, Ground Floor, 100 Feet Rd, 3rd Block, Sir M Vishveswaraya Layout, Ullal, Bengaluru, Karnataka 560110
        <br/>Phone: +91 90716 91999 | GSTIN: 29DLFPG6129H1ZY
        <br/>Email: vppafashions@gmail.com
      </p>
    </div>
  </div>
</body>
</html>`;
}

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const collectionId = COLLECTION_IDS.returns;

  try {
    // GET /api/returns?userId=xxx — list user's return requests
    if (req.method === 'GET') {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: 'userId required' });

      const data = await listDocuments(collectionId, [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(50),
      ]);
      return res.status(200).json(data);
    }

    // POST /api/returns — create return request
    if (req.method === 'POST') {
      const {
        orderId,
        userId,
        customerName,
        customerEmail,
        customerPhone,
        items,
        reason,
        reasonDetails,
        refundAmount,
        originalPaymentId,
      } = req.body;

      if (!orderId || !userId || !customerName || !customerEmail) {
        return res.status(400).json({ error: 'orderId, userId, customerName, and customerEmail are required' });
      }

      const now = new Date().toISOString();
      const timeline = JSON.stringify({ requested: now });

      const payload = {
        orderId,
        userId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || '',
        items: typeof items === 'string' ? items : JSON.stringify(items || []),
        reason: reason || '',
        reasonDetails: reasonDetails || '',
        status: 'requested',
        refundAmount: refundAmount || 0,
        refundMethod: '',
        razorpayRefundId: '',
        adminNotes: '',
        statusTimeline: timeline,
        originalPaymentId: originalPaymentId || '',
      };

      const permissions = [
        `read("user:${userId}")`,
        `update("user:${userId}")`,
      ];

      const doc = await createDocument(collectionId, 'unique()', payload, permissions);

      // Send email notifications (fire and forget)
      try {
        if (PICA_SECRET && PICA_CONNECTION_KEY) {
          const emailPromises = [];

          // Admin notification
          emailPromises.push(
            sendEmail(
              ADMIN_EMAIL,
              `Return Request Received - Order #${orderId.slice(0, 8)} | Return #${doc.$id.slice(0, 8)}`,
              buildReturnRequestAdminEmail(customerName, customerEmail, customerPhone, orderId, doc.$id, items, reason, reasonDetails)
            ).catch((e) => console.error('Admin return email failed:', e))
          );

          // Customer confirmation
          if (customerEmail) {
            emailPromises.push(
              sendEmail(
                customerEmail,
                `VPPA Fashions - Return Request Received | Order #${orderId.slice(0, 8)}`,
                buildReturnRequestCustomerEmail(customerName, orderId, doc.$id, items, reason)
              ).catch((e) => console.error('Customer return email failed:', e))
            );
          }

          await Promise.allSettled(emailPromises);
        }
      } catch (emailError) {
        console.error('Return email notification error:', emailError);
      }

      return res.status(201).json(doc);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Returns API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
