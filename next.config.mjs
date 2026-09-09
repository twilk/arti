/**
 * Trasy questa nazywaja sie `page.quest.tsx`, a nie `page.tsx`. Dopoki `quest.tsx`
 * nie jest na liscie pageExtensions, Next w ogole ich nie widzi: nie sa trasami,
 * nie trafiaja do bundle'a i nie ma ich w sitemapie. To nie jest ukrywanie przez
 * sprawdzenie zmiennej w komponencie - tego kodu po prostu nie ma w produkcji.
 */
const questEnabled = process.env.NEXT_PUBLIC_QUEST === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: questEnabled ? ['tsx', 'ts', 'quest.tsx', 'quest.ts'] : ['tsx', 'ts'],
  images: {
    // Artworks are pre-processed to WebP by scripts/prepare-artworks.mjs.
    // These widths cover the gallery (max ~700px column) and the lightbox (full viewport).
    imageSizes: [320, 420, 640, 828],
    deviceSizes: [640, 828, 1080, 1200, 1600, 1920, 2048],
    formats: ['image/webp'],
  },
};

export default nextConfig;
