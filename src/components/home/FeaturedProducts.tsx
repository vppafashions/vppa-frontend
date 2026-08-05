import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, getProductUrl } from '../../hooks/useProducts';
import { useGender } from '../../context/GenderContext';
import { products as fallbackProducts } from '../../data/products';
import { isProductSoldOut, UNAVAILABLE_LABEL } from '../../lib/stock';
import type { Product } from '../../data/products';

function pickEditProducts(allProducts: Product[], count: number): Product[] {
  const withImages = allProducts.filter((p) => p.images && p.images.length > 0);
  const featured = withImages.filter((p) => p.featured || p.displayOnMainPage);
  const pool = featured.length >= count ? featured : withImages;
  const inStock = pool.filter((p) => !isProductSoldOut(p));
  const soldOut = pool.filter((p) => isProductSoldOut(p));
  return [...inStock, ...soldOut].slice(0, count);
}

function UnavailableBadge() {
  return (
    <span className="absolute top-3 left-3 z-10 bg-background/95 backdrop-blur-sm border border-border/50 px-2.5 py-1 text-[10px] uppercase tracking-widest text-foreground">
      {UNAVAILABLE_LABEL}
    </span>
  );
}

export function FeaturedProducts() {
  const { gender } = useGender();
  const { products: apiProducts, loading } = useProducts({ gender });

  const featuredProducts = useMemo(() => {
    const allProducts = apiProducts.length > 0 ? apiProducts : fallbackProducts;
    return pickEditProducts(allProducts, 4);
  }, [apiProducts]);

  if (featuredProducts.length === 0 && !loading) return null;

  const [heroProduct, ...sideProducts] = featuredProducts;

  if (!heroProduct) return null;

  const heroSoldOut = isProductSoldOut(heroProduct);

  return (
    <section className="py-10 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center text-center mb-8 md:mb-24">
          <span className="text-xs tracking-[0.4em] uppercase text-primary mb-3 md:mb-6">
            Curated Selection
          </span>
          <h2 className="font-magazine italic text-4xl md:text-7xl lg:text-8xl mb-3 md:mb-6 font-light">
            The Edit
          </h2>
          <p className="text-muted-foreground tracking-widest uppercase text-sm max-w-md">
            Handpicked pieces from across our collections
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
            <div className="md:col-span-2 aspect-square bg-accent/10 animate-pulse rounded" />
            <div className="flex flex-col gap-6 md:gap-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square bg-accent/10 animate-pulse rounded" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
            {/* Large Hero Product */}
            <div className="md:col-span-2 group">
              <Link to={getProductUrl(heroProduct)} className="block h-full">
                <div className="relative aspect-square overflow-hidden mb-6 bg-accent/10">
                  {heroProduct.images[0] ? (
                    <img
                      src={heroProduct.images[0]}
                      alt={heroProduct.name}
                      className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${
                        heroSoldOut ? 'opacity-60' : ''
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                  )}
                  {heroSoldOut && <UnavailableBadge />}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-2">
                      {heroProduct.collectionSlug}
                    </p>
                    <h3 className="font-magazine text-3xl md:text-4xl">
                      {heroProduct.name}
                    </h3>
                    {heroSoldOut && (
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mt-2">
                        {UNAVAILABLE_LABEL}
                      </p>
                    )}
                  </div>
                  <p className="text-lg font-light">
                    ₹{heroProduct.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </Link>
            </div>

            {/* Side Column Products */}
            <div className="flex flex-col gap-6 md:gap-12">
              {sideProducts.map((product) => {
                const soldOut = isProductSoldOut(product);
                return (
                  <div key={product.id} className="group">
                    <Link to={getProductUrl(product)} className="block">
                      <div className="relative aspect-square overflow-hidden mb-4 bg-accent/10">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${
                              soldOut ? 'opacity-60' : ''
                            }`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                        )}
                        {soldOut && <UnavailableBadge />}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] tracking-[0.3em] uppercase text-primary">
                          {product.collectionSlug}
                        </p>
                        <h3 className="font-magazine text-2xl">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ₹{product.price.toLocaleString('en-IN')}
                        </p>
                        {soldOut && (
                          <p className="text-xs uppercase tracking-widest text-muted-foreground">
                            {UNAVAILABLE_LABEL}
                          </p>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-24 text-center">
          <Link
            to="/collection/velocity"
            className="inline-flex items-center justify-center px-12 py-4 border border-foreground hover:bg-foreground hover:text-background transition-colors text-sm tracking-[0.2em] uppercase">
            View All Collections
          </Link>
        </div>
      </div>
    </section>
  );
}
