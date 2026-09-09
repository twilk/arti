/**
 * Every artist-specific value lives here. Nothing below is duplicated in components,
 * so replacing the placeholders is a single-file edit.
 *
 * Values marked PLACEHOLDER are not real data. Replace them before treating the
 * site as published. `instagram` is intentionally null rather than invented -
 * the Contact section simply omits any link that is null.
 */
export const site = {
  /** PLACEHOLDER - taken from the GitHub account, not a real artist name. */
  artistName: 'TWILK',
  /** PLACEHOLDER */
  location: 'Warsaw',
  /** PLACEHOLDER */
  discipline: 'Painting',
  /** PLACEHOLDER - short, plain copy. Replace with a real note about the work. */
  bio: 'Placeholder biography. A few plain sentences about the work belong here - what it is made of, what it circles around, where it is made. Replace this text in config/site.ts.',
  /** From the GitHub account. */
  email: 'wilczyy@gmail.com',
  /** No handle available - leave null rather than inventing one. */
  instagram: null as string | null,
  /** Production origin. Overridden by NEXT_PUBLIC_SITE_URL when set. */
  url: 'https://arti.vercel.app',
} as const;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;
