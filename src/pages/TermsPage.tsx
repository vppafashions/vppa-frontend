import { useDocumentHead } from '../hooks/useDocumentHead';
import { Link } from 'react-router-dom';

export function TermsPage() {
  useDocumentHead({
    title: 'Terms of Service | VPPA Fashions',
    description: 'VPPA Fashions terms of service. Read our terms and conditions for shopping, returns, and use of our website.',
    canonical: 'https://vppafashions.com/terms',
  });

  return (
    <main className="bg-background">
      <section className="py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-magazine italic text-5xl md:text-7xl mb-12 font-light text-center">Terms of Service</h1>

          <article className="text-muted-foreground leading-relaxed space-y-8">
            <p className="text-sm text-muted-foreground/70">Last updated: April 2026</p>

            <h2 className="text-xl font-semibold text-foreground !mt-12">1. General</h2>
            <p>By accessing and using vppafashions.com, you agree to these terms and conditions. VPPA Fashions reserves the right to modify these terms at any time without prior notice.</p>

            <h2 className="text-xl font-semibold text-foreground !mt-12">2. Products & Pricing</h2>
            <p>All products are subject to availability. Prices are listed in Indian Rupees (INR) and include applicable taxes. We reserve the right to change prices without notice. Product images are for illustration purposes; actual colours may vary slightly.</p>

            <h2 className="text-xl font-semibold text-foreground !mt-12">3. Orders & Payment</h2>
            <p>Orders are confirmed only after successful payment via Razorpay. We accept UPI, credit cards, debit cards, and net banking. An order confirmation email will be sent upon successful placement.</p>

            <h2 className="text-xl font-semibold text-foreground !mt-12">4. Shipping</h2>
            <p>We offer complimentary express shipping on all orders across India. Orders are typically dispatched within 2-3 business days. Delivery timelines may vary based on location and are estimated at 5-7 business days.</p>

            <h2 className="text-xl font-semibold text-foreground !mt-12">5. Returns & Exchanges</h2>
            <p>Returns are accepted within 14 days of delivery. Items must be in original condition with tags attached and in original packaging. To initiate a return, please visit your orders page or contact our support team. Refunds are processed within 7-10 business days after we receive the returned item.</p>

            <h2 className="text-xl font-semibold text-foreground !mt-12">6. Intellectual Property</h2>
            <p>All content on this website, including but not limited to text, images, logos, and designs, is the property of VPPA Fashions and is protected by copyright and trademark laws.</p>

            <h2 className="text-xl font-semibold text-foreground !mt-12">7. Limitation of Liability</h2>
            <p>VPPA Fashions shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our total liability shall not exceed the purchase price of the product in question.</p>

            <h2 className="text-xl font-semibold text-foreground !mt-12">8. Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.</p>

            <h2 className="text-xl font-semibold text-foreground !mt-12">9. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:support@vppafashions.com" className="text-primary hover:text-foreground transition-colors">support@vppafashions.com</a> or call +91 90716 91999.</p>
          </article>

          <div className="mt-16 text-center">
            <Link to="/" className="text-sm uppercase tracking-widest text-primary hover:text-foreground transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
