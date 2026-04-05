// Razorpay Standard Checkout Integration
// Flow per docs: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
// 1. Server creates Razorpay order (POST /api/create-order)
// 2. Frontend opens checkout with order_id
// 3. Server verifies payment signature (POST /api/verify-payment)

interface PaymentOptions {
  amount: number; // in rupees (will be converted to paise)
  receipt?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
}

export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  verified: boolean;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: Record<string, unknown>) => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Step 1: Create order on server (server calls Razorpay Orders API with key_secret)
async function createRazorpayOrder(amountInPaise: number, receipt?: string, notes?: Record<string, string>) {
  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }

  return response.json() as Promise<{
    id: string;
    amount: number;
    currency: string;
    key_id: string;
  }>;
}

// Step 3: Verify payment signature on server (server uses HMAC SHA256 with key_secret)
async function verifyPaymentSignature(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Payment verification failed');
  }

  return response.json() as Promise<{
    verified: boolean;
    razorpay_order_id: string;
    razorpay_payment_id: string;
  }>;
}

// Main payment function following Razorpay Standard Checkout flow
export async function initiateRazorpayPayment(
  options: PaymentOptions
): Promise<RazorpayPaymentResult> {
  // Load Razorpay checkout script
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error('Razorpay SDK failed to load');
  }

  // Step 1: Create order on server
  const amountInPaise = Math.round(options.amount * 100);
  const order = await createRazorpayOrder(
    amountInPaise,
    options.receipt,
    options.notes
  );

  // Step 2: Open Razorpay Checkout with order_id (mandatory per docs)
  return new Promise((resolve, reject) => {
    const rzpOptions = {
      key: order.key_id, // Public key returned from server
      amount: order.amount,
      currency: order.currency,
      name: 'VPPA Fashions',
      description: 'Purchase from VPPA Fashions',
      order_id: order.id, // Razorpay order_id — mandatory per docs
      prefill: {
        name: options.prefill?.name || '',
        email: options.prefill?.email || '',
        contact: options.prefill?.contact || '',
      },
      notes: options.notes || {},
      theme: { color: '#000000' },
      handler: async (response: Record<string, string>) => {
        try {
          // Step 3: Verify payment signature on server
          const verification = await verifyPaymentSignature({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verification.verified) {
            resolve({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              verified: true,
            });
          } else {
            reject(new Error('Payment signature verification failed'));
          }
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled by user'));
        },
      },
    };

    const rzp = new window.Razorpay(rzpOptions as unknown as Record<string, unknown>);
    rzp.on('payment.failed', (response: Record<string, unknown>) => {
      const error = response.error as Record<string, unknown> | undefined;
      reject(new Error((error?.description as string) || 'Payment failed'));
    });
    rzp.open();
  });
}
