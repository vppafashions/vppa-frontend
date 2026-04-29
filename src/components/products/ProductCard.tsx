import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../data/products';
import { getProductUrl } from '../../hooks/useProducts';
interface ProductCardProps {
  product: Product;
}
export function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.inStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0);
  return (
    <Link to={getProductUrl(product)} className="group block">
      <div className="relative aspect-square overflow-hidden bg-accent/20 mb-4">
        <img
          src={product.images[0]}
          alt={product.name}
          className={`object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 ${outOfStock ? 'opacity-50' : ''}`} />
        {outOfStock && (
          <div className="absolute top-3 left-3 bg-foreground text-background text-xs uppercase tracking-widest px-3 py-1.5 font-medium">
            Sold Out
          </div>
        )}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <div className="bg-background/95 backdrop-blur-sm text-foreground text-center py-3 text-sm uppercase tracking-widest font-medium border border-border/50">
            Quick View
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
      </div>
    </Link>);

}
