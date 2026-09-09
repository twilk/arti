import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import fs from 'node:fs';
import path from 'node:path';
import Kata from '@/components/quest/Kata';
import { kataPoId, katy } from '@/config/quest/katas';

export const metadata: Metadata = {
  title: 'Kata',
  robots: { index: false, follow: false },
};

/**
 * Nastepna kata to pierwsza jeszcze nieskonczona, patrzac od tej biezacej dalej
 * i zawijajac na poczatek talii. Bez tego po skonczonej katcie zostaje sie na niej
 * i trzeba znac droge powrotna - a rytm "codziennie jedna" rozbija sie o szukanie,
 * gdzie sie wlasciwie jest.
 */
function nastepnaKata(biezaca: string) {
  let skonczone: Set<string>;
  try {
    const postep = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), '.quest', 'progress.json'), 'utf8'),
    ) as { katy?: Record<string, { skonczona?: boolean }> };
    skonczone = new Set(
      Object.entries(postep.katy ?? {})
        .filter(([, k]) => k.skonczona)
        .map(([id]) => id),
    );
  } catch {
    skonczone = new Set();
  }

  const odKtorej = katy.findIndex((k) => k.id === biezaca);
  const wKolejnosci = [...katy.slice(odKtorej + 1), ...katy.slice(0, odKtorej)];
  return wKolejnosci.find((k) => !skonczone.has(k.id)) ?? null;
}

// Ktora kata jest nastepna, zalezy od postepu zapisanego na dysku, a ten zmienia sie
// miedzy wejsciami. Generowanie statyczne zamrozilo by ten wybor w chwili budowania -
// dokladnie ten blad byl juz raz na ekranie misji.
export const dynamic = 'force-dynamic';

export default async function StronaKaty({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kata = kataPoId.get(id);
  if (!kata) notFound();
  const nastepna = nastepnaKata(id);
  const numer = katy.findIndex((k) => k.id === id) + 1;

  return (
    <div className="mx-auto w-full max-w-[1000px] px-6 py-16 sm:px-10">
      <header className="pb-12">
        <p className="text-[0.7rem] uppercase tracking-[0.28em] text-muted">
          <a href="/dev/mission" className="inline-block py-1 underline decoration-rule underline-offset-[6px] transition-colors hover:decoration-ink">
            Baza misji
          </a>{' '}
          · Kata {numer} z {katy.length}
        </p>
        <h1 className="mt-5 font-display text-[clamp(2rem,6vw,3.25rem)] leading-[0.95] tracking-[-0.015em]">
          Piaskownica
        </h1>
        <p className="mt-6 max-w-[54ch] text-sm leading-relaxed text-muted">
          Tu nic nie da się zepsuć. Ta karta pracy nie jest komponentem prawdziwej strony —
          to osobny rysunek, który istnieje wyłącznie na tym ekranie. Cokolwiek zrobisz,
          portfolio zostaje nietknięte.
        </p>
      </header>

      <Kata kata={kata} nastepna={nastepna} />
    </div>
  );
}
