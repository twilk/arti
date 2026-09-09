// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: kopia galerii do ćwiczeń. Prawdziwa strona jej nie widzi.
//  CO MOŻESZ TU ZMIENIAĆ: wszystko. Tu nic nie da się zepsuć na stałe.
//  CZEGO LEPIEJ NIE RUSZAĆ: importu z config/quest/tokens — to stamtąd
//                           biorą się wartości, które przełączasz.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run quest:dev, potem /dev/quest
// ══════════════════════════════════════════════════════════════════════
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { caption, miaraWiersza, paper, title, wysokoscPrzycisku } from '@/config/quest/tokens';
import type { Artwork } from '@/data/artworks';

/**
 * Wartosci nie sa tu klasami Tailwinda, tylko stylami wprost z pliku tokens.ts.
 * Dzieki temu przelaczenie linii (A) na (B) widac natychmiast, bez zadnej
 * maszynerii posrodku - i dzieki temu panel z suwakami bedzie mogl pisac
 * do tego samego miejsca.
 */
export default function GaleriaQuest({ artworks }: { artworks: Artwork[] }) {
  const [powiekszona, setPowiekszona] = useState<number | null>(null);

  return (
    <div style={{ backgroundColor: paper }}>
      <p
        style={{ color: title, maxWidth: `${miaraWiersza}ch` }}
        className="mb-14 font-display text-[1.0625rem] leading-relaxed"
      >
        Ten akapit istnieje po to, żebyś widziała miarę wiersza. Jego szerokość bierze się
        z jednej liczby w pliku tokens.ts. Przeczytaj go teraz, a potem jeszcze raz, kiedy
        zmienisz tę liczbę — różnica w zmęczeniu oka jest odczuwalna, choć trudno ją nazwać.
        Typografia trzyma się przedziału od czterdziestu pięciu do siedemdziesięciu pięciu
        znaków w linii, bo tyle oko potrafi objąć bez gubienia się przy powrocie.
      </p>

      <div className="columns-1 gap-x-10 md:columns-2">
        {artworks.map((praca, i) => (
          <figure key={praca.id} className="mb-12 break-inside-avoid">
            <button
              type="button"
              onClick={() => setPowiekszona(i)}
              aria-label={`Powiększ pracę ${praca.title}`}
              style={{ minHeight: wysokoscPrzycisku }}
              className="block w-full cursor-zoom-in"
            >
              <Image
                src={praca.src}
                alt={`${praca.title} — praca w kopii do ćwiczeń`}
                width={praca.width}
                height={praca.height}
                sizes="(min-width: 768px) 46vw, 92vw"
                placeholder="blur"
                blurDataURL={praca.blurDataURL}
                className="h-auto w-full"
              />
            </button>
            <figcaption className="mt-3">
              <span style={{ color: title }} className="font-display text-[1.0625rem]">
                {praca.title}
              </span>
              <span style={{ color: caption }} className="ml-3 text-xs tracking-wide">
                praca w kopii do ćwiczeń
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      {powiekszona !== null && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 px-4">
          <Image
            src={artworks[powiekszona].src}
            alt={artworks[powiekszona].title}
            width={artworks[powiekszona].width}
            height={artworks[powiekszona].height}
            sizes="92vw"
            className="h-auto max-h-[74dvh] w-auto max-w-[92vw] object-contain"
          />
          <button
            type="button"
            onClick={() => setPowiekszona(null)}
            style={{ minHeight: wysokoscPrzycisku, minWidth: wysokoscPrzycisku }}
            className="mt-6 px-4 text-xs uppercase tracking-[0.18em] text-white"
          >
            Zamknij
          </button>
        </div>
      )}
    </div>
  );
}
