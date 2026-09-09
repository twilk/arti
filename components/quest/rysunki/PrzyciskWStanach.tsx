// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: rysunek do katy o stanach. Ten sam przycisk pięć razy.
//  CO MOŻESZ TU ZMIENIAĆ: wszystko - to piaskownica.
//  CZEGO LEPIEJ NIE RUSZAĆ: tego, że wszystkie stany widać naraz. O to
//                           właśnie chodzi: normalnie widuje się jeden.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: /dev/kata/stany
// ══════════════════════════════════════════════════════════════════════
import type { Wartosci } from './rodzaje';

const STANY = [
  { klucz: 'domyslny', etykieta: 'domyślny', opis: 'tak wygląda, zanim ktokolwiek go dotknie' },
  { klucz: 'hover', etykieta: 'pod kursorem', opis: 'myszka nad nim, jeszcze nie naciśnięty' },
  { klucz: 'focus', etykieta: 'zaznaczony', opis: 'ktoś doszedł tu tabulatorem' },
  { klucz: 'aktywny', etykieta: 'wciśnięty', opis: 'palec albo przycisk myszy w dół' },
  { klucz: 'wylaczony', etykieta: 'wyłączony', opis: 'jest, ale nie da się go użyć' },
] as const;

/**
 * Piec stanow obok siebie, nie po kolei. Normalnie ogląda sie jeden na raz i dlatego
 * poczatkujacy ich nie widza - a roznica miedzy nimi jest cala trescia tego cwiczenia.
 */
export default function PrzyciskWStanach({ w }: { w: Wartosci }) {
  const przygaszenie = Number(w.przygaszenieWylaczonego) / 100;
  const rozjasnienie = Number(w.rozjasnienieHover) / 100;
  const obrys = Number(w.gruboscObrysu);
  const odsuniecie = Number(w.odsuniecieObrysu);
  const wciecie = Number(w.wcisniecie);

  const stylDla = (klucz: string): React.CSSProperties => {
    const podstawa: React.CSSProperties = {
      backgroundColor: 'var(--color-ink)',
      color: 'var(--color-paper)',
      border: 'none',
      padding: '12px 22px',
      fontSize: '13px',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      minHeight: 44,
    };
    if (klucz === 'hover') {
      return { ...podstawa, backgroundColor: `color-mix(in srgb, var(--color-ink) ${100 - rozjasnienie * 100}%, white)` };
    }
    if (klucz === 'focus') {
      return {
        ...podstawa,
        outline: `${obrys}px solid var(--color-ink)`,
        outlineOffset: `${odsuniecie}px`,
      };
    }
    if (klucz === 'aktywny') {
      return { ...podstawa, transform: `translateY(${wciecie}px)` };
    }
    if (klucz === 'wylaczony') {
      return { ...podstawa, opacity: 1 - przygaszenie, cursor: 'not-allowed' };
    }
    return podstawa;
  };

  return (
    <div className="space-y-6 border border-rule bg-paper p-6">
      {STANY.map((stan) => (
        <div key={stan.klucz} className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="w-40 shrink-0">
            <div className="text-xs uppercase tracking-[0.18em] text-muted">{stan.etykieta}</div>
            <div className="mt-1 text-xs leading-snug text-muted opacity-70">{stan.opis}</div>
          </div>
          {/* Rysunek, nie prawdziwy przycisk - stany sa tu pokazane, nie wywolane. */}
          <span style={stylDla(stan.klucz)} className="inline-flex items-center">
            Napisz do mnie
          </span>
        </div>
      ))}
    </div>
  );
}
