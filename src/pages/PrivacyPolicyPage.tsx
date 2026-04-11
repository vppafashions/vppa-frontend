import { useDocumentHead } from '../hooks/useDocumentHead';
import { Link } from 'react-router-dom';

export function PrivacyPolicyPage() {
  useDocumentHead({
    title: 'Privacy Policy | VPPA Fashions',
    description: 'VPPA Fashions privacy policy. Learn how we collect, use, and protect your personal information when you shop with us.',
    canonical: 'https://vppafashions.com/privacy-policy',
  });

  return (
    <main className="bg-background">
      <section className="py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-magazine italic text-5xl md:text-7xl mb-12 font-light text-center">Privacy Policy</h1>

          <article className="text-muted-foreground leading-relaxed space-y-8">
            <p className="text-sm text-muted-foreground/70">Last updated: April 2026</p>

            <h2 className="text-xl font-semibold text-foreground !mt-12">1. Information We Collect</h2>
            <p>We collect information you provide directly, including your name, email address, shipping address, phone number, and payment details when you place an order. We also collect browsing data through cookies and analytics tools to improve your shopping experience.</p>

            <h2 className="text-xl font-semibold text-foreground !mt-12">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process and fulfil your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Provide customer support</li>
              <li>Improve our website and product offerings</li>
              <li>Send promotional emails (with your consent)</li>
              <li>Prevent fraud and ensure security</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground !mt-12">3. Data Protection</h2>
            <p>We implement industry-standard security measures to protect your personal data. Payment information is processed securely through Razorpay and is never stored on our servers. All data transmission is encrypted using SSL/TLS.</p>

            <h2 className="text-xl font-semibold text-foreground !mt-12">4. Cookies</h2>
            <p>We use cookies and similar technologies to enhance your browsing experience, analyse site traffic, and personalise content. You can manage cookie preferences through our cookie consent banner or your browser settings.</p>

            <h2 className="text-xl font-semibold text-foreground !mt-12">5. Third-Party Services</h2>
            <p>We use trusted third-party services including Razorpay for payments, Google Analytics for site analytics, and Cloudinary for image hosting. These services have their own privacy policies governing the use of your information.</p>

            <h2 className="text-xl font-semibold text-foreground !mt-12">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. You may also opt out of marketing communications at any time by clicking the unsubscribe link in our emails or contacting us directly.</p>

            <h2 className="text-xl font-semibold text-foreground !mt-12">7. Contact Us</h2>
            <p>For any privacy-related queries, please contact us at <a href="mailto:support@vppafashions.com" className="text-primary hover:text-foreground transition-colors">support@vppafashions.com</a> or call +91 90716 91999.</p>
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
