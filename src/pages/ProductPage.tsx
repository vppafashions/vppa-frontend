import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HeartIcon, ChevronDownIcon } from 'lucide-react';
import { products as fallbackProducts } from '../data/products';
import { useProduct, useProductBySlug, getProductUrl } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Button } from '../components/ui/Button';
import { SizeGuideModal } from '../components/products/SizeGuideModal';
import { ReviewsSection } from '../components/products/ReviewsSection';
import { StarRating } from '../components/products/StarRating';
import { useReviews } from '../hooks/useReviews';
import { trackViewItem } from '../lib/analytics';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { ProductJsonLd } from '../components/seo/ProductJsonLd';
import { BreadcrumbJsonLd } from '../components/seo/BreadcrumbJsonLd';
import { SocialShare } from '../components/seo/SocialShare';
export function ProductPage() {
  const { id, gender, type, productSlug } = useParams<{
    id: string;
    gender: string;
    type: string;
    productSlug: string;
  }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  // Build slug from URL params if using slug-based route
  const slugFromUrl = productSlug ? `/${gender}/${type}/${productSlug}` : undefined;
  // Fetch from API by slug or ID
  const { product: slugProduct, loading: slugLoading } = useProductBySlug(slugFromUrl);
  const { product: idProduct, loading: idLoading } = useProduct(slugFromUrl ? undefined : id);
  const apiProduct = slugProduct || idProduct;
  const loading = slugFromUrl ? slugLoading : idLoading;
  const staticProduct = id ? fallbackProducts.find((p) => p.id === id) : null;
  const product = apiProduct || staticProduct;
  const wishlisted = product ? isInWishlist(product.id) : false;
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(
    'description'
  );
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Aggregated review data for this product (used by JSON-LD + rating badge).
  const { summary: reviewSummary } = useReviews(product?.id);

  // Per-size availability for the currently selected color, derived from variantInventory.
  // Returns null when the product has no variantInventory data (treat all sizes as available).
  const sizeAvailability = useMemo<Record<string, boolean> | null>(() => {
    if (!product?.variantInventory || product.variantInventory.length === 0) return null;
    const map: Record<string, boolean> = {};
    for (const size of product.sizes) {
      map[size] = selectedColor
        ? product.variantInventory.some(
            (v) =>
              v.size.toLowerCase() === size.toLowerCase() &&
              v.color.toLowerCase() === selectedColor.toLowerCase() &&
              v.stock > 0,
          )
        : product.variantInventory.some(
            (v) => v.size.toLowerCase() === size.toLowerCase() && v.stock > 0,
          );
    }
    return map;
  }, [product, selectedColor]);

  const isSelectedSizeOutOfStock =
    !!selectedSize && !!sizeAvailability && !sizeAvailability[selectedSize];

  // Strip HTML tags for meta description
  const plainDescription = product?.description
    ? product.description.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()
    : '';

  useDocumentHead({
    title: product ? `${product.name} | VPPA Fashions` : 'Product | VPPA Fashions',
    description: product ? plainDescription.slice(0, 155) : 'Premium fashion from VPPA Fashions',
    canonical: product ? `https://vppafashions.com${getProductUrl(product)}` : undefined,
    ogType: 'product',
    ogImage: product?.images[0],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      setSelectedSize('');
      setSelectedColor(product.colors[0]);
      setActiveImage(0);
      setQuantity(1);
      trackViewItem({ id: product.id, name: product.name, price: product.price });
    }
  }, [product]);

  // Clear the selected size when it becomes unavailable for the chosen color.
  useEffect(() => {
    if (selectedSize && sizeAvailability && !sizeAvailability[selectedSize]) {
      setSelectedSize('');
    }
  }, [sizeAvailability, selectedSize]);

  // Get images for the currently selected color
  const currentImages = product
    ? (product.colorImages && selectedColor && product.colorImages[selectedColor])
      ? product.colorImages[selectedColor]
      : product.images
    : [];
  if (loading) {
    return (
      <div className="py-16 text-center h-screen">
        <div className="container mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
            <div className="lg:w-3/5 aspect-square bg-accent/10 animate-pulse rounded" />
            <div className="lg:w-2/5 space-y-4">
              <div className="h-4 w-24 bg-accent/10 animate-pulse rounded" />
              <div className="h-8 w-3/4 bg-accent/10 animate-pulse rounded" />
              <div className="h-6 w-32 bg-accent/10 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!product) {
    return <div className="py-16 text-center h-screen">Product not found</div>;
  }
  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    if (isSelectedSizeOutOfStock) {
      alert('This size is currently out of stock');
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity,
      image: currentImages[0] || product.images[0]
    });
  };
  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };
  return (
    <main className="pb-24">
      <div className="container mx-auto px-4 md:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-8 flex gap-2">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link
            to={`/collection/${product.collectionSlug}`}
            className="hover:text-foreground">
            
            {product.collectionSlug}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* Image Gallery */}
          <div className="lg:w-3/5 flex flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-24 lg:self-start">
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible md:w-24 flex-shrink-0">
              {currentImages.map((img, idx) =>
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-20 md:w-full aspect-square flex-shrink-0 border ${activeImage === idx ? 'border-primary' : 'border-transparent'} overflow-hidden`}>
                
                  <img
                  src={img}
                  alt={`${product.name} view ${idx + 1}`}
                  className="w-full h-full object-cover" />
                
                </button>
              )}
            </div>
            <div className="flex-1 aspect-square bg-accent/10 max-h-[80vh] overflow-hidden">
              <img
                src={currentImages[activeImage] || currentImages[0]}
                alt={product.name}
                className="w-full h-full object-cover" />
              
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-2/5 flex flex-col">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest text-primary mb-2">
                {product.collectionSlug} Collection
              </p>
              <h1 className="font-serif text-3xl md:text-4xl mb-4">
                {product.name}
              </h1>
              {reviewSummary.count > 0 && (
                <a
                  href="#reviews-heading"
                  className="inline-flex items-center gap-2 mb-3 hover:opacity-80"
                >
                  <StarRating value={reviewSummary.avg} size={14} />
                  <span className="text-xs text-muted-foreground">
                    {reviewSummary.avg.toFixed(1)} ({reviewSummary.count} review
                    {reviewSummary.count === 1 ? '' : 's'})
                  </span>
                </a>
              )}
              <p className="text-2xl font-light">
                ₹{product.price.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Color Selection */}
            <div className="mb-8">
              <div className="flex justify-between mb-3">
                <span className="text-sm uppercase tracking-widest">
                  Color{selectedColor ? ` — ${selectedColor}` : ''}
                </span>
              </div>
              {product.colorImages && Object.keys(product.colorImages).some(c => product.colorImages![c]?.length > 0) ? (
                <div className="flex gap-3">
                  {product.colors.map((color) => {
                    const thumb = product.colorImages?.[color]?.[0];
                    return thumb ? (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          setActiveImage(0);
                        }}
                        className={`w-16 h-16 rounded-md border-2 overflow-hidden transition-all ${selectedColor === color ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-foreground/50'}`}
                        aria-label={`Select color ${color}`}
                      >
                        <img
                          src={thumb}
                          alt={color}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ) : (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          setActiveImage(0);
                        }}
                        className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background' : 'border-border'}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex gap-3">
                  {product.colors.map((color) =>
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setActiveImage(0);
                    }}
                    className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background' : 'border-border'}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`} />
                  )}
                </div>
              )}
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <div className="flex justify-between mb-3">
                <span className="text-sm uppercase tracking-widest">Size</span>
                {product.sizeGuideId && (
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-xs uppercase tracking-widest text-muted-foreground underline underline-offset-4"
                  >
                    Size Guide
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {product.sizes.map((size) => {
                  const available = sizeAvailability ? sizeAvailability[size] : true;
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => available && setSelectedSize(size)}
                      disabled={!available}
                      aria-disabled={!available}
                      aria-label={available ? `Select size ${size}` : `Size ${size} — out of stock`}
                      title={available ? undefined : 'Out of stock'}
                      className={`h-12 border text-sm uppercase tracking-widest transition-colors ${
                        isSelected
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border hover:border-foreground'
                      } ${
                        !available
                          ? 'opacity-40 cursor-not-allowed line-through hover:border-border'
                          : ''
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-12">
              <Button
                onClick={handleAddToCart}
                disabled={isSelectedSizeOutOfStock}
                className={`flex-1 h-14 text-sm ${isSelectedSizeOutOfStock ? 'opacity-60 cursor-not-allowed' : ''}`}
                variant="primary">
                
                {isSelectedSizeOutOfStock ? 'Out of Stock' : 'Add to Bag'}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`h-14 w-14 flex-shrink-0 ${wishlisted ? 'bg-red-50 border-red-300 text-red-500' : ''}`}
                onClick={() => {
                  if (!user) {
                    window.location.href = '/login';
                    return;
                  }
                  if (product) {
                    toggleWishlist({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.images[0],
                      collectionSlug: product.collectionSlug,
                    });
                  }
                }}>
                
                <HeartIcon className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Social Share */}
            <div className="mb-12">
              <SocialShare
                url={`https://vppafashions.com${getProductUrl(product)}`}
                title={`${product.name} | VPPA Fashions`}
                description={plainDescription}
              />
            </div>

            {/* Accordions */}
            <div className="border-t border-border/50">
              {/* Description */}
              <div className="border-b border-border/50">
                <button
                  className="w-full py-5 flex justify-between items-center uppercase tracking-widest text-sm"
                  onClick={() => toggleAccordion('description')}>
                  
                  Description
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${activeAccordion === 'description' ? 'rotate-180' : ''}`} />
                  
                </button>
                {activeAccordion === 'description' &&
                <div
                    className="pb-5 text-muted-foreground text-sm leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                }
              </div>

              {/* Details */}
              <div className="border-b border-border/50">
                <button
                  className="w-full py-5 flex justify-between items-center uppercase tracking-widest text-sm"
                  onClick={() => toggleAccordion('details')}>
                  
                  Fabric & Care
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${activeAccordion === 'details' ? 'rotate-180' : ''}`} />
                  
                </button>
                {activeAccordion === 'details' &&
                <div className="pb-5 text-muted-foreground text-sm leading-relaxed">
                    {product.fabricCare ? (
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.fabricCare }} />
                    ) : (
                      <ul className="list-disc pl-4 space-y-2">
                        <li>Premium imported materials</li>
                        <li>Dry clean only recommended</li>
                        <li>Do not bleach</li>
                        <li>Iron on low heat if necessary</li>
                      </ul>
                    )}
                  </div>
                }
              </div>

              {/* Shipping */}
              <div className="border-b border-border/50">
                <button
                  className="w-full py-5 flex justify-between items-center uppercase tracking-widest text-sm"
                  onClick={() => toggleAccordion('shipping')}>
                  
                  Shipping & Returns
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${activeAccordion === 'shipping' ? 'rotate-180' : ''}`} />
                  
                </button>
                {activeAccordion === 'shipping' &&
                <div className="pb-5 text-muted-foreground text-sm leading-relaxed">
                    {product.returnPolicy ? (
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.returnPolicy }} />
                    ) : (
                      <>
                        <p className="mb-2">
                          Complimentary express shipping on all orders.
                        </p>
                        <p>
                          Returns accepted within 14 days of delivery. Items must be
                          in original condition with tags attached.
                        </p>
                      </>
                    )}
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <ReviewsSection productId={product.id} productName={product.name} />
        </div>
      </div>
      {product.sizeGuideId && (
        <SizeGuideModal
          sizeGuideId={product.sizeGuideId}
          isOpen={sizeGuideOpen}
          onClose={() => setSizeGuideOpen(false)}
        />
      )}
      {product && (
        <ProductJsonLd
          product={product}
          aggregateRating={
            reviewSummary.count > 0
              ? { value: reviewSummary.avg, count: reviewSummary.count }
              : undefined
          }
        />
      )}
      {product && (
        <BreadcrumbJsonLd
          items={[
            { name: 'Home', url: 'https://vppafashions.com/' },
            { name: product.collectionSlug, url: `https://vppafashions.com/collection/${product.collectionSlug}` },
            { name: product.name, url: `https://vppafashions.com${getProductUrl(product)}` },
          ]}
        />
      )}
    </main>);

}
