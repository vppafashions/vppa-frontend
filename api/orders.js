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
        const PICA_SECRET = process.env.PICA_SECRET_KEY;
        const PICA_CONNECTION_KEY = process.env.PICA_GMAIL_CONNECTION_KEY;
        const PICA_ACTION_ID = 'conn_mod_def::GGXAjWkZO8U::uMc1LQIHTTKzeMm3rLL5gQ';
        const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'vppafashions@gmail.com';

        const buildRawMime = (to, subject, textBody) => {
          const mime = [
            `To: ${to}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            '',
            textBody,
          ].join('\r\n');
          return Buffer.from(mime)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/g, '');
        };

        if (PICA_SECRET && PICA_CONNECTION_KEY) {
          const parsedItems = typeof doc.items === 'string' ? JSON.parse(doc.items) : doc.items || [];
          const shortId = doc.$id.slice(0, 8);
          const totalStr = `Rs.${(doc.total || 0).toLocaleString('en-IN')}`;
          const paymentLine = doc.razorpayPaymentId
            ? `Payment ID: ${doc.razorpayPaymentId}\r\nPayment Status: Paid`
            : 'Payment Status: Cash on Delivery';

          const customerText = [
            `Hi ${doc.customerName || 'Customer'},`,
            '',
            'Thank you for your order with VPPA Fashions.',
            '',
            `Order Number: #${shortId}`,
            `Total: ${totalStr}`,
            paymentLine,
            '',
            'You can track your order anytime at https://vppafashions.com/my-orders',
            '',
            '- VPPA Fashions',
          ].join('\r\n');

          const adminItemLines = parsedItems
            .map((item) => {
              const variant = [item.size, item.color].filter(Boolean).join(' / ');
              const line = `- ${item.name}${variant ? ` (${variant})` : ''} x${item.quantity} = Rs.${(item.price * item.quantity).toLocaleString('en-IN')}`;
              return line;
            })
            .join('\r\n');

          const adminText = [
            `New order #${shortId}`,
            '',
            `Customer: ${doc.customerName}`,
            `Email: ${doc.email}`,
            `Phone: ${doc.phone || 'N/A'}`,
            `Address: ${doc.address || 'N/A'}`,
            '',
            'Items:',
            adminItemLines || '- (none)',
            '',
            `Total: ${totalStr}`,
            paymentLine,
            '',
            'Manage in backoffice: https://backoffice.vppafashions.com/dashboard/orders',
          ].join('\r\n');

          // Send plain text admin + customer emails in parallel.

          const sendPica = (to, subject, text) => fetch('https://api.picaos.com/v1/passthrough/gmail/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-pica-secret': PICA_SECRET,
              'x-pica-connection-key': PICA_CONNECTION_KEY,
              'x-pica-action-id': PICA_ACTION_ID,
            },
            body: JSON.stringify({
              raw: buildRawMime(to, subject, text),
              connectionKey: PICA_CONNECTION_KEY,
            }),
          });

          const emailPromises = [
            sendPica(
              ADMIN_EMAIL,
              `New Order #${shortId} - ${totalStr}`,
              adminText,
            ).catch((e) => console.error('Admin email failed:', e)),
          ];

          if (doc.email) {
            emailPromises.push(
              sendPica(
                doc.email,
                `VPPA Fashions - Order Confirmed #${shortId}`,
                customerText,
              ).catch((e) => console.error('Customer email failed:', e)),
            );
          }

          await Promise.allSettled(emailPromises);
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
