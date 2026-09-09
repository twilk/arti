/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Artworks are pre-processed to WebP by scripts/prepare-artworks.mjs.
    // These widths cover the gallery (max ~700px column) and the lightbox (full viewport).
    imageSizes: [320, 420, 640, 828],
    deviceSizes: [640, 828, 1080, 1200, 1600, 1920, 2048],
    formats: ['image/webp'],
  },
};

export default nextConfig;
