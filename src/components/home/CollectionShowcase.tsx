import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
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
    <div className="w-full bg-background">
      {/* VELOCITY - Chapter 01 (Image Left, Text Right) */}
      <section className="md:min-h-screen flex flex-col md:flex-row w-full border-b border-border/30">
        <div className="w-full md:w-[60%] h-[40vh] md:h-screen relative overflow-hidden group">
          <img
            src={velocity.image}
            alt={velocity.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          
        </div>
        <div className="w-full md:w-[40%] flex flex-col justify-center px-6 py-8 md:p-16 lg:p-24 bg-background">
          <div className="flex items-center gap-4 mb-4 md:mb-12">
            <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
              Chapter 01
            </span>
            <div className="h-px w-12 bg-primary"></div>
          </div>
          <h2 className="font-magazine italic text-4xl md:text-7xl lg:text-8xl mb-3 md:mb-6 font-light leading-none">
            {velocity.name}
          </h2>
          <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-primary mb-3 md:mb-8">
            {velocity.tagline}
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6 md:mb-12 font-light text-sm md:text-lg">
            {velocity.description}
          </p>
          <Link
            to={`/collection/${velocity.slug}`}
            className="inline-flex items-center gap-4 text-sm tracking-[0.2em] uppercase group/link w-fit">
            
            <span className="border-b border-foreground pb-1 group-hover/link:border-primary transition-colors">
              Explore Collection
            </span>
            <ArrowRightIcon
              className="w-4 h-4 group-hover/link:translate-x-2 transition-transform text-primary"
              strokeWidth={1} />
            
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full flex justify-center py-3 md:py-12">
        <div className="w-1 h-1 rotate-45 bg-primary"></div>
      </div>

      {/* PRESENCE - Chapter 02 (Text Left, Image Right) */}
      <section className="md:min-h-screen flex flex-col-reverse md:flex-row w-full border-b border-border/30">
        <div className="w-full md:w-[40%] flex flex-col justify-center px-6 py-8 md:p-16 lg:p-24 bg-background">
          <div className="flex items-center gap-4 mb-4 md:mb-12">
            <div className="h-px w-12 bg-primary"></div>
            <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
              Chapter 02
            </span>
          </div>
          <h2 className="font-magazine italic text-4xl md:text-7xl lg:text-8xl mb-3 md:mb-6 font-light leading-none">
            {presence.name}
          </h2>
          <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-primary mb-3 md:mb-8">
            {presence.tagline}
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6 md:mb-12 font-light text-sm md:text-lg">
            {presence.description}
          </p>
          <Link
            to={`/collection/${presence.slug}`}
            className="inline-flex items-center gap-4 text-sm tracking-[0.2em] uppercase group/link w-fit">
            
            <span className="border-b border-foreground pb-1 group-hover/link:border-primary transition-colors">
              Explore Collection
            </span>
            <ArrowRightIcon
              className="w-4 h-4 group-hover/link:translate-x-2 transition-transform text-primary"
              strokeWidth={1} />
            
          </Link>
        </div>
        <div className="w-full md:w-[60%] h-[40vh] md:h-screen relative overflow-hidden group">
          <img
            src={presence.image}
            alt={presence.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          
        </div>
      </section>

      {/* Divider */}
      <div className="w-full flex justify-center py-3 md:py-12">
        <div className="w-1 h-1 rotate-45 bg-primary"></div>
      </div>

      {/* POWER - Chapter 03 (Full Bleed Cinematic) */}
      <section className="w-full h-[55vh] md:h-screen relative overflow-hidden group border-b border-border/30">
        <img
          src={power.image}
          alt={power.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <span className="text-xs tracking-[0.4em] uppercase text-primary mb-3 md:mb-8">
            Chapter 03
          </span>
          <h2 className="font-magazine italic text-5xl md:text-8xl lg:text-9xl mb-3 md:mb-6 font-light leading-none">
            {power.name}
          </h2>
          <p className="text-xs md:text-base tracking-[0.3em] uppercase mb-6 md:mb-12 text-white/80 max-w-xl">
            {power.tagline}
          </p>
          <Link
            to={`/collection/${power.slug}`}
            className="inline-flex items-center justify-center px-8 py-4 border border-white/30 hover:bg-white hover:text-black transition-colors text-sm tracking-[0.2em] uppercase">
            
            Explore Collection
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full flex justify-center py-3 md:py-12">
        <div className="w-1 h-1 rotate-45 bg-primary"></div>
      </div>

      {/* ATTITUDE - Chapter 04 (Asymmetric) */}
      <section className="md:min-h-screen container mx-auto px-4 md:px-8 py-8 md:py-24">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-12 lg:gap-24 items-center">
          <div className="w-full lg:w-[70%] relative group overflow-hidden">
            <div className="aspect-[4/5] md:aspect-square w-full">
              <img
                src={attitude.image}
                alt={attitude.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-primary/30 hidden md:block z-[-1]"></div>
          </div>

          <div className="w-full lg:w-[30%] flex flex-col">
            <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3 md:mb-8">
              Chapter 04
            </span>
            <h2 className="font-magazine italic text-4xl md:text-7xl mb-4 md:mb-8 font-light leading-none">
              {attitude.name}
            </h2>

            <div className="relative mb-6 md:mb-12">
              <span className="absolute -top-8 -left-6 font-magazine text-8xl text-primary/20 leading-none">
                "
              </span>
              <p className="text-xl md:text-2xl font-magazine italic leading-relaxed text-foreground relative z-10">
                {attitude.tagline}
              </p>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6 md:mb-12 font-light">
              {attitude.description}
            </p>

            <Link
              to={`/collection/${attitude.slug}`}
              className="inline-flex items-center gap-4 text-sm tracking-[0.2em] uppercase group/link w-fit">
              
              <span className="border-b border-foreground pb-1 group-hover/link:border-primary transition-colors">
                Explore Collection
              </span>
              <ArrowRightIcon
                className="w-4 h-4 group-hover/link:translate-x-2 transition-transform text-primary"
                strokeWidth={1} />
              
            </Link>
          </div>
        </div>
      </section>
    </div>);

}
