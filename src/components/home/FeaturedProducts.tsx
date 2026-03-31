import React from 'react';
import { Link } from 'react-router-dom';
import { products } from '../../data/products';
export function FeaturedProducts() {
  // Get 4 products for the editorial grid
  const featuredProducts = products.slice(0, 4);
  const [heroProduct, ...sideProducts] = featuredProducts;
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center text-center mb-24">
          <span className="text-xs tracking-[0.4em] uppercase text-primary mb-6">
            Curated Selection
          </span>
          <h2 className="font-magazine italic text-6xl md:text-7xl lg:text-8xl mb-6 font-light">
            The Edit
          </h2>
          <p className="text-muted-foreground tracking-widest uppercase text-sm max-w-md">
            Handpicked pieces from across our collections
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Large Hero Product */}
          <div className="md:col-span-2 group">
            <Link to={`/product/${heroProduct.id}`} className="block h-full">
              <div className="relative aspect-square overflow-hidden mb-6 bg-accent/10">
                <img
                  src={heroProduct.images[0]}
                  alt={heroProduct.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                
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
                </div>
                <p className="text-lg font-light">
                  ₹{heroProduct.price.toLocaleString('en-IN')}
                </p>
              </div>
            </Link>
          </div>

          {/* Side Column Products */}
          <div className="flex flex-col gap-12">
            {sideProducts.map((product) =>
            <div key={product.id} className="group">
                <Link to={`/product/${product.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden mb-4 bg-accent/10">
                    <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  
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
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-24 text-center">
          <Link
            to="/collection/velocity"
            className="inline-flex items-center justify-center px-12 py-4 border border-foreground hover:bg-foreground hover:text-background transition-colors text-sm tracking-[0.2em] uppercase">
            
            View All Collections
          </Link>
        </div>
      </div>
    </section>);

}
