'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';
import type { Artwork } from '@/data/artworks';
import { artworkAlt } from './Artwork';

type Props = {
  artworks: Artwork[];
  /** null keeps the dialog closed. */
  index: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function Lightbox({ artworks, index, onClose, onPrev, onNext }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = index !== null;

  // showModal() gives us the focus trap, ESC handling and inert background for free.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDialogElement>) => {
      // Escape is handled explicitly rather than left to the dialog's native dismissal:
      // that path runs through the browser's CloseWatcher, which is not driven by the DOM
      // keydown event and so cannot be verified in an automated pass. Closing twice is a
      // no-op, so this stays correct where the native behaviour does fire.
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNext();
      }
    },
    [onClose, onPrev, onNext],
  );

  // Clicking the empty space around the artwork closes; clicking the artwork itself does not.
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      const target = event.target as HTMLElement;
      if (target === dialogRef.current || target.dataset.backdrop !== undefined) onClose();
    },
    [onClose],
  );

  const artwork = index === null ? null : artworks[index];
  const meta = artwork ? [artwork.year, artwork.dimensions].filter(Boolean).join(' · ') : '';

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="Artwork viewer"
      className="m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0 text-paper"
    >
      {artwork && (
        <div data-backdrop className="flex h-full w-full flex-col items-center justify-center px-4">
          <figure data-backdrop className="flex flex-col items-center">
            <Image
              key={artwork.id}
              src={artwork.src}
              alt={artworkAlt(artwork)}
              width={artwork.width}
              height={artwork.height}
              sizes="92vw"
              placeholder="blur"
              blurDataURL={artwork.blurDataURL}
              priority
              className="h-auto max-h-[74dvh] w-auto max-w-[92vw] object-contain"
            />
            <figcaption className="mt-4 flex flex-wrap items-baseline justify-center gap-x-3 text-center">
              <span className="font-display text-lg">{artwork.title}</span>
              {meta && <span className="text-xs tracking-wide text-white/60">{meta}</span>}
            </figcaption>
          </figure>
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        aria-label="Close viewer"
        className="absolute right-3 top-3 p-3 text-xs uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-paper sm:right-6 sm:top-6"
      >
        Close
      </button>

      {artworks.length > 1 && index !== null && (
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-6 sm:bottom-8">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous artwork"
            className="p-3 text-lg leading-none text-white/70 transition-colors hover:text-paper"
          >
            &#8592;
          </button>
          <span className="text-xs tabular-nums tracking-[0.18em] text-white/60">
            {index + 1} / {artworks.length}
          </span>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next artwork"
            className="p-3 text-lg leading-none text-white/70 transition-colors hover:text-paper"
          >
            &#8594;
          </button>
        </div>
      )}
    </dialog>
  );
}
