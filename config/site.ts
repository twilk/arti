/**
 * Every artist-specific value lives here. Nothing below is duplicated in components,
 * so replacing the placeholders is a single-file edit.
 *
 * Every value marked PLACEHOLDER is stand-in data, not anyone real. Replace them
 * before treating the site as published. `instagram` is intentionally null rather than invented -
 * the Contact section simply omits any link that is null.
 */
export const site = {
  /** PLACEHOLDER - not a real artist name. */
  artistName: 'Arti',
  /** PLACEHOLDER */
  location: 'Warsaw',
  /** PLACEHOLDER */
  discipline: 'Painting',
  /** PLACEHOLDER - short, plain copy. Replace with a real note about the work. */
  bio: 'Placeholder biography. A few plain sentences about the work belong here - what it is made of, what it circles around, where it is made. Replace this text in config/site.ts.',
  /** PLACEHOLDER - not a real address. */
  email: 'arti-noreply@gmail.com',
  /** No handle available - leave null rather than inventing one. */
  instagram: null as string | null,
  /**
   * Production origin, used for the canonical link, Open Graph and the sitemap.
   * arti.vercel.app is held by an unrelated Vercel account and cannot be assigned.
   * Overridden by NEXT_PUBLIC_SITE_URL when set.
   */
  url: 'https://arti-gallery.vercel.app',
} as const;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;
