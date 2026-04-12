import type { Product } from '../../data/products';
import { getProductUrl } from '../../hooks/useProducts';

interface ProductJsonLdProps {
  product: Product;
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const jsonLd = {
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
