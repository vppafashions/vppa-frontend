import React from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { CollectionShowcase } from '../components/home/CollectionShowcase';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useDocumentHead } from '../hooks/useDocumentHead';
export function HomePage() {
  useDocumentHead({
    title: 'VPPA Fashions — Premium Men\'s Clothing | Velocity, Presence, Power, Attitude',
    description: 'VPPA Fashions — India\'s premium men\'s clothing brand. Shop luxury sweatshirts, linen shirts, hoodies, cargo pants & full-sleeve shirts.',
    canonical: 'https://vppafashions.com/',
  });

  return (
    <main className="bg-background">
      <HeroBanner />

      {/* Brand Manifesto */}
      <section className="py-32 md:py-48 px-4 border-b border-border/30">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="font-magazine italic text-4xl md:text-6xl lg:text-7xl leading-tight md:leading-tight lg:leading-tight font-light text-foreground mb-12">
            "We don't follow trends. We set the standard. Every stitch, every
            fabric, every silhouette — crafted for men who lead, not follow."
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="w-8 h-px bg-primary"></div>
            <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground">
              The House of VPPA
            </p>
            <div className="w-8 h-px bg-primary"></div>
          </div>
        </div>
      </section>

      <CollectionShowcase />

      {/* Editorial Break */}
      <section className="py-32 md:py-40 bg-[#0a0a0a] text-white text-center px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-magazine italic text-5xl md:text-7xl lg:text-8xl mb-8 font-light text-white/90">
            Four Pillars. One Vision.
          </h2>
          <p className="text-xs md:text-sm tracking-[0.4em] uppercase text-primary">
            Velocity · Presence · Power · Attitude
          </p>
        </div>
      </section>

      <FeaturedProducts />

      {/* Brand Story — SEO Content Section */}
      <section className="py-24 md:py-32 px-4 border-t border-border/30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="font-magazine italic text-4xl md:text-5xl mb-8 font-light">Premium Men's Fashion, Crafted in India</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                VPPA Fashions is India's fastest-growing premium menswear brand, offering luxury sweatshirts, linen shirts, hoodies, cargo pants, and designer full-sleeve shirts. Every piece is meticulously crafted using premium imported fabrics, ensuring unmatched comfort, durability, and style.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our collections are designed for the modern Indian man who values quality over quantity. From boardroom meetings to weekend getaways, VPPA clothing transitions effortlessly across occasions while maintaining a distinctive edge that sets you apart.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Based in Bengaluru, Karnataka, we combine global fashion trends with Indian craftsmanship. Each garment undergoes rigorous quality checks, from fabric selection to final stitching, ensuring that every VPPA product meets our exacting standards.
              </p>
            </div>
            <div>
              <h2 className="font-magazine italic text-4xl md:text-5xl mb-8 font-light">Why Choose VPPA?</h2>
              <ul className="space-y-6 text-muted-foreground">
                <li className="flex gap-4">
                  <span className="text-primary font-semibold text-lg">01</span>
                  <div>
                    <h3 className="text-foreground font-medium mb-1">Premium Fabrics</h3>
                    <p className="leading-relaxed">Sourced from the finest mills worldwide — organic cotton, Belgian linen, and performance blends that feel as good as they look.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary font-semibold text-lg">02</span>
                  <div>
                    <h3 className="text-foreground font-medium mb-1">Designed in Bengaluru</h3>
                    <p className="leading-relaxed">Every design is conceptualised in-house by our creative team, drawing inspiration from global fashion capitals while staying true to Indian sensibilities.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary font-semibold text-lg">03</span>
                  <div>
                    <h3 className="text-foreground font-medium mb-1">Free Express Shipping</h3>
                    <p className="leading-relaxed">Complimentary express shipping across India on every order, with tracking and secure packaging to ensure your garments arrive in perfect condition.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary font-semibold text-lg">04</span>
                  <div>
                    <h3 className="text-foreground font-medium mb-1">Easy Returns</h3>
                    <p className="leading-relaxed">14-day hassle-free returns with full refund. No questions asked — your satisfaction is our priority.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-32 md:py-40 bg-accent/5 border-t border-border/30">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <span className="text-xs tracking-[0.4em] uppercase text-primary mb-6 block">
            The Inner Circle
          </span>
          <h2 className="font-magazine italic text-5xl md:text-6xl mb-8 font-light">
            Stay in the Know
          </h2>
          <p className="text-muted-foreground mb-12 font-light leading-relaxed">
            Subscribe to receive exclusive editorial content, early access to
            new collections, and private invitations to VPPA events.
          </p>
          <form
            className="flex flex-col md:flex-row gap-4 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}>
            
            <Input
              type="email"
              placeholder="Email Address"
              className="flex-1 text-center md:text-left h-14 border-border/50 bg-transparent focus-visible:border-foreground" />
            
            <Button
              type="submit"
              variant="primary"
              className="h-14 px-10 tracking-[0.2em]">
              
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </main>);

}
