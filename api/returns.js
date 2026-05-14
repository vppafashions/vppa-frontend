// Vercel Serverless Function: Returns/Refunds operations via Appwrite API key
import { corsHeaders, listDocuments, createDocument, getDocument, COLLECTION_IDS, Query } from './_appwrite.js';

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

function buildReturnRequestAdminEmail(customerName, email, phone, orderId, returnId, items, reason, reasonDetails) {
  const lines = [
    `New return request #${returnId.slice(0, 8)} for order #${orderId.slice(0, 8)}`,
    '',
    `Customer: ${customerName}`,
    `Email: ${email}`,
    `Phone: ${phone || 'N/A'}`,
    '',
    `Reason: ${reason}`,
  ];
  if (reasonDetails) lines.push(`Details: ${reasonDetails}`);
  lines.push('');
  lines.push('Items to return:');
  lines.push(formatItemLines(items));
  lines.push('');
  lines.push('Review in backoffice: https://backoffice.vppafashions.com/dashboard/returns');
  return lines.join('\r\n');
}

function buildReturnRequestCustomerEmail(customerName, orderId, returnId, items, reason) {
  return [
    `Hi ${customerName},`,
    '',
    `We've received your return request for Order #${orderId.slice(0, 8)}. Our team will review it and get back to you shortly.`,
    '',
    `Return ID: #${returnId.slice(0, 8)}`,
    `Reason: ${reason}`,
    '',
    'Items requested for return:',
    formatItemLines(items),
    '',
    'You can track your return status at https://vppafashions.com/orders',
    SIGNATURE,
  ].join('\r\n');
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
