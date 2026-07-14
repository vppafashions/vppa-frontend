import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HeartIcon, ChevronDownIcon } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';

function getDisplayImages(
  product: NonNullable<ReturnType<typeof useProduct>['product']>,
  selectedColor: string
) {
  if (selectedColor && product.colorImages?.[selectedColor]?.length) {
    return product.colorImages[selectedColor];
  }
  return product.images;
}

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProduct(id);
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('description');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      setSelectedSize('');
      setSelectedColor(product.colors[0] || '');
      setActiveImage(0);
      setQuantity(1);
    }
  }, [product]);

  if (loading) {
    return (
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
            <div className="lg:w-3/5 aspect-square bg-accent/10 animate-pulse" />
            <div className="lg:w-2/5 space-y-6">
              <div className="h-8 bg-accent/10 animate-pulse w-3/4" />
              <div className="h-6 bg-accent/10 animate-pulse w-1/4" />
              <div className="h-40 bg-accent/10 animate-pulse" />
            </div>
          </div>
        </div>
      </main>);
  }

  if (!product || error) {
    return <div className="pt-32 text-center h-screen">Product not found</div>;
  }

  const displayImages = getDisplayImages(product, selectedColor);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity,
      image: displayImages[0] || product.images[0],
    });
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const plainDescription = product.description.replace(/<[^>]+>/g, '');

  return (
    <main className="pt-20 pb-24">
      <div className="container mx-auto px-4 md:px-8 py-8">
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
          <div className="lg:w-3/5 flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible md:w-24 flex-shrink-0">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 md:w-full aspect-square flex-shrink-0 border ${activeImage === idx ? 'border-primary' : 'border-transparent'} overflow-hidden`}>
                  <img
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 aspect-square bg-accent/10">
              <img
                src={displayImages[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="lg:w-2/5 flex flex-col">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest text-primary mb-2">
                {product.collectionSlug} Collection
              </p>
              <h1 className="font-serif text-3xl md:text-4xl mb-4">
                {product.name}
              </h1>
              <p className="text-2xl font-light">
                ₹{product.price.toLocaleString('en-IN')}
              </p>
            </div>

            {product.colors.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between mb-3">
                  <span className="text-sm uppercase tracking-widest">Color</span>
                  <span className="text-sm text-muted-foreground">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setActiveImage(0);
                      }}
                      className={`px-4 py-2 border text-sm uppercase tracking-widest transition-colors ${selectedColor === color ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'}`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <div className="flex justify-between mb-3">
                <span className="text-sm uppercase tracking-widest">Size</span>
                <button className="text-xs uppercase tracking-widest text-muted-foreground underline underline-offset-4">
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 border text-sm uppercase tracking-widest transition-colors ${selectedSize === size ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mb-12">
              <Button onClick={handleAddToCart} className="flex-1 h-14 text-sm" variant="primary">
                Add to Bag
              </Button>
              <Button variant="outline" size="icon" className="h-14 w-14 flex-shrink-0">
                <HeartIcon className="w-5 h-5" />
              </Button>
            </div>

            <div className="border-t border-border/50">
              <div className="border-b border-border/50">
                <button
                  className="w-full py-5 flex justify-between items-center uppercase tracking-widest text-sm"
                  onClick={() => toggleAccordion('description')}>
                  Description
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${activeAccordion === 'description' ? 'rotate-180' : ''}`} />
                </button>
                {activeAccordion === 'description' && (
                  <div className="pb-5 text-muted-foreground text-sm leading-relaxed">
                    {plainDescription}
                  </div>
                )}
              </div>

              <div className="border-b border-border/50">
                <button
                  className="w-full py-5 flex justify-between items-center uppercase tracking-widest text-sm"
                  onClick={() => toggleAccordion('details')}>
                  Fabric & Care
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${activeAccordion === 'details' ? 'rotate-180' : ''}`} />
                </button>
                {activeAccordion === 'details' && (
                  <div
                    className="pb-5 text-muted-foreground text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: product.fabricCare || '<p>Premium imported materials. Dry clean recommended.</p>',
                    }} />
                )}
              </div>

              <div className="border-b border-border/50">
                <button
                  className="w-full py-5 flex justify-between items-center uppercase tracking-widest text-sm"
                  onClick={() => toggleAccordion('shipping')}>
                  Shipping & Returns
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${activeAccordion === 'shipping' ? 'rotate-180' : ''}`} />
                </button>
                {activeAccordion === 'shipping' && (
                  <div className="pb-5 text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                    {product.returnPolicy ||
                      'Complimentary express shipping on all orders. Returns accepted within 14 days of delivery.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>);
}