import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownIcon, ArrowUpRightIcon } from 'lucide-react';
import { useGender } from '../../context/GenderContext';
import { useProducts } from '../../hooks/useProducts';
import type { Product } from '../../data/products';
import { collections, womenOverrides } from '../../data/collections';
import { optimizeCloudinaryUrl } from '../../lib/cloudinary';

const HERO_W = 900;
const SIDE_W = 520;
/** How long each look group stays on screen */
const ROTATE_MS = 5200;
/** Stagger so women/men don't swap at the same instant */
const MEN_OFFSET_MS = 2600;

interface ProductLook {
  id: string;
  image: string;
  name: string;
  href?: string;
}

/** A pair shown together: main hero + optional floating side shot */
interface LookGroup {
  main: ProductLook;
  side?: ProductLook;
}

function getProductImage(product: Product): string | undefined {
  return product.images?.[0] || product.colorImages?.[product.colors[0]]?.[0];
}

function collectDistinctLooks(products: Product[], max: number): ProductLook[] {
  const looks: ProductLook[] = [];
  for (const product of products) {
    const image = getProductImage(product);
    if (!image) continue;
    looks.push({
      id: product.id,
      image,
      name: product.name,
      href: product.slug
        ? product.slug.startsWith('/')
          ? product.slug
          : `/${product.slug}`
        : `/product/${product.id}`,
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
          href: `/collection/${slug}`,
        }))
      : collections
          .map((c) => ({
            id: `collection-men-${c.slug}`,
            image: c.image || womenOverrides[c.slug]?.image || '',
            name: c.name,
            href: `/collection/${c.slug}`,
          }))
          .filter((l) => l.image);

  const seen = new Set(fromApi.map((l) => l.id));
  const padded = [...fromApi];
  for (const look of fallbacks) {
    if (padded.length >= count) break;
    if (!seen.has(look.id) && look.image) {
      seen.add(look.id);
      padded.push(look);
    }
  }
  return padded.slice(0, count);
}

