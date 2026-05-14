// Vercel Serverless Function: Send email via Pica OS Gmail integration (plain text)
import { corsHeaders } from './_appwrite.js';

const PICA_API_URL = 'https://api.picaos.com/v1/passthrough/gmail/send-email';
const PICA_SECRET = process.env.PICA_SECRET_KEY;
const PICA_CONNECTION_KEY = process.env.PICA_GMAIL_CONNECTION_KEY;
const PICA_ACTION_ID = 'conn_mod_def::GGXAjWkZO8U::uMc1LQIHTTKzeMm3rLL5gQ';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'vppafashions@gmail.com';

const SIGNATURE = [
  '',
  '--',
  'VPPA Fashions',
  'No.161/1, Ground Floor, 100 Feet Rd, 3rd Block,',
  'Sir M Vishveswaraya Layout, Ullal, Bengaluru, Karnataka 560110',
  'Phone: +91 90716 91999 | GSTIN: 29DLFPG6129H1ZY',
  'Email: vppafashions@gmail.com',
].join('\r\n');

function buildRawMime(to, subject, textBody) {
  const mimeMessage = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    textBody,
  ].join('\r\n');

  return Buffer.from(mimeMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

async function sendEmail(to, subject, body) {
  const raw = buildRawMime(to, subject, body);

  const response = await fetch(PICA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-pica-secret': PICA_SECRET,
      'x-pica-connection-key': PICA_CONNECTION_KEY,
      'x-pica-action-id': PICA_ACTION_ID,
    },
    body: JSON.stringify({
      raw,
      connectionKey: PICA_CONNECTION_KEY,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Pica email failed: ${err}`);
  }

  return response.json();
}

function formatRupees(n) {
  return `Rs.${Number(n || 0).toLocaleString('en-IN')}`;
}

function formatItemLines(items) {
  const parsed = typeof items === 'string' ? JSON.parse(items) : items || [];
  if (!parsed.length) return '  (no items)';
  return parsed
    .map((item) => {
      const variant = [item.size, item.color].filter(Boolean).join(' / ');
      return `  - ${item.name}${variant ? ` (${variant})` : ''} x${item.quantity}   ${formatRupees(item.price * item.quantity)}`;
    })
    .join('\r\n');
}

function buildNewOrderAdminEmail(customerName, email, phone, orderId, items, total, address) {
  return [
    `New order #${orderId.slice(0, 8)}`,
    '',
    `Customer: ${customerName}`,
    `Email: ${email}`,
    `Phone: ${phone || 'N/A'}`,
    `Address: ${address || 'N/A'}`,
    '',
    'Items:',
    formatItemLines(items),
    '',
    `Total: ${formatRupees(total)}`,
    '',
    'Manage in backoffice: https://backoffice.vppafashions.com/dashboard/orders',
  ].join('\r\n');
}

function buildOrderConfirmationEmail(customerName, orderId, items, total) {
  return [
    `Hi ${customerName},`,
    '',
    "Thank you for your order with VPPA Fashions. We've received it and will process it shortly.",
    '',
    `Order Number: #${orderId.slice(0, 8)}`,
    '',
    'Items:',
    formatItemLines(items),
    '',
    `Total: ${formatRupees(total)}`,
    '',
    'Track your order anytime at https://vppafashions.com/my-orders',
    SIGNATURE,
  ].join('\r\n');
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
      const adminText = buildNewOrderAdminEmail(customerName, email, phone, orderId, items, total, address);
      const adminSubject = `New Order Received! #${orderId.slice(0, 8)} - Rs.${(total || 0).toLocaleString('en-IN')}`;
      const adminResult = await sendEmail(ADMIN_EMAIL, adminSubject, adminText);

      let customerResult = null;
      if (email) {
        const customerText = buildOrderConfirmationEmail(customerName || 'Customer', orderId, items, total);
        const customerSubject = `VPPA Fashions - Order Confirmed | Order #${orderId.slice(0, 8)}`;
        customerResult = await sendEmail(email, customerSubject, customerText);
      }

      return res.status(200).json({ success: true, adminResult, customerResult });
    }

    return res.status(400).json({ error: 'Invalid email type' });
  } catch (error) {
    console.error('Send email error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send email' });
  }
}
