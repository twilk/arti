import type { Metadata } from 'next';
import GaleriaQuest from '@/components/quest/GaleriaQuest';
import OdczytWartosci from '@/components/quest/OdczytWartosci';
import { artworks } from '@/data/artworks';

export const metadata: Metadata = {
  title: 'Kopia do ćwiczeń',
  robots: { index: false, follow: false },
};

// Wartosci przychodza z pliku, ktory ona edytuje, wiec strona musi byc liczona
// przy kazdym wejsciu - inaczej zamrozilaby stan sprzed jej zmiany.
export const dynamic = 'force-dynamic';

export default function KopiaDoCwiczen() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 py-16 sm:px-10">
      <header className="pb-14">
        <p className="text-[0.7rem] uppercase tracking-[0.28em] text-muted">Kopia do ćwiczeń</p>
        <h1 className="mt-5 font-display text-[clamp(2rem,6vw,3.25rem)] leading-[0.95] tracking-[-0.015em]">
          Tu wolno psuć
        </h1>
        <p className="mt-6 max-w-[54ch] text-sm leading-relaxed text-muted">
          To jest kopia galerii, nie prawdziwa strona. Wszystko, co tu widzisz, bierze wartości
          z pliku <code className="font-sans">config/quest/tokens.ts</code>. Zmień w nim liczbę
          albo kolor, zapisz i odśwież tę stronę — zobaczysz różnicę od razu. Prawdziwe portfolio
          zostaje nietknięte, cokolwiek tu zrobisz.
        </p>
      </header>

      <OdczytWartosci />

      <GaleriaQuest artworks={artworks} />
    </div>
  );
}
