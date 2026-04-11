import { useDocumentHead } from '../hooks/useDocumentHead';
import { Link } from 'react-router-dom';

export function AboutPage() {
  useDocumentHead({
    title: 'About Us | VPPA Fashions',
    description: 'Learn about VPPA Fashions — India\'s premium men\'s clothing brand. Our story, mission, and the four pillars: Velocity, Presence, Power & Attitude.',
    canonical: 'https://vppafashions.com/about',
  });

  return (
    <main className="bg-background">
      <section className="py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-magazine italic text-5xl md:text-7xl mb-12 font-light text-center">About VPPA</h1>

          <article className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-8">
            <p className="text-lg md:text-xl leading-relaxed">
              VPPA Fashions is India's premium men's clothing brand, founded with a singular vision — to redefine modern masculinity through uncompromising quality and fearless expression. Every piece we create embodies our commitment to luxury craftsmanship and bold design.
            </p>

            <h2 className="font-magazine italic text-3xl md:text-4xl font-light text-foreground !mt-16 !mb-8">Our Four Pillars</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-border/30 p-8">
                <h3 className="text-lg font-semibold uppercase tracking-widest text-primary mb-4">Velocity</h3>
                <p>Built for those who never stand still. Every thread engineered for the relentless pursuit of momentum. Dynamic styles that move with you.</p>
              </div>
              <div className="border border-border/30 p-8">
                <h3 className="text-lg font-semibold uppercase tracking-widest text-primary mb-4">Presence</h3>
                <p>In a world of noise, true presence speaks through the quiet confidence of impeccable tailoring. Commanding, sophisticated pieces.</p>
              </div>
              <div className="border border-border/30 p-8">
                <h3 className="text-lg font-semibold uppercase tracking-widest text-primary mb-4">Power</h3>
                <p>Where raw strength meets refined aesthetics. Clothing that commands respect before you say a word. Bold, structured garments.</p>
              </div>
              <div className="border border-border/30 p-8">
                <h3 className="text-lg font-semibold uppercase tracking-widest text-primary mb-4">Attitude</h3>
                <p>Fashion is not about fitting in. It is about standing apart with unapologetic conviction. Expressive, distinctive fashion.</p>
              </div>
            </div>

            <h2 className="font-magazine italic text-3xl md:text-4xl font-light text-foreground !mt-16 !mb-8">Our Promise</h2>
            <p>
              We source only the finest fabrics and materials, working with skilled artisans who share our passion for perfection. From premium imported cotton to luxurious linen, every material is chosen for its quality, comfort, and durability. Our designs are created in-house, drawing inspiration from global fashion while staying true to our Indian roots.
            </p>
            <p>
              At VPPA Fashions, we believe that what you wear is a reflection of who you are. That's why every stitch, every fabric, every silhouette is crafted for men who lead, not follow.
            </p>

            <h2 className="font-magazine italic text-3xl md:text-4xl font-light text-foreground !mt-16 !mb-8">Visit Our Store</h2>
            <p>
              No.161/1, Ground Floor, 100 Feet Rd, 3rd Block, Sir M Vishveswaraya Layout, Ullal, Bengaluru, Karnataka 560110
            </p>
            <p>Phone: +91 90716 91999</p>
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
