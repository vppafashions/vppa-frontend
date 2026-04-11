import { useDocumentHead } from '../hooks/useDocumentHead';
import { Link } from 'react-router-dom';

export function ShippingReturnsPage() {
  useDocumentHead({
    title: 'Shipping & Returns | VPPA Fashions',
    description: 'VPPA Fashions shipping and returns policy. Free express shipping across India. Easy 14-day returns with full refund.',
    canonical: 'https://vppafashions.com/shipping-returns',
  });

  return (
    <main className="bg-background">
      <section className="py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-magazine italic text-5xl md:text-7xl mb-12 font-light text-center">Shipping & Returns</h1>

          <article className="text-muted-foreground leading-relaxed space-y-8">
            <h2 className="text-xl font-semibold text-foreground !mt-12">Shipping Policy</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li>Complimentary express shipping on all orders across India</li>
              <li>Orders are dispatched within 2-3 business days</li>
              <li>Estimated delivery: 5-7 business days depending on location</li>
              <li>You will receive a tracking number via email once your order ships</li>
              <li>We currently ship within India only</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground !mt-12">Return Policy</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li>Returns accepted within 14 days of delivery</li>
              <li>Items must be unworn, unwashed, and in original condition</li>
              <li>All tags must be attached and original packaging intact</li>
              <li>To initiate a return, visit your <Link to="/orders" className="text-primary hover:text-foreground transition-colors">orders page</Link> and select the item</li>
              <li>Refunds are processed within 7-10 business days after receiving the return</li>
              <li>Refunds are credited to the original payment method</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground !mt-12">Exchanges</h2>
            <p>For size exchanges, please initiate a return and place a new order for the desired size. This ensures the fastest processing time.</p>

            <h2 className="text-xl font-semibold text-foreground !mt-12">Damaged or Defective Items</h2>
            <p>If you receive a damaged or defective item, please contact us within 48 hours of delivery at <a href="mailto:support@vppafashions.com" className="text-primary hover:text-foreground transition-colors">support@vppafashions.com</a> or call +91 90716 91999. We will arrange a free pickup and replacement or full refund.</p>
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
