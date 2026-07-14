import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownIcon } from 'lucide-react';
import { useGender } from '../../context/GenderContext';
import { useProducts } from '../../hooks/useProducts';
import type { Product } from '../../data/products';
import { collections, getGenderedCollection, womenOverrides } from '../../data/collections';
import { optimizeCloudinaryUrl } from '../../lib/cloudinary';

const HERO_IMAGE_WIDTH = 480;
const ACCENT_IMAGE_WIDTH = 320;
const STRIP_IMAGE_WIDTH = 200;

interface ProductLook {
  id: string;
  image: string;
  name: string;
}

function getProductImage(product: Product): string | undefined {
  return product.images?.[0] || product.colorImages?.[product.colors[0]]?.[0];
}

/** One hero image per product — never multiple shots from the same SKU. */
function collectDistinctLooks(products: Product[], max: number): ProductLook[] {
  const looks: ProductLook[] = [];

  for (const product of products) {
    const image = getProductImage(product);
    if (!image) continue;

    looks.push({
      id: product.id,
      image,
      name: product.name,
    });

    if (looks.length >= max) break;
  }

  return looks;
}

function buildGenderLooks(
  products: Product[],
  gender: 'men' | 'women',
  count: number
): ProductLook[] {
  const fromApi = collectDistinctLooks(products, count);
  if (fromApi.length >= count) return fromApi;

  const fallbacks =
    gender === 'women'
      ? Object.entries(womenOverrides).map(([slug, o]) => ({
          id: `collection-${slug}`,
          image: o.image,
          name: collections.find((c) => c.slug === slug)?.name || slug,
        }))
      : [];

  const seenIds = new Set(fromApi.map((l) => l.id));
  const padded = [...fromApi];

  for (const look of fallbacks) {
    if (padded.length >= count) break;
    if (!seenIds.has(look.id)) {
      seenIds.add(look.id);
      padded.push(look);
    }
  }

  return padded.slice(0, count);
}

function interleaveLooks(
  women: ProductLook[],
  men: ProductLook[],
  max: number
): ProductLook[] {
  const result: ProductLook[] = [];
  const seen = new Set<string>();
  let wi = 0;
  let mi = 0;

  while (result.length < max && (wi < women.length || mi < men.length)) {
    if (wi < women.length) {
      const look = women[wi++];
      if (!seen.has(look.id)) {
        seen.add(look.id);
        result.push(look);
      }
    }
    if (result.length >= max) break;
    if (mi < men.length) {
      const look = men[mi++];
      if (!seen.has(look.id)) {
        seen.add(look.id);
        result.push(look);
      }
    }
  }

  return result;
}

type LookSize = 'lg' | 'md' | 'sm';

const sizeMap: Record<LookSize, string> = {
  lg: 'w-[148px] sm:w-[168px] md:w-[190px] lg:w-[210px]',
  md: 'w-[108px] sm:w-[120px] md:w-[132px]',
  sm: 'w-[72px] sm:w-[80px] md:w-[88px]',
};

function FloatingLook({
  image,
  alt,
  label,
  rotate,
  size = 'lg',
  showLabel = true,
  className = '',
}: {
  image: string;
  alt: string;
  label?: string;
  rotate: string;
  size?: LookSize;
  showLabel?: boolean;
  className?: string;
}) {
  const width = size === 'lg' ? HERO_IMAGE_WIDTH : size === 'md' ? ACCENT_IMAGE_WIDTH : STRIP_IMAGE_WIDTH;
  const optimized = optimizeCloudinaryUrl(image, width);

  return (
    <div className={`relative group ${rotate} ${className}`}>
      <div
        className="absolute -inset-3 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full"
        aria-hidden="true" />

      <div className={`relative ${sizeMap[size]}`}>
        <div
          className={`relative overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,0,0,0.65)] ${
            size === 'sm' ? 'rounded-t-2xl rounded-b-sm' : 'rounded-t-[3.5rem] rounded-b-md'
          }`}>
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#2a2520] via-[#1a1816] to-[#0f0f0f]"
            aria-hidden="true" />
          {image ? (
            <img
              src={optimized}
              alt={alt}
              className={`relative z-10 w-full object-contain object-bottom transition-transform duration-700 group-hover:scale-[1.04] ${
                size === 'sm' ? 'aspect-square px-1 py-1' : 'aspect-[3/4] px-2 pt-3 pb-1'
              }`}
              loading="eager"
              decoding="async" />
          ) : (
            <div className={`relative z-10 w-full bg-white/5 animate-pulse ${size === 'sm' ? 'aspect-square' : 'aspect-[3/4]'}`} />
          )}
          {size !== 'sm' && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
          )}
        </div>

        {showLabel && label && size !== 'sm' && (
          <p className="mt-2 md:mt-3 text-[9px] md:text-[10px] tracking-[0.35em] uppercase text-primary font-semibold">
            {label}
          </p>
        )}
      </div>
    </div>);
}

