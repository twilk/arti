'use client';

import Image from 'next/image';
import type { Artwork as ArtworkType } from '@/data/artworks';
import { site } from '@/config/site';

/** Alt text per the brief: title, year and artist - never a description of the subject. */
export function artworkAlt(artwork: ArtworkType) {
  return `${artwork.title}${artwork.year ? `, ${artwork.year}` : ''} — ${site.artistName}`;
}

type Props = {
  artwork: ArtworkType;
  /** The first images are above the fold on every breakpoint, so they load eagerly. */
  priority?: boolean;
  onOpen: () => void;
};

export default function Artwork({ artwork, priority = false, onOpen }: Props) {
  const meta = [artwork.year, artwork.dimensions].filter(Boolean).join(' · ');

  return (
    <figure className="mb-14 break-inside-avoid sm:mb-20">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${artwork.title} in full view`}
        className="group block w-full cursor-zoom-in"
      >
        <Image
          src={artwork.src}
          alt={artworkAlt(artwork)}
          width={artwork.width}
          height={artwork.height}
          sizes="(min-width: 1024px) 44vw, (min-width: 768px) 46vw, 92vw"
          placeholder="blur"
          blurDataURL={artwork.blurDataURL}
          priority={priority}
          /* h-auto with the intrinsic width/height keeps the natural ratio: no crop, no stretch. */
          className="h-auto w-full transition-opacity duration-300 ease-out group-hover:opacity-85"
        />
      </button>
      <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="font-display text-[1.0625rem] leading-snug">{artwork.title}</span>
        {meta && <span className="text-xs tracking-wide text-muted">{meta}</span>}
      </figcaption>
    </figure>
  );
}
