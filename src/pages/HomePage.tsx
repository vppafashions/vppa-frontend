import React from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { CollectionShowcase } from '../components/home/CollectionShowcase';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
export function HomePage() {
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