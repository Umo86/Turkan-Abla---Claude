/**
 * Curated Unsplash imagery for the landing page.
 * All IDs verified to return HTTP 200. Sizes requested per-use via helper.
 */

const BASE = 'https://images.unsplash.com/photo-';

export const img = (id: string, w = 1200, q = 80) =>
  `${BASE}${id}?auto=format&fit=crop&w=${w}&q=${q}`;

export const IMAGES = {
  hero: '1570172619644-dfd03ed5d881', // spa / beauty treatment
  heroCardA: '1519014816548-bf5fe059798b', // facial
  heroCardB: '1540555700478-4be289fbecef', // skincare
  about: '1487412947147-5cebf100ffc2', // portrait
  cta: '1556760544-74068565f05c', // warm massage oils & candle ambience
};

export const SERVICE_IMAGES: Record<string, string> = {
  'Nail Salon': '1604654894610-df63bc536371', // nail art
  'Hair Salon': '1560066984-138dadb4c035', // salon interior
  Beauty: '1596462502278-27bfdc403348', // makeup products
  Massage: '1600334089648-b0d9d3028eb2', // hot stone massage
  Spa: '1583416750470-965b2707b355', // sauna
  'Personal Trainer': '1571019613454-1cb2f99b2d8b', // workout
  'Pet Grooming': '1576201836106-db1758fd1c97', // dog
  Tattoo: '1611501275019-9b5cda994e8d', // back tattoo
};