function LookCluster({
  looks,
  gender,
  side,
}: {
  looks: ProductLook[];
  gender: 'men' | 'women';
  side: 'left' | 'right';
}) {
  const [primary, accentA, accentB] = looks;
  const label = gender === 'women' ? 'For Her' : 'For Him';
  const isLeft = side === 'left';

  if (!primary) return null;

  return (
    <div
      className={`hidden lg:block absolute top-0 bottom-0 w-[280px] xl:w-[320px] ${
        isLeft ? 'left-0 xl:-left-2' : 'right-0 xl:-right-2'
      }`}>
      <FloatingLook
        image={primary.image}
        alt={primary.name}
        label={label}
        rotate={isLeft ? '-rotate-7' : 'rotate-7'}
        size="lg"
        className={`absolute ${isLeft ? 'left-6 xl:left-10 top-6' : 'right-6 xl:right-10 top-10'}`} />

      {accentA && (
        <FloatingLook
          image={accentA.image}
          alt={accentA.name}
          rotate={isLeft ? 'rotate-4' : '-rotate-4'}
          size="md"
          showLabel={false}
          className={`absolute ${isLeft ? 'left-0 bottom-20' : 'right-0 bottom-16'} opacity-90`}
        />
      )}

      {accentB && (
        <FloatingLook
          image={accentB.image}
          alt={accentB.name}
          rotate={isLeft ? '-rotate-3' : 'rotate-3'}
          size="sm"
          showLabel={false}
          className={`absolute ${isLeft ? 'left-28 xl:left-36 top-0' : 'right-28 xl:right-36 top-2'} opacity-80`}
        />
      )}
    </div>);
}

function EditorialStrip({ looks }: { looks: ProductLook[] }) {
  if (looks.length === 0) return null;

  return (
    <div className="mt-12 md:mt-14 w-full overflow-hidden">
      <p className="text-center text-[9px] tracking-[0.4em] uppercase text-white/30 mb-4">
        The Edit — New Arrivals
      </p>
      <div className="flex items-center justify-center gap-3 md:gap-4 px-2 overflow-x-auto pb-2 scrollbar-hide">
        {looks.map((look, i) => (
          <FloatingLook
            key={look.id}
            image={look.image}
            alt={look.name}
            rotate={i % 2 === 0 ? '-rotate-2' : 'rotate-2'}
            size="sm"
            showLabel={false}
            className="flex-shrink-0"
          />
        ))}
      </div>
    </div>);
}