/** Slice flat looks into rotating pairs (main + side). */
function chunkIntoGroups(looks: ProductLook[]): LookGroup[] {
  if (looks.length === 0) return [];
  const groups: LookGroup[] = [];

  for (let i = 0; i < looks.length; i += 2) {
    const main = looks[i];
    const side = looks[i + 1];
    groups.push({ main, side });
  }

  // If only one look, still one group
  if (groups.length === 0 && looks[0]) {
    groups.push({ main: looks[0] });
  }

  // With 3+ looks, also create shifted pairs so more combos rotate
  if (looks.length >= 3) {
    for (let i = 1; i < looks.length; i += 2) {
      const main = looks[i];
      const side = looks[(i + 1) % looks.length];
      if (side.id === main.id) continue;
      // Avoid exact duplicate of an existing group
      const exists = groups.some(
        (g) => g.main.id === main.id && g.side?.id === side.id
      );
      if (!exists) groups.push({ main, side });
    }
  }

  return groups;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function useRotatingIndex(
  length: number,
  intervalMs: number,
  paused: boolean,
  startDelayMs = 0
) {
  const [index, setIndex] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    setIndex(0);
  }, [length]);

  useEffect(() => {
    if (reduced || paused || length <= 1) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;
    const startId = setTimeout(() => {
      intervalId = setInterval(() => {
        setIndex((i) => (i + 1) % length);
      }, intervalMs);
    }, startDelayMs);

    return () => {
      clearTimeout(startId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [length, intervalMs, paused, reduced, startDelayMs]);

  const goTo = useCallback(
    (next: number) => {
      if (length <= 0) return;
      setIndex(((next % length) + length) % length);
    },
    [length]
  );

  return { index, goTo };
}

function HeroPanel({
  group,
  groupIndex,
  groupCount,
  onSelectGroup,
  label,
  sublabel,
  cta,
  to,
  onNavigate,
  align,
  delayClass,
  onHoverChange,
}: {
  group?: LookGroup;
  groupIndex: number;
  groupCount: number;
  onSelectGroup: (i: number) => void;
  label: string;
  sublabel: string;
  cta: string;
  to: string;
  onNavigate: () => void;
  align: 'left' | 'right';
  delayClass: string;
  onHoverChange: (hovered: boolean) => void;
}) {
  const look = group?.main;
  const sideLook = group?.side;
  const mainSrc = look ? optimizeCloudinaryUrl(look.image, HERO_W) : '';
  const sideSrc = sideLook ? optimizeCloudinaryUrl(sideLook.image, SIDE_W) : '';
  const isLeft = align === 'left';

  return (
    <div
      className={`group relative flex min-h-[52vh] md:min-h-0 flex-col justify-end overflow-hidden ${delayClass}`}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      {/* Atmosphere — deep royal navy */}
      <div
        className={`absolute inset-0 ${
          isLeft
            ? 'bg-gradient-to-br from-[#1a2748] via-[#0f1a36] to-[#0a1228]'
            : 'bg-gradient-to-bl from-[#1e2d52] via-[#121f3d] to-[#0a1228]'
        }`}
        aria-hidden="true"
      />

      {/* Crossfading main image — key forces remount + fade */}
      <div
        className={`absolute inset-0 transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04] ${
          isLeft ? 'origin-bottom-left' : 'origin-bottom-right'
        }`}
      >
        {mainSrc ? (
          <div key={look?.id} className="hero-look-fade absolute inset-0">
            <img
              src={mainSrc}
              alt={look?.name || label}
              className={`absolute inset-0 h-full w-full object-contain object-bottom ${
                isLeft ? 'scale-[1.05] translate-x-[-4%]' : 'scale-[1.05] translate-x-[4%]'
              }`}
              loading="eager"
              decoding="async"
            />
          </div>
        ) : (
          <div className="absolute inset-0 animate-pulse bg-white/[0.04]" />
        )}
      </div>

      {/* Cinematic overlays */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060b18] via-[#0a1228]/60 to-[#1a2748]/20"
        aria-hidden="true"
      />
      <div
        className={`pointer-events-none absolute inset-0 ${
          isLeft
            ? 'bg-gradient-to-r from-[#060b18]/75 via-transparent to-transparent'
            : 'bg-gradient-to-l from-[#060b18]/75 via-transparent to-transparent'
        }`}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0a1228]/55 to-transparent"
        aria-hidden="true"
      />

      {/* Floating secondary look */}
      {sideSrc && (
        <div
          className={`pointer-events-none absolute top-[14%] hidden w-[28%] max-w-[160px] opacity-0 transition-all duration-700 group-hover:opacity-100 md:block ${
            isLeft ? 'right-[8%] rotate-3' : 'left-[8%] -rotate-3'
          }`}
        >
          <div className="overflow-hidden rounded-sm border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.55)] ring-1 ring-primary/20">
            <img
              key={sideLook?.id}
              src={sideSrc}
              alt=""
              className="hero-look-fade aspect-[3/4] w-full object-cover object-top"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      )}

      {/* Gold edge accent */}
      <div
        className={`absolute top-[18%] bottom-[22%] w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent ${
          isLeft ? 'right-0' : 'left-0'
        }`}
        aria-hidden="true"
      />

      {/* Copy + CTA */}
      <div
        className={`relative z-10 p-6 sm:p-8 md:p-10 lg:p-12 ${
          isLeft ? 'md:pr-14' : 'md:pl-14 text-right md:text-right'
        }`}
      >
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.42em] text-primary">
          {label}
        </p>
        <h2 className="font-magazine text-3xl font-light italic leading-none text-white sm:text-4xl md:text-[2.75rem] lg:text-5xl">
          {sublabel}
        </h2>
        {look?.name && (
          <p
            key={look.id}
            className={`hero-look-fade mt-3 max-w-xs text-[11px] leading-relaxed tracking-wide text-white/45 line-clamp-2 ${
              isLeft ? '' : 'ml-auto'
            }`}
          >
            {look.name.replace(/^The VPPA\s*/i, '')}
          </p>
        )}

        <Link
          to={to}
          onClick={onNavigate}
          className={`mt-7 inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary backdrop-blur-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground ${
            isLeft ? '' : 'flex-row-reverse'
          }`}
        >
          {cta}
          <ArrowUpRightIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>

        {/* Group dots */}
        {groupCount > 1 && (
          <div
            className={`mt-6 flex items-center gap-2 ${isLeft ? '' : 'justify-end'}`}
            role="tablist"
            aria-label={`${label} looks`}
          >
            {Array.from({ length: groupCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === groupIndex}
                aria-label={`Look group ${i + 1}`}
                onClick={() => onSelectGroup(i)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === groupIndex
                    ? 'w-6 bg-primary'
                    : 'w-1.5 bg-white/25 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function HeroBanner() {
  const { setGender } = useGender();
  const { products: womenProducts, loading: womenLoading } = useProducts({
    gender: 'women',
    limit: 16,
  });
  const { products: menProducts, loading: menLoading } = useProducts({
    gender: 'men',
    limit: 16,
  });

  const womenGroups = useMemo(
    () => chunkIntoGroups(buildGenderLooks(womenProducts, 'women', 12)),
    [womenProducts]
  );
  const menGroups = useMemo(
    () => chunkIntoGroups(buildGenderLooks(menProducts, 'men', 12)),
    [menProducts]
  );

  const [womenPaused, setWomenPaused] = useState(false);
  const [menPaused, setMenPaused] = useState(false);

  const { index: womenIndex, goTo: goWomen } = useRotatingIndex(
    womenGroups.length,
    ROTATE_MS,
    womenPaused,
    0
  );
  const { index: menIndex, goTo: goMen } = useRotatingIndex(
    menGroups.length,
    ROTATE_MS,
    menPaused,
    MEN_OFFSET_MS
  );

  const womenGroup = womenGroups[womenIndex] || womenGroups[0];
  const menGroup = menGroups[menIndex] || menGroups[0];

  // Prefetch next group images for smoother swaps
  useEffect(() => {
    const nextW = womenGroups[(womenIndex + 1) % Math.max(womenGroups.length, 1)];
    const nextM = menGroups[(menIndex + 1) % Math.max(menGroups.length, 1)];
    [nextW?.main, nextW?.side, nextM?.main, nextM?.side].forEach((look) => {
      if (!look?.image) return;
      const img = new Image();
      img.src = optimizeCloudinaryUrl(look.image, look === nextW?.side || look === nextM?.side ? SIDE_W : HERO_W);
    });
  }, [womenIndex, menIndex, womenGroups, menGroups]);

  const loading =
    (womenLoading || menLoading) && !womenGroups[0] && !menGroups[0];

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-[#0a1228] text-white">
      {/* Ambient royal + gold light */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#152448] via-[#0f1a36] to-[#0a1228]" />
        <div className="absolute -left-1/4 top-0 h-[70%] w-[60%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.18),transparent_65%)] blur-2xl" />
        <div className="absolute -right-1/4 bottom-0 h-[70%] w-[60%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(90,120,200,0.22),transparent_65%)] blur-2xl" />
        <div className="absolute left-1/2 top-1/3 h-[50%] w-[40%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.08),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(6,11,24,0.72)_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }}
        />
      </div>

      {/* Top meta bar */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-24 sm:px-8 md:px-10 md:pt-28">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-primary/70" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/55">
            Issue 01 · SS26
          </p>
        </div>
        <p className="hidden text-[10px] uppercase tracking-[0.35em] text-white/35 sm:block">
          House of VPPA
        </p>
        <div className="flex items-center gap-3">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/55">
            New Season
          </p>
          <span className="h-px w-8 bg-primary/70" />
        </div>
      </div>

      {/* Center masthead */}
      <div className="relative z-30 mx-auto max-w-4xl px-5 pb-6 pt-8 text-center sm:px-8 md:pointer-events-none md:absolute md:left-1/2 md:top-[40%] md:-translate-x-1/2 md:-translate-y-1/2 md:pb-0 md:pt-0">
        <div className="hero-fade-up md:rounded-sm md:border md:border-primary/25 md:bg-[#0a1228]/70 md:px-10 md:py-9 md:shadow-[0_30px_80px_rgba(6,11,24,0.65)] md:backdrop-blur-xl md:ring-1 md:ring-primary/20">
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.5em] text-primary md:mb-5">
            Wear Your
          </p>
          <h1 className="font-magazine text-[4.25rem] font-light italic leading-[0.82] tracking-tight text-white sm:text-7xl md:text-8xl lg:text-[7rem]">
            Presence
          </h1>
          <div className="mx-auto mt-5 flex max-w-md items-center gap-4 md:mt-6">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/60" />
            <p className="shrink-0 text-[10px] uppercase tracking-[0.32em] text-white/55">
              For Her &amp; For Him
            </p>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/60" />
          </div>
          <p className="mx-auto mt-4 max-w-sm text-xs font-light leading-relaxed tracking-wide text-white/45 md:mt-5 md:text-[13px]">
            Luxury craft for women and men who lead — not follow.
          </p>
        </div>
      </div>

      {/* Dual editorial panels */}
      <div
        className={`relative z-10 mx-auto mt-2 grid max-w-[1600px] grid-cols-1 gap-px bg-primary/20 md:mt-0 md:min-h-[calc(100svh-11rem)] md:grid-cols-2 ${
          loading ? 'opacity-70' : 'opacity-100'
        } transition-opacity duration-700`}
      >
        <HeroPanel
          group={womenGroup}
          groupIndex={womenIndex}
          groupCount={womenGroups.length}
          onSelectGroup={goWomen}
          label="For Her"
          sublabel="Presence"
          cta="Shop Women"
          to="/collection/presence"
          onNavigate={() => setGender('women')}
          align="left"
          delayClass="hero-fade-up hero-delay-1"
          onHoverChange={setWomenPaused}
        />
        <HeroPanel
          group={menGroup}
          groupIndex={menIndex}
          groupCount={menGroups.length}
          onSelectGroup={goMen}
          label="For Him"
          sublabel="Attitude"
          cta="Shop Men"
          to="/collection/attitude"
          onNavigate={() => setGender('men')}
          align="right"
          delayClass="hero-fade-up hero-delay-2"
          onHoverChange={setMenPaused}
        />
      </div>

      {/* Bottom rail */}
      <div className="relative z-20 border-t border-primary/15 bg-[#0a1228]/85 backdrop-blur-md">
        <div className="flex flex-col items-stretch gap-0 md:flex-row md:items-center md:justify-between">
          <div className="hero-marquee flex-1 overflow-hidden py-3.5 md:py-4">
            <div className="hero-marquee-track flex w-max items-center gap-10 whitespace-nowrap px-6 text-[10px] uppercase tracking-[0.38em] text-white/45">
              {[0, 1].map((dup) => (
                <React.Fragment key={dup}>
                  {['Velocity', 'Presence', 'Power', 'Attitude', 'SS26 Edit', 'House of VPPA'].map(
                    (item) => (
                      <span key={`${dup}-${item}`} className="flex items-center gap-10">
                        <span className="text-primary/90">◆</span>
                        <span>{item}</span>
                      </span>
                    )
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <a
            href="#collections"
            className="group flex items-center justify-center gap-2 border-t border-primary/15 px-6 py-3.5 text-[10px] uppercase tracking-[0.3em] text-white/55 transition-colors hover:text-primary md:border-l md:border-t-0 md:py-4"
          >
            Discover
            <ArrowDownIcon
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5"
              strokeWidth={1.25}
            />
          </a>
        </div>
      </div>
    </section>
  );
}
