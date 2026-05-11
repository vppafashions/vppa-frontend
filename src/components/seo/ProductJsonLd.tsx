import type { Product } from '../../data/products';
import { getProductUrl } from '../../hooks/useProducts';

interface ProductJsonLdProps {
  product: Product;
  aggregateRating?: {
    value: number;
    count: number;
  };
}

export function ProductJsonLd({ product, aggregateRating }: ProductJsonLdProps) {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images[0],
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: 'VPPA Fashions',
    },
    offers: {
      '@type': 'Offer',
      url: `https://vppafashions.com${getProductUrl(product)}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'VPPA Fashions',
      },
    },
    category: product.category,
  };

  if (aggregateRating && aggregateRating.count > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(aggregateRating.value.toFixed(2)),
      reviewCount: aggregateRating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