export function HeroBanner() {
  const { setGender } = useGender();
  const { products: womenProducts } = useProducts({ gender: 'women', limit: 12 });
  const { products: menProducts } = useProducts({ gender: 'men', limit: 12 });

  const womenLooks = buildGenderLooks(womenProducts, 'women', 3);
  const menLooks = buildGenderLooks(menProducts, 'men', 3);
  const stripLooks = interleaveLooks(
    collectDistinctLooks(womenProducts, 8),
    collectDistinctLooks(menProducts, 8),
    10
  );
  const mobileLooks = interleaveLooks(
    collectDistinctLooks(womenProducts, 4),
    collectDistinctLooks(menProducts, 4),
    4
  );

  const handleGenderNav = (gender: 'men' | 'women') => {
    setGender(gender);
  };

  return (
    <section className="relative w-full min-h-[92vh] bg-[#0a0a0a] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(201,169,110,0.12),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(201,169,110,0.08),transparent_40%)]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
        aria-hidden="true" />

      <div className="relative container mx-auto px-4 md:px-8 pt-28 md:pt-32 pb-12 md:pb-16">
        <p className="text-center text-[10px] md:text-xs tracking-[0.45em] uppercase text-primary mb-8 md:mb-10">
          Issue 01 — Spring/Summer 2026
        </p>

        <div className="relative max-w-6xl mx-auto min-h-[520px] lg:min-h-[480px]">
          <LookCluster looks={womenLooks} gender="women" side="left" />
          <LookCluster looks={menLooks} gender="men" side="right" />

          {/* Tablet side accents */}
          <div className="hidden md:flex lg:hidden absolute inset-y-0 left-0 right-0 justify-between items-center pointer-events-none px-2">
            {womenLooks[0] && (
              <FloatingLook
                image={womenLooks[0].image}
                alt={womenLooks[0].name}
                label="For Her"
                rotate="-rotate-6"
                size="md"
                className="pointer-events-auto -translate-x-2" />
            )}
            {menLooks[0] && (
              <FloatingLook
                image={menLooks[0].image}
                alt={menLooks[0].name}
                label="For Him"
                rotate="rotate-6"
                size="md"
                className="pointer-events-auto translate-x-2" />
            )}
          </div>

          <div className="relative z-20 text-center px-2 md:px-12 lg:px-32 xl:px-40">
            <h1 className="font-serif font-bold uppercase leading-[0.88] tracking-tight text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.25rem] mb-2">
              Wear Your
            </h1>
            <p className="font-magazine italic text-[3.25rem] sm:text-7xl md:text-8xl lg:text-[6.5rem] xl:text-[7.5rem] leading-[0.85] text-primary mb-6 md:mb-8">
              Presence
            </p>

            <p className="text-sm md:text-base tracking-[0.12em] uppercase font-semibold text-white/90 max-w-lg mx-auto mb-1">
              For Her &amp; For Him
            </p>
            <p className="text-xs md:text-sm tracking-[0.25em] uppercase text-white/45 max-w-md mx-auto mb-8 md:mb-10">
              Luxury fashion crafted for women and men who lead
            </p>

            <img
              src="/vppalogo.svg"
              alt="VPPA"
              className="h-10 md:h-12 w-auto invert mx-auto mb-8 md:mb-10 opacity-90" />

            {/* Mobile collage — up to 4 images */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm mx-auto mb-10 md:hidden">
              {mobileLooks.map((look, i) => (
                <FloatingLook
                  key={look.id}
                  image={look.image}
                  alt={look.name}
                  rotate={i % 2 === 0 ? '-rotate-3' : 'rotate-3'}
                  size="sm"
                  showLabel={false}
                  className={i % 2 === 1 ? 'translate-y-3' : ''}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
              <Link
                to="/collection/presence"
                onClick={() => handleGenderNav('women')}
                className="px-7 py-3.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-[10px] md:text-xs tracking-[0.28em] uppercase font-semibold">
                Shop Women
              </Link>
              <Link
                to="/collection/attitude"
                onClick={() => handleGenderNav('men')}
                className="px-7 py-3.5 border border-white/40 hover:bg-white hover:text-black transition-colors text-[10px] md:text-xs tracking-[0.28em] uppercase font-semibold">
                Shop Men
              </Link>
            </div>
          </div>
        </div>

        <EditorialStrip looks={stripLooks} />

        <div className="flex flex-col items-center mt-10 md:mt-12">
          <p className="text-[10px] tracking-[0.2em] uppercase font-light text-white/35 mb-2">
            Discover the Story
          </p>
          <ArrowDownIcon className="w-4 h-4 text-primary animate-bounce" strokeWidth={1} />
        </div>
      </div>
    </section>);
}