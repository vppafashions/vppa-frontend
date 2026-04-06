export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  sizes: string[];
  colors: string[];
  collectionSlug: string;
  category: string;
  productType?: string;
  sku?: string;
  fabricCare?: string;
  returnPolicy?: string;
}

export const products: Product[] = [
// Velocity - Sweatshirts & Jerseys
{
  id: 'p1',
  name: 'Midnight Velocity Sweatshirt',
  price: 1,
  description:
  'Crafted from heavyweight French terry, this sweatshirt offers a structured yet relaxed silhouette. Features subtle tonal embroidery and ribbed trims.',
  images: [
  'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1578932750355-5eb30ece487f?auto=format&fit=crop&q=80&w=800'],

  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['#0a0a0a', '#333333', '#e5e5e5'],
  collectionSlug: 'velocity',
  category: 'Sweatshirt'
},
{
  id: 'p2',
  name: 'Aero Knit Jersey',
  price: 5999,
  description:
  'A technical knit jersey that breathes with your movement. Features a seamless construction and a modern, slightly cropped fit.',
  images: [
  'https://images.unsplash.com/photo-1618354691229-88d47f285158?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1618354691321-e851c8f2a6b4?auto=format&fit=crop&q=80&w=800'],

  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['#faf9f6', '#0a0a0a'],
  collectionSlug: 'velocity',
  category: 'Jersey'
},
{
  id: 'p3',
  name: 'Momentum Zip Pullover',
  price: 8999,
  description:
  'A versatile half-zip pullover with a high collar. Made from a premium cotton-blend with a subtle sheen.',
  images: [
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1591047139756-4d6b5e0e0e0e?auto=format&fit=crop&q=80&w=800'],

  sizes: ['M', 'L', 'XL', 'XXL'],
  colors: ['#2c3e50', '#0a0a0a'],
  collectionSlug: 'velocity',
  category: 'Sweatshirt'
},
{
  id: 'p4',
  name: 'Kinetic Base Layer',
  price: 4999,
  description:
  'The ultimate foundation piece. A lightweight, form-fitting jersey designed to be worn alone or layered.',
  images: [
  'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1622445275576-721325763afe?auto=format&fit=crop&q=80&w=800'],

  sizes: ['S', 'M', 'L'],
  colors: ['#0a0a0a', '#faf9f6'],
  collectionSlug: 'velocity',
  category: 'Jersey'
},

// Presence - Linen & Cotton Shirts
{
  id: 'p5',
  name: 'Ivory Presence Linen Shirt',
  price: 9999,
  description:
  'Woven from the finest European linen, this shirt offers unparalleled breathability and a natural, elegant drape. Features a spread collar and mother-of-pearl buttons.',
  images: [
  'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1596755094527-c84e1c6e2e3d?auto=format&fit=crop&q=80&w=800'],

  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  colors: ['#faf9f6', '#e5e5e5', '#c9a96e'],
  collectionSlug: 'presence',
  category: 'Linen Shirt'
},
{
  id: 'p6',
  name: 'Onyx Cotton Poplin',
  price: 7999,
  description:
  'A crisp, lightweight cotton poplin shirt tailored for a sharp, modern silhouette. The perfect transition piece from day to night.',
  images: [
  'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1603252109360-909baaf261c7?auto=format&fit=crop&q=80&w=800'],

  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['#0a0a0a'],
  collectionSlug: 'presence',
  category: 'Cotton Shirt'
},
{
  id: 'p7',
  name: 'Dune Textured Overshirt',
  price: 11999,
  description:
  'A heavier weight cotton-linen blend overshirt. Features dual chest pockets and a relaxed fit for effortless layering.',
  images: [
  'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1607345366943-1c7e7e5b5b0e?auto=format&fit=crop&q=80&w=800'],

  sizes: ['M', 'L', 'XL'],
  colors: ['#d2b48c', '#faf9f6'],
  collectionSlug: 'presence',
  category: 'Linen Shirt'
},
{
  id: 'p8',
  name: 'Azure Oxford Button-Down',
  price: 6999,
  description:
  'A reimagined classic. Our Oxford shirt features a softer collar roll and a tailored body, crafted from premium long-staple cotton.',
  images: [
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1602810319428-019690571b5b?auto=format&fit=crop&q=80&w=800'],

  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['#87ceeb', '#faf9f6'],
  collectionSlug: 'presence',
  category: 'Cotton Shirt'
},

// Power - Hoodies & Cargo
{
  id: 'p9',
  name: 'Onyx Power Cargo',
  price: 10999,
  description:
  'Tactical functionality meets luxury tailoring. These cargo trousers feature articulated knees, multiple utility pockets, and a tapered fit.',
  images: [
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1624378439613-f4c0e3e3e3e3?auto=format&fit=crop&q=80&w=800'],

  sizes: ['30', '32', '34', '36'],
  colors: ['#0a0a0a', '#4b5320'],
  collectionSlug: 'power',
  category: 'Cargo'
},
{
  id: 'p10',
  name: 'Monolith Heavyweight Hoodie',
  price: 8999,
  description:
  'An oversized, structured hoodie crafted from 500gsm cotton fleece. Features a crossover hood and dropped shoulders.',
  images: [
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1556821862-33e0e5e2f080?auto=format&fit=crop&q=80&w=800'],

  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['#0a0a0a', '#808080', '#faf9f6'],
  collectionSlug: 'power',
  category: 'Hoodie'
},
{
  id: 'p11',
  name: 'Vanguard Utility Pant',
  price: 9499,
  description:
  'A streamlined take on the cargo pant. Made from a durable cotton-nylon blend with hidden zip pockets and adjustable cuffs.',
  images: [
  'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=600'],

  sizes: ['30', '32', '34', '36'],
  colors: ['#2f4f4f', '#0a0a0a'],
  collectionSlug: 'power',
  category: 'Cargo'
},
{
  id: 'p12',
  name: 'Stealth Zip Hoodie',
  price: 7499,
  description:
  'A sleek, minimalist zip-up hoodie. Features matte black hardware and a tailored fit for a sharper casual look.',
  images: [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600'],

  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['#0a0a0a'],
  collectionSlug: 'power',
  category: 'Hoodie'
},

// Attitude - Full Arm Shirts
{
  id: 'p13',
  name: 'Shadow Attitude Full Sleeve',
  price: 8999,
  description:
  'A bold statement piece. This full-sleeve shirt features an exaggerated collar, concealed placket, and a fluid drape.',
  images: [
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600'],

  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['#0a0a0a', '#4a0e4e'],
  collectionSlug: 'attitude',
  category: 'Full Arm Shirt'
},
{
  id: 'p14',
  name: 'Crimson Silk-Blend Shirt',
  price: 14999,
  description:
  'Luxurious silk-blend fabric that catches the light. Features a relaxed fit and extended cuffs for a dramatic silhouette.',
  images: [
  'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&q=80&w=600'],

  sizes: ['S', 'M', 'L'],
  colors: ['#800000', '#0a0a0a'],
  collectionSlug: 'attitude',
  category: 'Full Arm Shirt'
},
{
  id: 'p15',
  name: 'Eclipse Printed Shirt',
  price: 10999,
  description:
  'Featuring a subtle, tonal abstract print. This shirt is designed to be the focal point of any evening ensemble.',
  images: [
  'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?auto=format&fit=crop&q=80&w=600'],

  sizes: ['M', 'L', 'XL'],
  colors: ['#0a0a0a', '#faf9f6'],
  collectionSlug: 'attitude',
  category: 'Full Arm Shirt'
},
{
  id: 'p16',
  name: 'Alabaster Pleated Shirt',
  price: 12999,
  description:
  'Intricate micro-pleating adds texture and depth to this otherwise minimalist design. A true testament to modern craftsmanship.',
  images: [
  'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?auto=format&fit=crop&q=80&w=600'],

  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['#faf9f6'],
  collectionSlug: 'attitude',
  category: 'Full Arm Shirt'
}];
