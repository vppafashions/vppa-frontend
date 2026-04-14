export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  tagline: string;
}

// Gender-specific overrides for collections
interface GenderCollectionOverrides {
  description: string;
  image: string;
  tagline: string;
}

export const womenOverrides: Record<string, GenderCollectionOverrides> = {
  velocity: {
    description: 'Effortless elegance in motion. Designer squad set kurthis crafted for the woman who moves with purpose and grace.',
    image: 'https://res.cloudinary.com/dp6k1cln0/image/upload/v1776059835/vppa/eyonchfelwbs99v3wc89.png',
    tagline: 'Grace in Motion',
  },
  presence: {
    description: 'Timeless drapes that command admiration. Luxurious sarees woven with heritage and modern sophistication.',
    image: 'https://res.cloudinary.com/dp6k1cln0/image/upload/v1776061937/vppa/reu7slhw9ixbx7lo4a77.jpg',
    tagline: 'Timeless Elegance',
  },
  power: {
    description: 'Bold ethnic wear that celebrates strength. Single piece kurthis with striking silhouettes for the confident woman.',
    image: 'https://res.cloudinary.com/dp6k1cln0/image/upload/v1776061408/vppa/ady44xvbijexeknvsqz4.png',
    tagline: 'Bold Femininity',
  },
  attitude: {
    description: 'Unapologetic style. Designer kurthis with bold patterns and premium fabrics for the fearless woman.',
    image: 'https://res.cloudinary.com/dp6k1cln0/image/upload/v1776060398/vppa/qmhrot0h1kpbacwmzwrz.png',
    tagline: 'Fearless Expression',
  },
};

export const collections: Collection[] = [
{
  id: 'c1',
  name: 'Velocity',
  slug: 'velocity',
  description:
  'Dynamic movement meets uncompromising comfort. Premium sweatshirts and jerseys engineered for the modern pace.',
  image:
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=1000',
  tagline: 'Motion Redefined'
},
{
  id: 'c2',
  name: 'Presence',
  slug: 'presence',
  description:
  'Command the room without saying a word. Exquisite linen and cotton shirts tailored for absolute distinction.',
  image:
  'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=1000',
  tagline: 'Silent Authority'
},
{
  id: 'c3',
  name: 'Power',
  slug: 'power',
  description:
  'Utilitarian luxury. Structured hoodies and cargo trousers that blend tactical function with high-fashion form.',
  image:
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1000',
  tagline: 'Structured Dominance'
},
{
  id: 'c4',
  name: 'Attitude',
  slug: 'attitude',
  description:
  'Unapologetic style. Full arm shirts with bold silhouettes and premium fabrications for the fearless.',
  image:
  'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&q=80&w=1000',
  tagline: 'Fearless Expression'
}];

/** Returns a collection with gender-appropriate overrides applied */
export function getGenderedCollection(collection: Collection, gender: 'men' | 'women'): Collection {
  if (gender === 'women' && womenOverrides[collection.slug]) {
    return { ...collection, ...womenOverrides[collection.slug] };
  }
  return collection;
}
