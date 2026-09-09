'use client';

import { useCallback, useMemo, useState } from 'react';
import type { Artwork as ArtworkType } from '@/data/artworks';
import { eagerIndices } from '@/lib/column-heads';
import Artwork from './Artwork';
import Lightbox from './Lightbox';

/**
 * CSS multi-column masonry. Each artwork keeps its own height, so portrait, square
 * and landscape works sit together without any of them being cropped to a common box.
 */
export default function Gallery({ artworks }: { artworks: ArtworkType[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // The head of each column is above the fold whatever the breakpoint, so those load
  // eagerly. Everything else stays lazy, which keeps the gallery cheap as it grows.
  const eager = useMemo(() => eagerIndices(artworks), [artworks]);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + artworks.length) % artworks.length)),
    [artworks.length],
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % artworks.length)),
    [artworks.length],
  );

  if (artworks.length === 0) {
    return (
      <p className="text-sm text-muted">
        No artworks found. Add images to <code>/sources</code> and run{' '}
        <code>npm run artworks</code>.
      </p>
    );
  }

  return (
    <>
      <div className="columns-1 gap-x-10 md:columns-2 lg:gap-x-20">
        {artworks.map((artwork, i) => (
          <Artwork
            key={artwork.id}
            artwork={artwork}
            priority={eager.has(i)}
            onOpen={() => setOpenIndex(i)}
          />
        ))}
      </div>
      <Lightbox
        artworks={artworks}
        index={openIndex}
        onClose={close}
        onPrev={prev}
        onNext={next}
      />
    </>
  );
}
