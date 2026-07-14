import React from 'react';
import { Link } from 'react-router-dom';
import { collections, getGenderedCollection, type Collection } from '../../data/collections';
import { useGender } from '../../context/GenderContext';
import { useProducts } from '../../hooks/useProducts';

// Pulls the newest product image for a given collection+gender from Appwrite,
// falling back to the static `image` defined in collections.ts when the API
// returns nothing (offline, empty collection, etc).
function useCollectionHeroImage(slug: string, gender: 'men' | 'women', fallback: string) {
  const { products } = useProducts({ collection: slug, gender, limit: 1 });
  const image = products[0]?.images?.[0];
  return image || fallback;
}

// Full-bleed cinematic chapter section. Image fills the section, text overlaid.
function ChapterSection({
  chapterLabel,
  collection,
}: {
  chapterLabel: string;
  collection: Collection;
}) {
  return (
    <section className="w-full h-[55vh] md:h-screen relative overflow-hidden group border-b border-border/30">
      <img
        src={collection.image}
        alt={collection.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
        <span className="text-xs tracking-[0.4em] uppercase text-primary mb-3 md:mb-8">
          {chapterLabel}
        </span>
        <h2 className="font-magazine italic text-5xl md:text-8xl lg:text-9xl mb-3 md:mb-6 font-light leading-none">
          {collection.name}
        </h2>
        <p className="text-xs md:text-base tracking-[0.3em] uppercase mb-6 md:mb-12 text-white/80 max-w-xl">
          {collection.tagline}
        </p>
        <Link
          to={`/collection/${collection.slug}`}
          className="inline-flex items-center justify-center px-8 py-4 border border-white/30 hover:bg-white hover:text-black transition-colors text-sm tracking-[0.2em] uppercase"
        >
          Explore Collection
        </Link>
      </div>
    </section>
  );
}

function ChapterDivider() {
  return (
    <div className="w-full flex justify-center py-3 md:py-12">
      <div className="w-1 h-1 rotate-45 bg-primary"></div>
    </div>
  );
}

export function CollectionShowcase() {
  const { gender } = useGender();
  const [velocityBase, presenceBase, powerBase, attitudeBase] = collections.map((c) =>
    getGenderedCollection(c, gender)
  );
  const velocity: Collection = {
    ...velocityBase,
    image: useCollectionHeroImage('velocity', gender, velocityBase.image),
  };
  const presence: Collection = {
    ...presenceBase,
    image: useCollectionHeroImage('presence', gender, presenceBase.image),
  };
  const power: Collection = {
    ...powerBase,
    image: useCollectionHeroImage('power', gender, powerBase.image),
  };
  const attitude: Collection = {
    ...attitudeBase,
    image: useCollectionHeroImage('attitude', gender, attitudeBase.image),
  };
  return (
    <div id="collections" className="w-full bg-background scroll-mt-20">
      <ChapterSection chapterLabel="Chapter 01" collection={velocity} />
      <ChapterDivider />
      <ChapterSection chapterLabel="Chapter 02" collection={presence} />
      <ChapterDivider />
      <ChapterSection chapterLabel="Chapter 03" collection={power} />
      <ChapterDivider />
      <ChapterSection chapterLabel="Chapter 04" collection={attitude} />
    </div>
  );
}
