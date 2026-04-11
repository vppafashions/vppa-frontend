import { useDocumentHead } from '../hooks/useDocumentHead';
import { Link } from 'react-router-dom';

export function ContactPage() {
  useDocumentHead({
    title: 'Contact Us | VPPA Fashions',
    description: 'Get in touch with VPPA Fashions. Visit our store in Bengaluru or reach us by phone. We\'re here to help with orders, returns, and styling advice.',
    canonical: 'https://vppafashions.com/contact',
  });

  return (
    <main className="bg-background">
      <section className="py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-magazine italic text-5xl md:text-7xl mb-12 font-light text-center">Contact Us</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h2 className="text-sm uppercase tracking-widest font-semibold text-primary mb-4">Our Store</h2>
                <address className="not-italic text-muted-foreground leading-relaxed">
                  <p>No.161/1, Ground Floor,</p>
                  <p>100 Feet Rd, 3rd Block,</p>
                  <p>Sir M Vishveswaraya Layout,</p>
                  <p>Ullal, Bengaluru, Karnataka 560110</p>
                </address>
              </div>

              <div>
                <h2 className="text-sm uppercase tracking-widest font-semibold text-primary mb-4">Phone</h2>
                <p className="text-muted-foreground">
                  <a href="tel:+919071691999" className="hover:text-foreground transition-colors">+91 90716 91999</a>
                </p>
              </div>

              <div>
                <h2 className="text-sm uppercase tracking-widest font-semibold text-primary mb-4">Email</h2>
                <p className="text-muted-foreground">
                  <a href="mailto:support@vppafashions.com" className="hover:text-foreground transition-colors">support@vppafashions.com</a>
                </p>
              </div>

              <div>
                <h2 className="text-sm uppercase tracking-widest font-semibold text-primary mb-4">Business Hours</h2>
                <p className="text-muted-foreground">Monday – Saturday: 10:00 AM – 8:00 PM</p>
                <p className="text-muted-foreground">Sunday: 11:00 AM – 6:00 PM</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-sm uppercase tracking-widest font-semibold text-primary mb-4">Follow Us</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li><a href="https://www.instagram.com/vppafashions" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Instagram</a></li>
                  <li><a href="https://www.facebook.com/vppafashions" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Facebook</a></li>
                  <li><a href="https://x.com/vppafashions" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Twitter / X</a></li>
                  <li><a href="https://www.pinterest.com/vppafashions" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Pinterest</a></li>
                </ul>
              </div>

              <div>
                <h2 className="text-sm uppercase tracking-widest font-semibold text-primary mb-4">GSTIN</h2>
                <p className="text-muted-foreground">29DLFPG6129H1ZY</p>
              </div>
            </div>
          </div>

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
