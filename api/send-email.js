// Vercel Serverless Function: Send email via Pica OS Gmail integration
import { corsHeaders } from './_appwrite.js';

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

function buildNewOrderAdminEmail(customerName, email, phone, orderId, items, total, address) {
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
      <p style="color:#9ca3af;margin:4px 0 0;font-size:14px;">New Order Received</p>
    </div>
    <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;color:#065f46;font-weight:600;font-size:16px;">New Order #${orderId.slice(0, 8)}</p>
        <p style="margin:4px 0 0;color:#065f46;">Total: &#8377;${total.toLocaleString('en-IN')}</p>
      </div>
      <h3 style="color:#374151;margin:0 0 12px;">Customer Details</h3>
      <table style="width:100%;margin-bottom:20px;">
        <tr><td style="padding:4px 0;color:#6b7280;width:100px;">Name</td><td style="padding:4px 0;color:#111827;font-weight:500;">${customerName}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Email</td><td style="padding:4px 0;color:#111827;font-weight:500;">${email}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Phone</td><td style="padding:4px 0;color:#111827;font-weight:500;">${phone || 'N/A'}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;vertical-align:top;">Address</td><td style="padding:4px 0;color:#111827;font-weight:500;">${address || 'N/A'}</td></tr>
      </table>
      <h3 style="color:#374151;margin:0 0 12px;">Order Items</h3>
      <table style="width:100%;border-collapse:collapse;margin:0 0 16px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Item</th>
            <th style="padding:8px 12px;text-align:center;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px;text-align:right;font-weight:700;font-size:15px;border-top:2px solid #e5e7eb;">Total</td>
            <td style="padding:12px;text-align:right;font-weight:700;font-size:15px;border-top:2px solid #e5e7eb;">&#8377;${total.toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>
      <p style="color:#6b7280;font-size:13px;text-align:center;">
        <a href="https://backoffice.vppafashions.com/dashboard/orders" style="color:#3b82f6;text-decoration:none;font-weight:600;">View in Backoffice &rarr;</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function buildOrderConfirmationEmail(customerName, orderId, items, total) {
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
        <span style="display:inline-block;background:#22c55e;color:#fff;padding:6px 16px;border-radius:20px;font-size:14px;font-weight:600;">Order Placed Successfully</span>
      </div>
      <p style="color:#374151;font-size:16px;line-height:1.6;">Hi ${customerName},</p>
      <p style="color:#374151;font-size:16px;line-height:1.6;">Thank you for your order! We've received your order and will process it shortly.</p>
      <p style="color:#6b7280;font-size:14px;">Order ID: <strong>${orderId.slice(0, 8)}</strong></p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Item</th>
            <th style="padding:8px 12px;text-align:center;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-size:13px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px;text-align:right;font-weight:700;font-size:15px;border-top:2px solid #e5e7eb;">Total</td>
            <td style="padding:12px;text-align:right;font-weight:700;font-size:15px;border-top:2px solid #e5e7eb;">&#8377;${total.toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>
      <p style="color:#374151;font-size:14px;line-height:1.6;">You can track your order status anytime in your <a href="https://vppafashions.com/my-orders" style="color:#3b82f6;text-decoration:none;font-weight:600;">My Orders</a> page.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
        VPPA Fashions | Ground Floor, Sir M, No.161, Visvesvaraya Layout, Jnana Ganga Nagar, Ullal, Bengaluru, Karnataka 560110
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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!PICA_SECRET || !PICA_CONNECTION_KEY) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  try {
    const { type, customerName, email, phone, orderId, items, total, address } = req.body;

    if (type === 'new-order') {
      // Send notification to admin
      const adminHtml = buildNewOrderAdminEmail(customerName, email, phone, orderId, items, total, address);
      const adminSubject = `New Order Received! #${orderId.slice(0, 8)} - ₹${(total || 0).toLocaleString('en-IN')}`;
      const adminResult = await sendEmail(ADMIN_EMAIL, adminSubject, adminHtml);

      // Also send order confirmation to customer
      let customerResult = null;
      if (email) {
        const customerHtml = buildOrderConfirmationEmail(customerName || 'Customer', orderId, items, total);
        const customerSubject = `VPPA Fashions - Order Confirmed | Order #${orderId.slice(0, 8)}`;
        customerResult = await sendEmail(email, customerSubject, customerHtml);
      }

      return res.status(200).json({ success: true, adminResult, customerResult });
    }

    return res.status(400).json({ error: 'Invalid email type' });
  } catch (error) {
    console.error('Send email error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send email' });
  }
}
