import React, { useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowDownIcon, ArrowRightIcon } from 'lucide-react';
import { collections, getGenderedCollection } from '../data/collections';
import { products as fallbackProducts } from '../data/products';
import { ProductCard } from '../components/products/ProductCard';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { useProducts, getProductUrl } from '../hooks/useProducts';
import { useGender } from '../context/GenderContext';
import { isProductSoldOut, UNAVAILABLE_LABEL } from '../lib/stock';
export function CollectionPage() {
  const { slug } = useParams<{
    slug: string;
  }>();
  const contentRef = useRef<HTMLDivElement>(null);
  const { gender } = useGender();
  const collectionIndex = collections.findIndex((c) => c.slug === slug);
  const collection = collectionIndex >= 0 ? getGenderedCollection(collections[collectionIndex], gender) : undefined;

  // Fetch products from Appwrite — API handles slug mapping based on gender
  const { products: apiProducts, loading } = useProducts({ collection: slug, gender });

  const collectionProducts = useMemo(() => {
    const list = apiProducts.length > 0
      ? apiProducts
      : loading ? [] : fallbackProducts.filter((p) => p.collectionSlug === slug);
    // In-stock first; sold-out demoted to the end.
    return [...list].sort((a, b) => Number(isProductSoldOut(a)) - Number(isProductSoldOut(b)));
  }, [apiProducts, loading, slug]);
  // Prefer an in-stock product image for the cinematic hero when available.
  const heroImage =
    collectionProducts.find((p) => !isProductSoldOut(p))?.images?.[0] ||
    collectionProducts[0]?.images?.[0] ||
    collection?.image;
  // Determine next collection for the teaser
  const nextCollectionIndex = (collectionIndex + 1) % collections.length;
  const nextCollection = getGenderedCollection(collections[nextCollectionIndex], gender);
  const genderLabel = gender === 'women' ? "Women's" : "Men's";
  useDocumentHead({
    title: collection ? `${collection.name} ${genderLabel} Collection | VPPA Fashions` : 'Collection | VPPA Fashions',
    description: collection?.description,
    canonical: collection ? `https://vppafashions.com/collection/${collection.slug}` : undefined,
    ogImage: heroImage,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  if (!collection) {
    return (
      <div className="py-16 text-center h-screen">Collection not found</div>);

  }
  // Get collection-specific quote
  const getCollectionQuote = () => {
    if (gender === 'women') {
      switch (slug) {
        case 'velocity':
          return 'Crafted for women who move with purpose. Every drape designed for effortless grace in motion.';
        case 'presence':
          return 'Timeless elegance woven into every thread. Sarees that speak of heritage and quiet sophistication.';
        case 'power':
          return 'Where boldness meets beauty. Ethnic wear that celebrates the strength within every woman.';
        case 'attitude':
          return 'Style is not about fitting in. It is about celebrating your unique expression with fearless confidence.';
        default:
          return 'Redefining modern elegance through uncompromising quality and fearless expression.';
      }
    }
    switch (slug) {
      case 'velocity':
        return 'Built for those who never stand still. Every thread engineered for the relentless pursuit of momentum.';
      case 'presence':
        return 'In a world of noise, true presence speaks through the quiet confidence of impeccable tailoring.';
      case 'power':
        return 'Where raw strength meets refined aesthetics. Clothing that commands respect before you say a word.';
      case 'attitude':
        return 'Fashion is not about fitting in. It is about standing apart with unapologetic conviction.';
      default:
        return 'Redefining modern masculinity through uncompromising quality and fearless expression.';
    }
  };
  // Prefer an in-stock featured piece; fall back to first (possibly sold out).
  const heroProduct =
    collectionProducts.find((p) => !isProductSoldOut(p)) || collectionProducts[0];
  const heroSoldOut = heroProduct ? isProductSoldOut(heroProduct) : false;
  // Show every product in the grid (including the featured hero) so the count
  // matches the backoffice exactly and avoids any "missing item" confusion.
  const gridProducts = collectionProducts;
  return (
    <main className="bg-background">
      {/* 1. Cinematic Hero */}
      <div className="relative h-[85vh] md:h-screen w-full overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={collection.name}
            className="w-full h-full object-cover object-center opacity-80" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end text-white px-4 pb-8 md:pb-24 text-center">
          <span className="text-xs tracking-[0.4em] uppercase text-primary mb-3 md:mb-6">
            {collection.tagline}
          </span>
          <h1 className="font-magazine italic text-5xl md:text-8xl lg:text-9xl mb-3 md:mb-6 font-light leading-none animate-fade-in-up">
            {collection.name}
          </h1>
          <p
            className="text-white/70 font-light max-w-2xl mb-6 md:mb-16 text-sm md:text-base leading-relaxed animate-fade-in-up"
            style={{
              animationDelay: '200ms'
            }}>
            
            {collection.description}
          </p>

          <button
            onClick={scrollToContent}
            className="flex flex-col items-center gap-4 group animate-fade-in-up"
            style={{
              animationDelay: '400ms'
            }}
            aria-label="Scroll to content">
            
            <span className="text-[10px] tracking-[0.3em] uppercase text-white/60 group-hover:text-white transition-colors">
              Explore the Collection
            </span>
            <ArrowDownIcon
              className="w-5 h-5 text-primary animate-bounce"
              strokeWidth={1} />
            
          </button>
        </div>
      </div>

      <div ref={contentRef}>
        {/* 2. Collection Story Section */}
        <section className="py-10 md:py-48 px-4 border-b border-border/30">
          <div className="container mx-auto max-w-5xl text-center">
            <h2 className="font-magazine italic text-2xl md:text-5xl lg:text-6xl leading-snug md:leading-tight lg:leading-tight font-light text-foreground mb-6 md:mb-12">
              "{getCollectionQuote()}"
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-px bg-primary"></div>
              <p className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-muted-foreground">
                — VPPA {collection.name}
              </p>
              <div className="w-8 h-px bg-primary"></div>
            </div>
          </div>
        </section>

        {/* 3. Hero Product Feature */}
        {heroProduct &&
        <section className="md:min-h-screen flex flex-col md:flex-row w-full border-b border-border/30">
            <div className="w-full md:w-[60%] h-[40vh] md:h-screen relative overflow-hidden group">
              <Link
              to={getProductUrl(heroProduct)}
              className="block w-full h-full">
              
                {heroProduct.images[0] ? (
                  <img
                  src={heroProduct.images[0]}
                  alt={heroProduct.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-accent/10 flex items-center justify-center text-muted-foreground">No Image</div>
                )}
              
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            </div>
            <div className="w-full md:w-[40%] flex flex-col justify-center px-6 py-8 md:p-16 lg:p-24 bg-background">
              <div className="flex items-center gap-4 mb-4 md:mb-12">
                <span className="text-xs tracking-[0.3em] uppercase text-primary">
                  Featured Piece
                </span>
                <div className="h-px w-12 bg-primary"></div>
              </div>
              <h3 className="font-magazine italic text-3xl md:text-6xl mb-3 md:mb-6 font-light leading-none">
                {heroProduct.name}
              </h3>
              <p className="text-xl md:text-2xl font-light mb-2">
                ₹{heroProduct.price.toLocaleString('en-IN')}
              </p>
              {heroSoldOut && (
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  {UNAVAILABLE_LABEL}
                </p>
              )}
              <div
                className="text-muted-foreground leading-relaxed mb-6 md:mb-12 mt-2 md:mt-6 font-light text-sm md:text-lg line-clamp-3 md:line-clamp-4"
                dangerouslySetInnerHTML={{ __html: heroProduct.description }}
              />
              <Link
              to={getProductUrl(heroProduct)}
              className="inline-flex items-center gap-4 text-sm tracking-[0.2em] uppercase group/link w-fit">
              
                <span className="border-b border-foreground pb-1 group-hover/link:border-primary transition-colors">
                  {heroSoldOut ? 'Save to wishlist' : 'View Details'}
                </span>
                <ArrowRightIcon
                className="w-4 h-4 group-hover/link:translate-x-2 transition-transform text-primary"
                strokeWidth={1} />
              
              </Link>
            </div>
          </section>
        }

        {/* 4. Product Grid */}
        {gridProducts.length > 0 &&
        <section className="py-10 md:py-32 bg-background">
            <div className="container mx-auto px-4 md:px-8">
              <div className="flex flex-col items-center text-center mb-6 md:mb-20">
                <h2 className="font-magazine italic text-3xl md:text-6xl mb-3 md:mb-6 font-light">
                  The Full Collection
                </h2>
                <div className="flex items-center gap-4 mb-4 md:mb-8">
                  <div className="w-8 h-px bg-border"></div>
                  <span className="text-xs tracking-[0.4em] uppercase text-muted-foreground">
                    {gridProducts.length} Pieces
                  </span>
                  <div className="w-8 h-px bg-border"></div>
                </div>
                <div className="w-1 h-1 rotate-45 bg-primary"></div>
              </div>

              {/* Minimal Filter Bar */}
              <div className="flex justify-between items-center mb-4 pb-3 md:mb-12 md:pb-6 border-b border-border/30">
                <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
                  Showing {gridProducts.length} items
                </div>
              </div>

              {/* Asymmetric Magazine Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 md:gap-y-16">
                {gridProducts.map((product, index) =>
              <div
                key={product.id}
                className={`${gridProducts.length === 3 && index === 0 ? 'md:col-span-2 lg:col-span-2' : ''}`}>
                
                    <ProductCard product={product} />
                  </div>
              )}
              </div>
            </div>
          </section>
        }

        {/* 5. Next Collection Teaser */}
        {nextCollection &&
        <section className="py-10 md:py-40 bg-[#0a0a0a] text-white text-center px-4 border-t border-white/10">
            <div className="container mx-auto max-w-4xl flex flex-col items-center">
              <span className="text-xs tracking-[0.4em] uppercase text-primary mb-3 md:mb-8">
                Continue the Story
              </span>
              <h2 className="font-magazine italic text-4xl md:text-7xl lg:text-8xl mb-3 md:mb-6 font-light text-white/90">
                {nextCollection.name}
              </h2>
              <p className="text-xs md:text-base tracking-[0.2em] uppercase text-white/60 mb-6 md:mb-12 max-w-xl">
                {nextCollection.tagline}
              </p>
              <Link
              to={`/collection/${nextCollection.slug}`}
              className="inline-flex items-center gap-4 text-sm tracking-[0.2em] uppercase group/link w-fit text-white">
              
                <span className="border-b border-white/50 pb-1 group-hover/link:border-primary transition-colors">
                  Discover Chapter
                </span>
                <ArrowRightIcon
                className="w-4 h-4 group-hover/link:translate-x-2 transition-transform text-primary"
                strokeWidth={1} />
              
              </Link>
            </div>
          </section>
        }
      </div>
    </main>);

}
