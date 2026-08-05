import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../data/products';
import { getProductUrl } from '../../hooks/useProducts';
import { isProductSoldOut, UNAVAILABLE_LABEL } from '../../lib/stock';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const unavailable = isProductSoldOut(product);

  return (
    <Link to={getProductUrl(product)} className="group block">
      <div className="relative aspect-square overflow-hidden bg-accent/20 mb-4">
        <img
          src={product.images[0]}
          alt={product.name}
          className={`object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 ${
            unavailable ? 'opacity-60' : ''
          }`}
        />
        {unavailable && (
          <span className="absolute top-3 left-3 z-10 bg-background/95 backdrop-blur-sm border border-border/50 px-2.5 py-1 text-[10px] uppercase tracking-widest text-foreground">
            {UNAVAILABLE_LABEL}
          </span>
        )}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <div className="bg-background/95 backdrop-blur-sm text-foreground text-center py-3 text-sm uppercase tracking-widest font-medium border border-border/50">
            {unavailable ? 'Save to Wishlist' : 'Quick View'}
          </div>
        </div>
      </div>
      <div className="space-y-1 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          {product.collectionSlug}
        </p>
        <h3 className="font-serif text-lg text-foreground">{product.name}</h3>
        <p className="text-sm text-muted-foreground">
          ₹{product.price.toLocaleString('en-IN')}
        </p>
        {unavailable && (
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {UNAVAILABLE_LABEL}
          </p>
        )}
      </div>
    </Link>
  );
}
